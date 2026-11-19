import type { Metadata } from 'next';
import { LegalPage, REPO } from '../../components/LegalPage';

export const metadata: Metadata = { title: 'Terms of use - lazyfill', description: 'The terms for using the lazyfill Chrome extension.' };

export default function Terms() {
  return (
    <LegalPage title="Terms of use">
      <p>
        lazyfill is an independent project. It is not affiliated with, endorsed by or sponsored by any employer, job board,
        applicant tracking system, browser vendor or AI provider. Product and company names belong to their owners and
        appear only to describe compatibility.
      </p>

      <h2>What you are agreeing to</h2>
      <p>
        By installing or using lazyfill you agree to these terms and to the <a href="/privacy">privacy policy</a>. If you
        do not agree, do not use it.
      </p>

      <h2>What lazyfill does, and what stays with you</h2>
      <ul>
        <li>lazyfill fills in forms with information you provide. It never submits an application. You review every form and press submit yourself.</li>
        <li>You are responsible for the accuracy and honesty of everything you apply with, including anything lazyfill fills in, imports from your resume or drafts with AI. Check it before you send it.</li>
        <li>AI output can be wrong, incomplete or inappropriate. lazyfill refuses to draft answers to legal and identity questions (such as work authorization, criminal history and demographic questions); answer those yourself.</li>
        <li>Some websites restrict automated tools in their own terms. You are responsible for following the terms of any site you use lazyfill on.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        You own your data. It is stored only in your browser, as described in the privacy policy, and you can export or
        delete it at any time. Because there is no cloud copy, removing the extension or clearing browser data erases it:
        keep a backup of anything important. You are responsible for keeping your AI key secure.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not use lazyfill to break the law, to submit false information, to harass anyone, to attack or overload any
        service, or to attempt to access other people&apos;s data.
      </p>

      <h2>Open source</h2>
      <p>
        The lazyfill source code is available under the <a href={`${REPO}/blob/main/LICENSE`}>MIT license</a>. Bundled
        third-party packages keep their own licenses, listed in THIRD_PARTY_NOTICES.txt inside the extension.
      </p>

      <h2>No warranty</h2>
      <p>
        lazyfill is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or
        implied, including fitness for a particular purpose and that it will work on every site, be error-free, or be
        uninterrupted. Websites change, and filling can fail or put something in the wrong box.
      </p>

      <h2>Limit of liability</h2>
      <p>
        To the fullest extent the law allows, the authors and contributors of lazyfill are not liable for indirect,
        incidental or consequential losses, or for lost opportunities, lost applications or lost data, arising from your use
        of lazyfill. Nothing in these terms limits liability that cannot be limited by law.
      </p>

      <h2>Changes</h2>
      <p>These terms may be updated; the date at the top shows the latest version. Continuing to use lazyfill after a change means you accept it.</p>

      <h2>Contact</h2>
      <p>Questions: open an issue on <a href={`${REPO}/issues`}>GitHub</a>.</p>
    </LegalPage>
  );
}
