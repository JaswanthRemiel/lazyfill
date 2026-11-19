import type { Metadata } from 'next';
import { LegalPage, REPO } from '../../components/LegalPage';

export const metadata: Metadata = { title: 'Privacy policy - lazyfill', description: 'What the lazyfill Chrome extension stores, where it goes, and how to delete it.' };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        lazyfill is a Chrome extension that fills in job applications from a profile you keep, tracks the applications you
        send, and can draft answers with an AI service you connect. This policy explains what it handles and where that data goes.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>Everything you put into lazyfill is stored only in your browser, in the extension&apos;s local storage.</li>
        <li>There is no lazyfill account and no lazyfill server. The developer never receives, sees or stores your data.</li>
        <li>No analytics, no trackers, no advertising, and your data is never sold or shared.</li>
        <li>Only if you add your own AI key and use an AI feature is data sent, directly from your browser to the AI provider you chose.</li>
      </ul>

      <h2>What is stored in your browser</h2>
      <ul>
        <li><b>Profiles:</b> what you type or import: name, contact details, address, links, work history, education, skills, job preferences, an answer bank, and optional demographic answers (such as gender, race or ethnicity, veteran or disability status) used only to answer the same questions on application forms.</li>
        <li><b>Resume files</b> you attach, so they can be uploaded to forms that ask for one.</li>
        <li><b>Application tracker:</b> job title, company, page address, platform, location, job description text, status, dates and your notes.</li>
        <li><b>Saved answers:</b> answers you typed on application forms after pressing Autofill, so they can be filled next time. Passwords, ID or card numbers, security codes and dates of birth are never saved.</li>
        <li><b>Settings:</b> theme, your AI provider, AI key and model names, and your prompt template.</li>
      </ul>
      <p>This data stays on your device. It is not synced to any cloud service by lazyfill.</p>

      <h2>What lazyfill reads on web pages</h2>
      <p>
        lazyfill runs on the pages you visit so it can recognise a job application form and fill it. It reads form fields,
        their labels, and (to name the job) the page title, company and job description. This happens entirely in your
        browser. Nothing is sent anywhere for pages that are not job applications, and nothing from any page is sent to the developer.
      </p>

      <h2>AI features (optional)</h2>
      <p>
        If you add a Google Gemini or OpenAI API key, then only when you use an AI feature your browser sends the following
        directly to that provider: for resume import, images of your resume pages with their text and links; for
        &ldquo;Generate with lazyfill&rdquo;, the question you selected, a summary of your profile (contact details are
        left out), and the job&apos;s title, company and description. The provider handles it under its own terms and
        privacy policy. Free tiers of some providers, Google&apos;s Gemini API among them, may use submitted content to
        improve their products. If you never add a key, nothing is sent to any AI service.
      </p>

      <h2>Chrome Web Store user data policy</h2>
      <p>
        The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the
        Limited Use requirements. Data is used only to provide lazyfill&apos;s single purpose of helping you fill in and
        track job applications. It is not transferred to anyone except the AI provider you choose, at your request, and it
        is not used for advertising, credit decisions or any purpose unrelated to that feature.
      </p>

      <h2>Keeping and deleting your data</h2>
      <ul>
        <li>Your data is kept in your browser until you delete it.</li>
        <li><b>Export:</b> Dashboard &rsaquo; Settings &rsaquo; Export backup saves everything (except your AI key) to a file you control. Applications can also be exported as CSV or JSON.</li>
        <li><b>Delete:</b> Dashboard &rsaquo; Settings &rsaquo; Delete all data, or remove the extension. Either one erases everything lazyfill stored.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Your data is protected by your browser and your computer account. AI requests travel over HTTPS. Keep your AI key
        secret, and keep backup files somewhere private, since they contain your profile.
      </p>

      <h2>Children</h2>
      <p>lazyfill is not directed at children and is not intended for anyone under 16.</p>

      <h2>Changes</h2>
      <p>If this policy changes in a way that matters, the date at the top is updated and the change is noted in the project&apos;s release notes.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: open an issue on <a href={`${REPO}/issues`}>GitHub</a>. Please do not post personal data there.
      </p>
    </LegalPage>
  );
}
