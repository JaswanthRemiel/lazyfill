# Setup guide

This guide takes you from a fresh clone to a working lazyfill, step by step, with a check after each step so you know
it worked. Plan for about 20 minutes the first time. Most of that is creating your Firebase project, which you only do
once.

The short version is in the [README](../README.md#setup). Use this page when you want every detail or when something
does not work.

## Contents

1. [What you are setting up](#1-what-you-are-setting-up)
2. [Before you start](#2-before-you-start)
3. [Get the code and build it](#3-get-the-code-and-build-it)
4. [Load the extension in your browser](#4-load-the-extension-in-your-browser)
5. [Create your Firebase project](#5-create-your-firebase-project)
6. [Connect the extension to your project](#6-connect-the-extension-to-your-project)
7. [Create your account](#7-create-your-account)
8. [Optional: connect an AI provider](#8-optional-connect-an-ai-provider)
9. [Your first autofill](#9-your-first-autofill)
10. [Optional: host your own web tracker](#10-optional-host-your-own-web-tracker)
11. [Everyday maintenance](#11-everyday-maintenance)
12. [Setup problems and fixes](#12-setup-problems-and-fixes)
13. [Setup checklist](#13-setup-checklist)

## 1. What you are setting up

lazyfill is software you run yourself. There is no lazyfill server and no shared account system. Three pieces fit
together:

```
 your browser                                   your Firebase project (free plan is enough)
+------------------------------+                +-------------------------------------+
| lazyfill extension           |  HTTPS         | Authentication  (email + password)  |
|  - fills job applications    +--------------->| Cloud Firestore (profiles,          |
|  - tracks what you applied to|                |   applications, saved answers)      |
+------------------------------+                +-------------------------------------+
                                                                  ^
 optional                                                         | same project
+------------------------------+                                  |
| your own web tracker         +----------------------------------+
|  (static site on GitHub      |
|   Pages, from your fork)     |
+------------------------------+
```

- The **extension** is built from this repository and loaded into your browser.
- The **Firebase project** is yours. It holds your account and your data. You create it in the Firebase console and
  paste its config into the extension. Nothing about it is stored in the code.
- The **web tracker** is optional. It shows the same application list in any browser. You publish it yourself, from
  your own copy of the repository.
- An **AI key** is also optional. It enables resume import and "Generate with lazyfill" answers. Autofill and tracking
  work without it.

Because the Firebase project belongs to you, only you (and anyone you give access to the project) can see your data.

## 2. Before you start

| You need | Notes |
|---|---|
| Node.js 20 or newer, and npm | Check with `node -v` and `npm -v`. Download from nodejs.org if `node -v` prints a lower version. |
| Git | To clone the repository. |
| Chrome, Edge or Brave, version 114 or newer | Check under the browser's About page. Other Chromium based browsers usually work. Firefox and Safari do not. |
| A Google account | To use the Firebase console. |
| Optional: a GitHub account | Only for hosting your own web tracker. |
| Optional: a Gemini or OpenAI API key | Only for resume import and answer drafting. |

You do not need a credit card for the core setup: the Firebase free plan covers accounts and a personal amount of
stored data.

## 3. Get the code and build it

```sh
git clone https://github.com/JaswanthRemiel/lazyfill.git
cd lazyfill
npm install
npm run build
```

If you plan to host your own tracker or change the code, clone your own fork instead (see
[section 10](#10-optional-host-your-own-web-tracker)).

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
- The extension runs on every site except LinkedIn. It only reacts when a page looks like a job application, and it
  never submits a form for you.

## 5. Create your Firebase project

You do this in a web browser, in the [Firebase console](https://console.firebase.google.com). The console changes its
layout from time to time. The names in bold below are what to look for.

### 5.1 Create the project

1. Sign in with your Google account and press **Create a project** (or **Add project**).
2. Choose any name. The project id Firebase generates from it cannot be changed later, and it is not secret.
3. When asked about Google Analytics, you can turn it off. lazyfill does not use it.
4. Wait for the project to be created, then continue to its overview page.

### 5.2 Register a web app and copy its config

1. On the project overview, press the **Web** icon (`</>`) to add a web app.
2. Give it a nickname, for example `lazyfill`. Leave **Firebase Hosting** unchecked. Press **Register app**.
3. The console shows a block of code that contains `const firebaseConfig = { ... }`. **Copy that whole block** and
   keep the page open, or paste it somewhere safe for the next section.

You can find it again at any time: press the gear icon, choose **Project settings**, stay on **General**, scroll to
**Your apps**, and look under **SDK setup and configuration**, option **Config**.

The block looks like this (yours has your own values):

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

This config identifies your project. Google designs it to be public, and it ships inside every web app that uses
Firebase, so it is not a secret. What actually protects your data is the rules you publish in section 5.5.

### 5.3 Turn on email and password sign-in

1. In the left menu open **Build**, then **Authentication**, and press **Get started**.
2. Open the **Sign-in method** tab and choose **Email/Password**.
3. Turn on the first switch, **Email/Password**. Leave **Email link (passwordless sign-in)** off, because lazyfill does
   not use it. Press **Save**.

### 5.4 Optional: make the emails look right

lazyfill sends a verification email when you create an account and a reset email if you forget your password. Under
**Authentication**, open the **Templates** tab, and for **Email address verification** and **Password reset** you can
set the sender name and reply-to address. Firebase sends these from a `firebaseapp.com` address, so they sometimes land
in spam; checking the spam folder is the first thing to do when an email does not arrive.

### 5.5 Create the database and publish the rules

1. In the left menu open **Build**, then **Firestore Database**, and press **Create database**.
2. Choose a location close to you. **The location cannot be changed later.**
3. Choose **Start in production mode**. Never choose test mode: its rules let anyone read and write your data, and they
   expire after 30 days.
4. Press **Enable** and wait until the empty database appears.
5. Open the **Rules** tab. Delete everything in the editor and paste the full contents of
   [`firestore.rules`](../firestore.rules) from this repository, then press **Publish**.

The rules are short enough to read:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{collection}/{document=**} {
      allow read: if request.auth != null && request.auth.uid == uid && request.auth.token.email_verified == true;
      allow write: if request.auth != null && request.auth.uid == uid && request.auth.token.email_verified == true
        && collection in ['profiles', 'applications', 'resumes', 'reports', 'learned', 'settings'];
    }
  }
}
```

In words: a person can read and write only the documents under `users/<their own id>/`, only after verifying their email
address, and only in the collections lazyfill uses. Everything else is denied. These rules are the security boundary of
your project, so do not skip this step.

### 5.6 Recommended: limit what the API key can do

Because the key is public, restrict it so it can only be used for what lazyfill needs.

1. Open the [Google Cloud console](https://console.cloud.google.com/apis/credentials) with the same Google account and
   select your Firebase project in the project picker at the top.
2. Go to **APIs & Services**, then **Credentials**, and open the key named **Browser key (auto created by Firebase)** or
   the one that matches your `apiKey`.
3. Under **Application restrictions** choose **None**. **Do not restrict by website or HTTP referrer.** The extension
   makes its requests from the browser's extension origin, and a website restriction blocks them.
4. Under **API restrictions** choose **Restrict key** and select **Identity Toolkit API**, **Token Service API** and
   **Cloud Firestore API**. Press **Save**. It can take a few minutes to take effect.

If you later enable billing on the project, also add a budget alert under **Billing**, then **Budgets and alerts**.

## 6. Connect the extension to your project

1. Click the lazyfill toolbar icon on any web page. The panel shows **Connect your Firebase project**. Press
   **Open setup**. (The welcome page and the dashboard's **Settings** tab lead to the same place.)
2. On the **Settings** page, in the **Firebase project** box, paste the config block you copied in section 5.2. You can
   paste it exactly as the console shows it, including `const firebaseConfig =` and the semicolon, or as JSON.
3. Press **Save and connect**.

lazyfill reads the pasted text, asks Firebase whether the key is valid (it sends a request that cannot create
anything), and saves the config in your browser. Your result tells you what to do next:

| Message | Meaning and fix |
|---|---|
| "Saved. lazyfill is now using this Firebase project." | Done. The **Account** card appears below. |
| "Paste the whole config block from the Firebase console, from { to }." | The text did not contain a config object. Copy the whole block again. |
| "The config has no apiKey" or "no projectId" | Part of the block is missing. Copy it again from **Project settings**. |
| "Firebase says this API key is not valid." | The key was copied wrongly or belongs to another project. Copy the block again. |
| "This API key is restricted in a way that blocks the extension." | In the Google Cloud console set **Application restrictions** to **None** (section 5.6). |
| "Saved, but Authentication does not look enabled yet." | Do section 5.3 (press **Get started** under Authentication, then enable Email/Password). |
| "Saved. Could not reach Firebase to check it." | You are offline or a network filter blocked the check. The config is saved; check your connection and continue. |

**Check it worked.** The **Firebase project** card shows **Connected to** followed by your project id.

Your config lives only in this browser. If you switch to a different project later, lazyfill signs you out and clears the
data it cached in this browser. Nothing is deleted from either project.

## 7. Create your account

The account is an ordinary Firebase Authentication user in your own project.

1. On the **Settings** page, in the **Account** card, choose **New here? Create an account**.
2. Enter your email address and a password of at least 8 characters, then press **Create account**.
3. Open the verification email and click its link. A Firebase page confirms the address is verified.
4. Return to lazyfill and press **I've verified**.

Nothing is saved until the address is verified, and the database rules also require it.

**Check it worked.** The card says **Signed in as** and your email. Press **Test connection**. It writes a small test
document to your database and reads it back, and should answer **Connected as** your email. If it fails with a message
about permissions, the rules from section 5.5 are missing or were not published.

Notes:

- If the email does not arrive, check spam, then press **Resend email**.
- **Forgot password?** sends a reset email.
- Use the same email and password on the web tracker if you host one.

## 8. Optional: connect an AI provider

You only need this for **Import with AI** (reading a resume into a profile) and **Generate with lazyfill** (drafting an
answer to a question). The key stays in your browser and goes only to the provider you choose.

**Google Gemini**

1. Open [Google AI Studio](https://aistudio.google.com/apikey), sign in and press **Create API key**.
2. Copy the key.

**OpenAI**

1. Open the [OpenAI platform](https://platform.openai.com/api-keys), sign in and create a secret key.
2. Add some credit under billing, because the API does not run without it.

Then, in the dashboard's **Settings**, find **AI key**:

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

## 9. Your first autofill

### 9.1 Make a profile

1. Open the dashboard (the grid icon in the panel, or the lazyfill toolbar icon, then the grid icon).
2. Go to **Profiles** and press **+ New profile**.
3. Either fill it in by hand, or press **Import with AI** and choose your resume (PDF, PNG, JPG or WebP). lazyfill
   shows a review screen where you tick what to add, and nothing is added until you do.

A profile holds your details, links, work history, education, skills, job preferences, optional demographic answers,
an answer bank and an attached resume. Demographic fields are optional and only used to answer questions that ask for
them. You can keep several profiles and pick one in the panel.

### 9.2 Try it on the demo form

The repository includes a harmless practice application form. Serve it locally:

```sh
python3 -m http.server 8080 --directory web/public
```

Then open `http://localhost:8080/demo.html` in the browser where lazyfill is loaded. (Opening the file directly with
`file://` does not work unless you enable **Allow access to file URLs** on the extension's card.)

1. The lazyfill panel opens on its own in the top right corner. If it does not, click the toolbar icon.
2. Check that the panel shows the profile you want. With more than one profile, use the arrows on the profile card to switch.
3. Press **Autofill**. Watch the fields fill in. lazyfill never submits the form and never ticks consent boxes.
4. Review everything. The panel lists what it filled and what it could not.

### 9.3 Use it on a real application

Open any job application page. The panel appears when the page looks like an application; press **Autofill**, check
every field, and submit it yourself.

- Questions lazyfill could not answer are shown; type your answer once and it is remembered for next time, under
  **Saved answers** in the dashboard.
- Each filled or submitted application appears in the dashboard under **Applications**, where you can set a status,
  add notes, search, and export CSV or JSON.
- To draft an answer to an open question, select the question text, right-click, and choose **Generate with lazyfill**
  (needs the AI key from section 8).

## 10. Optional: host your own web tracker

The web tracker is a small static website that shows your applications in any browser, for example on your phone or
another computer. Nobody hosts it for you. You publish your own copy, and it talks only to your own Firebase project.

### 10.1 Get your own copy of the repository

Pick one:

- **Fork on GitHub.** Open the lazyfill repository on GitHub and press **Fork**. Then clone your fork instead of the
  original in section 3.
- **Push your clone to a new repository.** Create an empty repository on GitHub (no README, no license), then:

  ```sh
  git remote set-url origin https://github.com/<you>/<your-repo>.git
  git push -u origin main
  ```

Never commit a file named `.env.local`. It is already ignored by git.

### 10.2 Turn on GitHub Pages

1. In your repository open **Settings**, then **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab, choose the workflow **Publish tracker**, and press **Run workflow**. (It also runs whenever
   you push a change to the site or the source.)
4. When the run is green, your site is at `https://<you>.github.io/<your-repo>/`.

If the first run fails because Pages is not enabled yet, do step 2 and run it again.

### 10.3 Let your Firebase project sign people in from that address

1. In the Firebase console open **Authentication**, then **Settings**, then **Authorized domains**.
2. Press **Add domain** and enter the host only, for example `<you>.github.io`.

Without this step, sign-in and the verification emails sent from the site fail with an "unauthorized domain" error.

### 10.4 Tell the extension where it is

1. In the extension's **Settings**, find the **Web tracker** card (it appears after you connect Firebase).
2. Paste the address from step 10.2, for example `https://<you>.github.io/<your-repo>/`, and press **Save**.
3. Press **Open web tracker**.

The extension opens your site with your Firebase config attached to the link. The site stores it in that browser and
removes it from the address bar, so you only need to sign in with the account from section 7. The config travels in the
part of the address after `#`, which browsers do not send to servers, and it is not a secret.

**On another device** open the same address and either paste the config when the page asks for it, or open the site from
the extension. The extension is only needed to create the link; the site works on its own once it has the config.

### 10.5 Optional: make the site open already connected

By default each visitor is asked for a config, which is right for a site other people may visit. If the site is only for
you and you want it to connect by itself everywhere, add the values as repository variables:

1. In your repository open **Settings**, then **Secrets and variables**, then **Actions**, then the **Variables** tab.
2. Add one variable per line of [`.env.example`](../.env.example), with your values: `VITE_FIREBASE_API_KEY`,
   `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`,
   `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.
3. Run **Publish tracker** again.

Use **Variables**, not **Secrets**: the values end up in the published site anyway.

### 10.6 If other people will use your copy

Then you are the operator of their data. The privacy policy and terms pages (`web/public/privacy.html` and
`terms.html`) are templates. Edit them and add your own name and contact details before you invite anyone. If the site is
only for you, nothing more is needed.

### 10.7 Trying the site locally

```sh
npm run build:web
npx serve dist-web
```

Open the address it prints. `localhost` is already an authorized domain in Firebase.

## 11. Everyday maintenance

**Update lazyfill**

```sh
git pull
npm install
npm run build
```

Then press the reload icon on the extension's card at `chrome://extensions`. Your data is in Firebase and your config is
in the browser, so neither is touched. If you host a tracker, push the update to your fork and the workflow republishes it.

**Back up your data.** In the dashboard, **Applications** exports CSV and JSON and **Profiles** exports JSON. Your data
also lives in your Firebase project, which Google backs up on its own schedule.

**Use a different Firebase project.** Paste its config under **Settings**, **Firebase project**, **Change project**. You
are signed out and the cache in this browser is cleared. Both projects keep their data.

**Remove lazyfill completely**

1. In the dashboard open **Settings** and press **Delete my account**. This deletes your cloud data and your account.
2. Remove the extension from `chrome://extensions`.
3. If you created the project only for lazyfill, delete it: Firebase console, gear icon, **Project settings**, **Delete
   project**.
4. If you host a tracker, delete the repository or turn Pages off.

## 12. Setup problems and fixes

**Building and loading**

| Problem | Cause and fix |
|---|---|
| `npm install` fails or warns about the engine | Node is too old. Install Node 20 or newer and try again. |
| `npm run build` ends with an error | Read the first error above the summary. A stale `node_modules` is a common cause: delete it, run `npm install`, build again. |
| "Manifest file is missing or unreadable" when loading | You selected the wrong folder. Choose `dist`, the folder that contains `manifest.json`. |
| The extension loads but shows an error button | Open the error, then run `npm run build` again and press the reload icon on the card. |
| Nothing happens on a job page | Click the toolbar icon to open the panel by hand. Some pages never open it by themselves, and pages in a background tab are ignored until shown. LinkedIn is excluded on purpose. |

**Firebase and sign-in**

| Problem | Cause and fix |
|---|---|
| The panel keeps saying "Connect your Firebase project" | No config is saved yet. Do section 6. If you did, check that it says **Connected to** under **Settings**. |
| "Firebase says this API key is not valid" | Copy the config block again from **Project settings**, **Your apps**. |
| "Restricted in a way that blocks the extension" | Set the key's **Application restrictions** to **None** (section 5.6). |
| "Email and password sign-in is not enabled for this project" | Enable **Email/Password** under **Authentication**, **Sign-in method** (section 5.3). |
| "Wrong email or password" | The message is the same for an unknown email, on purpose. Check both, or use **Forgot password?**. |
| The verification email does not arrive | Check spam. Press **Resend email**. Firebase limits how many it sends per day; try again later if you hit it. |
| "I've verified" says the address is not verified | Open the link in the email first, then press the button again. |
| "Missing or insufficient permissions", or **Test connection** fails | The rules from section 5.5 are not published, or the email is not verified yet. Republish the rules and verify the address. |
| "Too many attempts" | Firebase is rate limiting sign-in. Wait a few minutes. |
| Saved data seems to disappear after changing the config | You switched projects, which clears this browser's cache. Switch back to the earlier project's config to see its data again. |

**Web tracker**

| Problem | Cause and fix |
|---|---|
| The **Publish tracker** run fails at deploy | **Settings**, **Pages**, **Source** must be **GitHub Actions**. Set it and run the workflow again. |
| The site is blank or 404 | Wait a minute after the run finishes. The address includes your repository name: `https://<you>.github.io/<repo>/`. |
| The site asks for a config | Expected for a copy that is not baked in. Open it from the extension's **Open web tracker** button, or paste the config. |
| "unauthorized domain" when signing in | Add the site's host under **Authentication**, **Settings**, **Authorized domains** (section 10.3). |
| Signed in but the list is empty | Use the same email and password as in the extension, and check that the site is connected to the same project (the project id is shown under the sign-in form). |
| The site is blank after sign-in | Open the browser console. The usual causes are unpublished rules or an unauthorized domain. |

**AI features**

| Problem | Cause and fix |
|---|---|
| "Save & test key" fails | Check the provider, that the key is complete, and for OpenAI that the account has credit. |
| Resume import says it used the everyday model | Your key cannot use the stronger default. This is only a note. Type a model you have access to in **Resume import model** if you want to force one. |
| "Generate with lazyfill" does nothing | It needs an AI key (section 8), and it refuses legal and identity questions such as work authorization on purpose. |

Still stuck? Open an issue on the project's GitHub page with the exact message and the step you were on. Do not paste
your API key, your password or your personal data.

## 13. Setup checklist

You are done when all of these are true:

- [ ] `npm run build` finished and `dist/manifest.json` exists
- [ ] lazyfill is loaded and pinned, and the welcome page opened
- [ ] Your Firebase project has **Email/Password** enabled, a **Firestore** database, and the **published rules**
- [ ] **Settings** shows **Connected to** your project id
- [ ] You created an account, verified the email, and **Test connection** answers **Connected as** your email
- [ ] You created a profile and the demo form fills from it
- [ ] Optional: an AI key passes **Save & test key**
- [ ] Optional: your tracker opens from **Open web tracker** and shows your applications
