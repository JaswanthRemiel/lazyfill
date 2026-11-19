# Setup guide

This guide takes you from a fresh clone to a working lazyfill, with a check after each step so you know it worked. Plan
for about 5 minutes. There is no account to create and no server to set up.

The short version is in the [README](../README.md#setup). Use this page when you want every detail or when something
does not work.

## Contents

1. [What you get](#1-what-you-get)
2. [Before you start](#2-before-you-start)
3. [Get the code and build it](#3-get-the-code-and-build-it)
4. [Load the extension in your browser](#4-load-the-extension-in-your-browser)
5. [Make a profile](#5-make-a-profile)
6. [Try it on the demo form](#6-try-it-on-the-demo-form)
7. [Optional: connect an AI provider](#7-optional-connect-an-ai-provider)
8. [Back up and restore your data](#8-back-up-and-restore-your-data)
9. [Everyday maintenance](#9-everyday-maintenance)
10. [Setup problems and fixes](#10-setup-problems-and-fixes)
11. [Setup checklist](#11-setup-checklist)

## 1. What you get

lazyfill is a browser extension you build from this repository and load into your browser. There is no lazyfill server
and no account.

- The **extension** fills job applications from your profile and tracks what you applied to.
- **Your data** (profiles, resumes, applications, saved answers and settings) is stored only in this browser's extension
  storage. Nothing is uploaded anywhere.
- An **AI key** is optional. It enables resume import and "Generate with lazyfill" answers. Autofill and tracking work
  without it. When you use an AI feature, your browser sends the request straight to the provider you chose.

## 2. Before you start

| You need | Notes |
|---|---|
| Node.js 20 or newer, and npm | Check with `node -v` and `npm -v`. Download from nodejs.org if `node -v` prints a lower version. |
| Git | To clone the repository. |
| Chrome, Edge or Brave, version 114 or newer | Check under the browser's About page. Other Chromium based browsers usually work. Firefox and Safari do not. |
| Optional: a Gemini or OpenAI API key | Only for resume import and answer drafting. |

## 3. Get the code and build it

```sh
git clone https://github.com/JaswanthRemiel/lazyfill.git
cd lazyfill
npm install
npm run build
```

**What the build does.** `npm run build` writes the finished extension to the `dist` folder. It builds the pages and the
background service worker first, then the content script, because content scripts cannot be ES modules.

**Check it worked.** The last lines should say `built in ...`, and the folder should contain a manifest:

```sh
ls dist/manifest.json dist/content.js dist/background.js
```

If any of the three is missing, scroll up in the output for the first error.

Optional but reassuring: `npm test` runs the whole test suite. It should end with all tests passing.

## 4. Load the extension in your browser

1. Open the extensions page: `chrome://extensions` (Chrome), `edge://extensions` (Edge) or `brave://extensions` (Brave).
2. Turn on **Developer mode** (a switch in a corner of the page).
3. Press **Load unpacked** and choose the **`dist` folder** inside the repository. It must be the folder that directly
   contains `manifest.json`, not the repository root.
4. Pin the lazyfill icon: click the puzzle piece in the toolbar, then the pin next to lazyfill.

**Check it worked.** A welcome page opens on its own, and lazyfill appears in the extension list with no error badge.

Notes:

- Chrome keeps loading the extension from the `dist` folder, so do not move or delete it. If you rebuild, press the
  reload icon on the extension's card to pick up the new files.
- Removing the extension deletes its data. Export a backup first (section 8) if you want to keep it.
- The extension runs on every site except LinkedIn. It only reacts when a page looks like a job application, and it
  never submits a form for you.

## 5. Make a profile

1. Open the dashboard (the grid icon in the panel, or the links on the welcome page).
2. Go to **Profiles** and press **+ New profile**.
3. Either fill it in by hand, or press **Import with AI** and choose your resume (PDF, PNG, JPG or WebP; needs the AI
   key from section 7). lazyfill shows a review screen where you tick what to add, and nothing is added until you do.

A profile holds your details, links, work history, education, skills, job preferences, optional demographic answers,
an answer bank and an attached resume. Demographic fields are optional and only used to answer questions that ask for
them. You can keep several profiles and pick one in the panel.

**Check it worked.** The profile appears under **Profiles**, and the panel shows its name.

## 6. Try it on the demo form

The repository includes a harmless practice application form, `dev/demo.html`. Open it either way:

- **As a file.** On the extension's card at `chrome://extensions`, press **Details** and turn on **Allow access to file
  URLs**. Then open `dev/demo.html` in the browser (drag it onto a tab, or use its `file://` address).
- **Served locally.** From the repository root run:

  ```sh
  python3 -m http.server 8080 --directory dev
  ```

  Then open `http://localhost:8080/demo.html`.

1. The lazyfill panel opens on its own in the top right corner. If it does not, click the toolbar icon.
2. Check that the panel shows the profile you want. With more than one profile, use the arrows on the profile card to switch.
3. Press **Autofill**. Watch the fields fill in. lazyfill never submits the form and never ticks consent boxes.
4. Review everything. The panel lists what it filled and what it could not.

On a real application it works the same way: the panel appears when the page looks like an application, you press
**Autofill**, check every field, and submit it yourself.

- Questions lazyfill could not answer are shown; type your answer once and it is remembered for next time, under
  **Saved answers** in the dashboard.
- Each filled or submitted application appears in the dashboard under **Applications**, where you can set a status,
  add notes, search, and export CSV or JSON.
- To draft an answer to an open question, select the question text, right-click, and choose **Generate with lazyfill**
  (needs the AI key from section 7).

## 7. Optional: connect an AI provider

You only need this for **Import with AI** (reading a resume into a profile) and **Generate with lazyfill** (drafting an
answer to a question). The key stays in your browser and goes only to the provider you choose.

**Google Gemini**

1. Open [Google AI Studio](https://aistudio.google.com/apikey), sign in and press **Create API key**.
2. Copy the key.

**OpenAI**

1. Open the [OpenAI platform](https://platform.openai.com/api-keys), sign in and create a secret key.
2. Add some credit under billing, because the API does not run without it.

Then, in the dashboard's **Settings**, find **1 · AI key**:

1. Choose the provider.
2. Paste the key.
3. Press **Save & test key**.

You can leave the model fields empty to use the defaults:

| Field | Used for | Defaults |
|---|---|---|
| Model | Drafting answers | `gemini-2.5-flash`, `gpt-4o-mini` |
| Resume import model | Reading resumes | `gemini-2.5-pro`, `gpt-4o` |

If your key cannot use the stronger resume model, lazyfill falls back to the everyday model and says so on the review
screen. A model name you type yourself is used exactly as typed, with no fallback.

Before you use an AI feature, read the privacy note on that card: the pages of your resume, or the question and a profile
summary, are sent to the provider under its own terms. Free tiers of some providers, Gemini among them, may use what you
send to improve their products; paid plans generally do not.

## 8. Back up and restore your data

Your data lives only in this browser. It is not synced to other browsers or computers, and removing the extension or
clearing browser data deletes it. The **3 · Your data** card in the dashboard's **Settings** handles this:

- **Export backup** downloads one JSON file with your profiles, resumes, applications, saved answers and prompt. Your AI
  key is not included. The file holds personal data, so keep it somewhere private.
- **Restore from backup** replaces everything lazyfill holds in this browser with the backup. Your AI key is kept. The
  file is checked first, and a file that is not a lazyfill backup is refused without changing anything.
- **Delete all data** removes everything lazyfill stores in this browser, including the AI key and settings. It cannot
  be undone.

To move to another computer or browser, export a backup, set lazyfill up there (sections 3 and 4), and restore it.

**Applications** (CSV and JSON) and **Profiles** (JSON) also have their own export buttons, if you only want part of
your data.

## 9. Everyday maintenance

**Update lazyfill**

```sh
git pull
npm install
npm run build
```

Then press the reload icon on the extension's card at `chrome://extensions`. Reloading keeps your data. Removing and
loading the extension again does not, so restore a backup if you did that.

**Remove lazyfill completely.** Optionally press **Delete all data** under **Settings**, then remove the extension from
`chrome://extensions`. Removing the extension also deletes its storage.

## 10. Setup problems and fixes

**Building and loading**

| Problem | Cause and fix |
|---|---|
| `npm install` fails or warns about the engine | Node is too old. Install Node 20 or newer and try again. |
| `npm run build` ends with an error | Read the first error above the summary. A stale `node_modules` is a common cause: delete it, run `npm install`, build again. |
| "Manifest file is missing or unreadable" when loading | You selected the wrong folder. Choose `dist`, the folder that contains `manifest.json`. |
| The extension loads but shows an error button | Open the error, then run `npm run build` again and press the reload icon on the card. |
| Nothing happens on a job page | Click the toolbar icon to open the panel by hand. Some pages never open it by themselves, and pages in a background tab are ignored until shown. LinkedIn is excluded on purpose. |
| The demo form opened as a file shows no panel | Turn on **Allow access to file URLs** on the extension's **Details** page, or serve it locally (section 6). |
| My profiles and applications are gone | The extension was removed and loaded again, or browser data was cleared. Restore your last backup (section 8). |
| "That file is not a lazyfill backup" | Restore needs the file from **Export backup**. Profile and application exports are imported from their own pages instead. |

**AI features**

| Problem | Cause and fix |
|---|---|
| "Save & test key" fails | Check the provider, that the key is complete, and for OpenAI that the account has credit. |
| Resume import says it used the everyday model | Your key cannot use the stronger default. This is only a note. Type a model you have access to in **Resume import model** if you want to force one. |
| "Generate with lazyfill" does nothing | It needs an AI key (section 7), and it refuses legal and identity questions such as work authorization on purpose. |

Still stuck? Open an issue on the project's GitHub page (the flag button in the panel opens a new one) with the exact
message and the step you were on. Do not paste your API key or your personal data.

## 11. Setup checklist

You are done when all of these are true:

- [ ] `npm run build` finished and `dist/manifest.json` exists
- [ ] lazyfill is loaded and pinned, and the welcome page opened
- [ ] You created a profile and the demo form fills from it
- [ ] Optional: an AI key passes **Save & test key**
- [ ] Optional: you exported a backup and kept it somewhere private
