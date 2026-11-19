# Architecture

This document explains how lazyfill is put together, so you can change it with confidence. For installation and use,
see the [README](../README.md).

## Contents

1. [Overview](#overview)
2. [Runtime pieces](#runtime-pieces)
3. [Messaging](#messaging)
4. [Storage](#storage)
5. [The autofill pipeline](#the-autofill-pipeline)
6. [Saved answers](#saved-answers)
7. [Application tracking](#application-tracking)
8. [AI features](#ai-features)
9. [Build outputs](#build-outputs)
10. [Security model](#security-model)
11. [Extending lazyfill](#extending-lazyfill)

## Overview

lazyfill has three runtime pieces and no backend. There is no account and no lazyfill server; everything is stored in
the browser's extension storage.

- A **content script** that runs in every page and every frame. It decides whether the page is a job application,
  shows the panel, fills fields, learns answers and shows the answer card.
- A **service worker** that owns everything with side effects: reading and writing storage, the application tracker,
  backups and the AI calls. Pages never call an AI provider directly.
- **Extension pages**: the panel (an iframe injected into job pages), the dashboard (a tab) and a welcome page. They
  are React apps that talk to the service worker.

The only network traffic the extension makes on its own is to the AI provider you configure, and only when you use an
AI feature.

Design rules that explain most of the code:

1. **Local only.** All data lives in `chrome.storage.local`, so autofill never waits on the network.
2. **One place for secrets and network.** The service worker is the only code that uses the AI key and the only code
   that calls out.
3. **Fail soft.** A site handler that throws must not break the general pass.
4. **Never surprise the user.** Nothing is submitted, nothing the user typed is overwritten, and imported data is
   reviewed before it is added.

## Runtime pieces

### Service worker (`src/background`)

| File | Responsibility |
|---|---|
| `index.ts` | Routes messages, registers the context menu, handles the toolbar click, opens the welcome page on install. |
| `data.ts` | Profiles, the active profile, applications and resumes, read from and written to `chrome.storage.local`. |
| `learned.ts` | Saved answers: read, save, edit, delete, usage counts. Read-modify-write calls are serialised. |
| `backup.ts` | Export backup, restore from backup (with validation) and delete all data. |
| `tracker.ts` | Remembers which job each tab is on and records filled and submitted applications. |
| `ai.ts` | Gemini and OpenAI calls, model fallback, resume extraction. |
| `generate.ts` | "Generate with lazyfill": prompt building, sensitive-question refusal, answer-bank lookup. |

### Content script (`src/content`)

| File | Responsibility |
|---|---|
| `index.ts` | Entry point. Wires messages from the panel and service worker to the engine. Injected once per frame. |
| `host.ts` | Top frame only. Polls for application-like pages, injects the panel iframe, draws the right-edge tab, pushes detection results to the panel. |
| `adapters/` | Per platform detection by hostname and small field tables (Greenhouse, Lever), plus the registry of known platform names. |
| `engine/` | The fill engine. See [The autofill pipeline](#the-autofill-pipeline). |
| `learning.ts`, `hints.ts` | Saved-answer capture after Autofill, and the bolt marker drawn in a shadow DOM layer. |
| `tracking.ts` | Extracts job title, company and description, and detects confirmation pages. |
| `selection.ts`, `answerBox.ts` | The "Generate with lazyfill" card and the search for the answer box that belongs to a question. |

### Extension pages

- `src/panel`: the 360 by 467 panel. Routes: home, profiles, settings. The flag button opens a new GitHub issue in a
  tab (`NEW_ISSUE_URL` in `src/shared/tracker.ts`). It receives platform detection from the host through `postMessage`
  and also asks the tabs API, because the tabs API can see forms inside iframes.
- `src/dashboard`: applications, profiles, profile editor, saved answers, settings, and the resume review dialog.
- `src/welcome`: the page opened on first install.
- `src/ui`: the design tokens (`theme.css`), the small component kit (`kit.tsx`), icons come from lucide.

The panel and dashboard share components and the `send` helper. The theme preference lives in
`chrome.storage.sync` so every surface agrees.

## Messaging

Pages talk to the service worker with `chrome.runtime.sendMessage` and a typed message:

```ts
send({ action: 'listApplications' })  // returns { success, data?, error? }
```

The union of messages is in [`src/shared/messages.ts`](../src/shared/messages.ts) and the router is the `handle`
function in [`src/background/index.ts`](../src/background/index.ts). Every reply has the same envelope, so UI code
never needs to catch. Messages cover profiles, applications, resumes, saved answers, the tracker, the AI features and
backups (`exportBackup`, `importBackup`, `deleteAllData`). None of them involve a login or a session.

Other channels:

| Channel | Direction | Purpose |
|---|---|---|
| `chrome.tabs.sendMessage` with `frameId` | panel to content script | Run Autofill in each frame, ask each frame for its detection result. |
| `window.postMessage` | panel and top page | `panelReady`, `panelVisible`, `closePanel`, `detectInfo`. Only the panel's own frame is accepted. |
| `chrome.storage.onChanged` | any page | Keeps open pages in sync when profiles, applications or the theme change. |
| Context menu click | service worker to every frame | `startSelection`. Only the frame that owns the selection answers. |

## Storage

Everything lazyfill keeps is in the browser's extension storage. There is no cloud copy. The key names are historical
(some say "cache"), and they are kept so existing installs and backups still load.

### Local keys (`chrome.storage.local`)

| Key | Contents |
|---|---|
| `lf_profile_cache` | All profiles. |
| `lf_active_profile_id` | The profile the panel uses. |
| `lf_applications_cache` | The tracked applications. |
| `lf_learned_fields` | Saved answers by profile and platform. |
| `lf_resume_<profileId>` | The resume file attached to a profile, as base64 with its name and type. |
| `lf_prompt_template` | The edited answer prompt. Empty means the built-in one. |
| `lf_ai_settings` | Provider, key and model names. Never leaves the browser except in provider calls, and never in a backup. |

The typed keys are listed in `src/shared/storage.ts` (`getItem` and `setItem`). Session storage
(`chrome.storage.session`) holds `lf_tab_jobs`, the job each tab is on. Sync storage holds the theme (`lf_theme`) and
the "skip result screens" preference.

`chrome.storage` has no transactions, so `learned.ts` serialises its read-modify-write calls. The extension has the
`unlimitedStorage` permission, so resume files are not limited by the default storage quota.

### Backups (`backup.ts`)

Dashboard **Settings, 3 · Your data** sends three messages:

- `exportBackup` returns every `lf_*` key in `chrome.storage.local` except `lf_ai_settings`, wrapped as:

  ```json
  { "format": "lazyfill-backup", "version": 1, "exportedAt": "2026-01-01T00:00:00.000Z", "data": { "lf_profile_cache": [] } }
  ```

  The dashboard downloads it as `lazyfill-backup-<date>.json`.
- `importBackup` parses the text with `parseBackup`, which checks the format name, refuses a newer version, requires a
  `data` object, drops keys that are not `lf_*` and drops `lf_ai_settings`, and checks that the profile and application
  lists are arrays. Only then does it remove the existing `lf_*` keys (except the AI settings) and write the backup's.
- `deleteAllData` clears local, session and sync storage, including the AI key.

A new storage key that starts with `lf_` is included in backups automatically. A new secret must be added to
`SECRET_KEYS` in `backup.ts`.

## The autofill pipeline

Autofill runs in each frame that has fields. The entry point is `autofill(deps)` in
[`src/content/engine/run.ts`](../src/content/engine/run.ts). Detection and matching are separate from filling.

### Detection (`detect.ts`)

Collects `input`, `select` and `textarea` elements, including inside open shadow roots, and builds a `FieldInfo` for
each with its kind (text, textarea, select, radio group, checkbox, combobox, file), label, ARIA label, name, id,
placeholder and autocomplete token. Labels come from `for` attributes, wrapping labels, `aria-labelledby`, nearby
text and, for radio groups and comboboxes, the question text above the group. Hidden and disabled controls are
skipped.

### Matching (`match.ts`, `options.ts`, `values.ts`)

`matchField` maps a field to a profile key (`firstName`, `phone`, `linkedinUrl`, and so on) using, in order: the
adapter's own table, the `autocomplete` token, then regular expressions over the label, ARIA label, name and
placeholder. `valueFor` reads the value from the profile. For selects, radios and comboboxes, `matchOption` picks the
option using aliases, yes and no handling, state abbreviations and country names.

### Filling (`fill.ts`)

Values are set through the native property setter and followed by `input`, `change` and `blur` events, so React and
other frameworks notice them. Comboboxes are opened, typed into and the matching option is clicked. Files are attached
with `DataTransfer`. Radios are clicked.

### Order of work in `autofill()`

1. **Site specific fillers** (`fillSiteSpecific` in `sites.ts`, with handlers in `metaWork.ts`, `googleWork.ts`,
   `bytedance.ts`, `sites2.ts` and `sites3.ts`) run first when the page matches one of their structures. Each one returns what it touched so the general pass skips it.
2. **Workday** (`workday.ts`): resume, jobs, education, skills and websites, in the order the page shows them.
3. **Repeating sections** (`entries.ts`, `repeaters.ts`): for each job and school, make room (one Add click at a time),
   then fill only that entry. Entries are recognised by known ids (for example `company-name-2`) or by labels and the
   nearest heading. When a site opens a form per entry, the engine clicks Add, fills the form, and presses Save or Done.
4. **Skills**: added one at a time, as chips, through an Add button, or by ticking matching checkboxes.
5. **General pass**: every remaining field is matched and filled. A second pass runs after a short wait for questions
   that appear after earlier answers.
6. **Answer bank**: questions matching an answer-bank entry in "always use my saved answer" mode are typed in.
7. **Saved answers**: remaining unanswered questions are replayed from what the user answered before.

Cross cutting behaviour: fields that already have a value are skipped, a phone number gets its country code unless the
page has a separate field, consent boxes are never ticked, and every site specific filler runs inside a try block so
one failure cannot stop the rest.

### Detecting that a page is an application (`host.ts`)

The top frame evaluates the page on load, on DOM changes (debounced), on navigation and on a timer that starts at 600
ms and relaxes to 3 seconds after 20 seconds. A page counts when its host belongs to a known platform or enough of its
fields match known keys. When it first qualifies, the panel opens by itself. A short list of hosts never auto opens it.
Pages in a hidden tab are skipped.

## Saved answers

After Autofill, `learning.ts` finds questions that no profile key answered (`candidates.ts`, `learn.ts`) and watches
them. Only trusted events (real user input, not synthetic fill events) trigger a save, and the answer is stored with
the label, field type, option text and index, so selects and radios can be replayed even if option values change.

Rules in `engine/learn.ts`: password, ID, card, date of birth and similar labels are never saved, consent boxes are
excluded, and long text answers are replayed only on the same host. Answers are scoped to a profile and a platform id.

`learned.ts` stores them in `lf_learned_fields`, grouped by profile and then platform, with a first-seen date, a
last-used date and a usage count for each.

## Application tracking

`tracking.ts` builds the job record for a page: title and company from schema.org JobPosting data when present, else
from the page title, the Open Graph tags and the URL for known platforms. `tracker.ts` remembers the record per tab.

- **Filled**: after Autofill, the record is saved with status `filled`.
- **Submitted**: `watchSubmissions` watches for a confirmation. A confirmation URL always counts. Confirmation text is
  only read while the user has just tried to submit (a submit event or a click on a submit-like button in the last two
  minutes), which keeps the check cheap and avoids false positives. When it fires, the status becomes `submitted` and a
  notification is shown.
- The application id is a hash of the job URL (with tracking parameters and an `/apply` suffix removed), so the filled
  and submitted records are one entry. Statuses you set by hand are never overwritten.

## AI features

All calls go through `callLlm` in `ai.ts`, which builds a Gemini or OpenAI request from a common input: system prompt,
user prompt, optional page images, optional strict JSON schema, temperature and token limit. A 404 on the configured
model triggers one lookup of the key's available models and a retry with a suitable cheap model, which is then
remembered.

### Resume import

```
read.ts (extension page)           ai.ts (service worker)                 resumeImport.ts (shared)
render up to 4 pages to JPEG   ->  Gemini or OpenAI with images,      ->  verifyResume():
extract text layer + hyperlinks    text, links and a strict schema        take email, phone, links from the file
                                   stronger model first, fallback         normalise dates, drop unstated skills
                                   one retry on a cut off reply           flag jobs the text does not mention
                                                                      ->  review screen (resumeReview.ts)
                                                                          nothing is added until ticked
```

- `resume/pdfText.ts` rebuilds lines from pdf.js text items and pairs each hyperlink annotation with the words drawn on
  top of it. It has no browser dependencies, so it is tested on a real PDF.
- The prompt tells the model to trust the images for layout and the text for spelling.
- The schema requires a short verbatim `sourceQuote` for each job and school, which the verifier searches for in the
  text.
- `resumeReview.ts` compares the result with the current profile. Blank fields are ticked by default, differing values
  are not, and entries already present are shown but disabled.

### Answer generation

`generate.ts` refuses sensitive questions, looks up the answer bank, builds the prompt from the template and sends it.
The template is `DEFAULT_PROMPT_TEMPLATE` in `shared/answers.ts` unless the user saved their own; the profile is
reduced by `profileForPrompt` (no contact details). The reply is cleaned (code fences, quotes, bold) and stripped of
dashes. The content script finds the answer box with `answerBox.ts`: the first text area or input that follows the
selected text, widening one ancestor at a time and preferring a textarea.

## Build outputs

| Command | Output | Notes |
|---|---|---|
| `npm run build` | `dist/` | Panel, dashboard and welcome pages, `background.js` (an ES module service worker), then `content.js` and `content.css` from `vite.content.config.ts` as a single IIFE. |
| `vite build --config vite.dev.config.ts` | `dist-dev/` | Harness pages with a mocked `chrome.*` API (`dev/mockChrome.ts`), for screenshots and visual checks. |

The extension manifest is `public/manifest.json`. It exposes only `panel.html` to web pages, with a per-install URL,
so sites cannot detect or embed other parts of the extension.

## Security model

- **No server, no session.** There is no account, login or token. Data never leaves the browser except what an AI
  feature sends to the provider the user configured.
- **The AI key is the only secret.** It is stored in `lf_ai_settings`, read only by the service worker, sent only to the
  provider's API host, and never written to a backup. Content scripts cannot read `chrome.storage.local` data they were
  not sent, and pages cannot read content script memory.
- **Backups are personal data.** An exported backup holds profiles, resumes, applications and saved answers in plain
  JSON. Restoring validates the file and accepts only `lf_*` keys, never the AI settings.
- **Host permissions** are limited to the known applicant tracking systems and the two AI API hosts
  (`generativelanguage.googleapis.com`, `api.openai.com`). The content script still runs on every site except
  LinkedIn, because application forms live on employers' own domains.
- **Untrusted page input**: the content script only accepts `postMessage` from its own panel frame, treats page text as
  data, and builds its overlay UI inside shadow roots so page CSS and scripts cannot reach it.
- **No remote code.** Everything, including the PDF worker, is bundled. The extension has no custom content security
  policy, so the default (no `eval`, no remote scripts) applies.
- **Sensitive questions** are refused for AI drafting, and sensitive field labels are never saved as learned answers.

## Extending lazyfill

### Add a profile field

1. Add it to the type and the empty value in `src/shared/profile.ts`. `normaliseProfileData` copies known keys, so old
   stored profiles upgrade on read.
2. Add a row to the matching section in `src/dashboard/pages/ProfileEditorPage.tsx`.
3. If forms should fill it, add its key to `MatchKey` in `engine/types.ts`, a pattern in `engine/match.ts`, and a case in
   `engine/values.ts`.
4. If it should round-trip through JSON, check `src/shared/profileJson.ts` (the template and the import cleaner).
5. If resume import should find it, add it to `RESUME_SCHEMA` and `verifyResume` in `src/shared/resumeImport.ts`, and to
   the fields list in `src/shared/resumeReview.ts`.
6. Add tests next to each change.

### Add a site handler

1. Write down the page structure you will rely on: the ids, names, roles or data attributes of the fields, the Add and
   Save buttons, and how a new entry appears. Observe it on the live site rather than guessing.
2. If fields have stable ids, add a rule to the id table in `engine/entries.ts`. That is often enough for repeating
   sections, with no new code.
3. Otherwise write a handler `(p: ProfileData) => Promise<SiteResult | null>` that returns `null` when the page is not
   its structure, fills one entry at a time, and reports what it touched. Use the helpers in `engine/siteKit.ts`.
   Register it in `formWidgetHandlers` (`sites2.ts`) or `atsHandlers` (`sites3.ts`), or in the list in `sites.ts`.
4. Add a fixture test next to the handler that builds markup imitating the site, including the Add button that
   appends a new entry, and assert on every field. The fixtures in `workday.test.ts` and `sites2.test.ts` show the
   pattern. Document the markup facts you relied on in `docs/clean-room/SPEC.md`.
5. To have the panel name the platform, add it to the registry in `adapters/registry.ts`.

### Add a message

1. Add a variant to `Message` in `src/shared/messages.ts`.
2. Handle it in the `handle` switch in `src/background/index.ts`.
3. Call `send({ action: '...' })` from the page.

### Change the design

Colours, radii and shadows are CSS variables in `src/ui/theme.css`, mapped to Tailwind utilities
(`bg-background`, `text-muted-foreground`, and so on). Components in `src/ui/kit.tsx` use only those utilities, so a
theme change needs no component edits.
