import { useEffect, useState } from 'react';
import { DEFAULT_PROMPT_TEMPLATE } from '../../shared/answers';
import { send } from '../../shared/messages';
import { normalizeTrackerUrl, REPO_URL } from '../../shared/tracker';
import { getItem, setItem } from '../../shared/storage';
import type { AiSettings } from '../../shared/types';
import type { SessionInfo } from '../../panel/useProfiles';
import { MIN_PASSWORD, usePasswordAuth } from '../../panel/useSignIn';
import type { FirebaseSetupStatus } from '../../shared/firebaseConfig';
import { FirebaseSetup } from '../FirebaseSetup';
import { btnGhost, btnPrimary, card, Field, inputCls, Notice } from '../ui';

type Status = { ok: boolean; text: string } | null;

function AccountCard({ session, onChange }: { session: SessionInfo | null; onChange: () => void }) {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const a = usePasswordAuth(onChange);
  const signIn = a.mode === 'signIn';

  async function test() {
    setBusy(true);
    const r = await send<{ email: string }>({ action: 'testConnection' });
    setStatus(r.success ? { ok: true, text: `Connected as ${r.data?.email}.` } : { ok: false, text: r.error ?? 'Connection failed' });
    setBusy(false);
  }

  return (
    <section className={`${card} grid gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">2 · Account</h2>
        <p className="text-sm text-muted-foreground">Sign in with your email and password. The same account works on the web tracker.</p>
      </div>
      {session ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">Signed in as <span className="font-semibold">{session.email}</span></p>
          <button className={btnGhost} onClick={test} disabled={busy}>Test connection</button>
          <button className={btnGhost} onClick={async () => { await send({ action: 'signOut' }); onChange(); }}>Sign out</button>
        </div>
      ) : a.step === 'verify' ? (
        <div className="grid max-w-md gap-3">
          <Notice ok>We sent a verification link to {a.email}. Open it, then press “I’ve verified”.</Notice>
          <div className="flex flex-wrap gap-2">
            <button className={btnPrimary} onClick={a.recheck}>I’ve verified</button>
            <button className={btnGhost} onClick={a.resend}>Resend email</button>
            <button className={btnGhost} onClick={a.back}>Back</button>
          </div>
          {a.note && <Notice ok>{a.note}</Notice>}
          {a.error && <Notice ok={false}>{a.error}</Notice>}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void a.submit(); }} className="grid max-w-md gap-3">
          <Field label="Email"><input className={inputCls} type="email" autoComplete="email" required value={a.email} onChange={(e) => a.setEmail(e.target.value)} /></Field>
          <Field label="Password" hint={signIn ? undefined : `At least ${MIN_PASSWORD} characters.`}>
            <input className={inputCls} type="password" autoComplete={signIn ? 'current-password' : 'new-password'} required minLength={signIn ? undefined : MIN_PASSWORD} value={a.password} onChange={(e) => a.setPassword(e.target.value)} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button className={btnPrimary} disabled={a.step === 'busy'}>{a.step === 'busy' ? 'Please wait…' : signIn ? 'Sign in' : 'Create account'}</button>
            <button type="button" className="text-xs font-medium text-foreground underline-offset-2 hover:underline" onClick={() => a.setMode(signIn ? 'signUp' : 'signIn')}>{signIn ? 'New here? Create an account' : 'Have an account? Sign in'}</button>
            {signIn && <button type="button" className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline" onClick={a.forgot}>Forgot password?</button>}
          </div>
          {a.error && <Notice ok={false}>{a.error}</Notice>}
          {a.note && <Notice ok>{a.note}</Notice>}
        </form>
      )}
      {status && <Notice ok={status.ok}>{status.text}</Notice>}
    </section>
  );
}

function TrackerCard() {
  const [saved, setSaved] = useState('');
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<Status>(null);
  useEffect(() => { getItem('lf_tracker_url').then((u) => { setSaved(u ?? ''); setEditing(!u); }); }, []);

  async function save() {
    try {
      const url = normalizeTrackerUrl(text);
      await setItem('lf_tracker_url', url);
      setSaved(url);
      setText('');
      setEditing(false);
      setNote({ ok: true, text: 'Saved. Use “Open web tracker” and it connects to your Firebase project by itself.' });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : 'That address does not look right.' });
    }
  }
  async function open() {
    const r = await send<string | null>({ action: 'getTrackerLink' });
    if (r.success && r.data) window.open(r.data, '_blank', 'noopener');
  }
  async function remove() {
    await chrome.storage.local.remove('lf_tracker_url');
    setSaved('');
    setEditing(true);
    setNote(null);
  }

  return (
    <section className={`${card} grid gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">3 · Web tracker <span className="text-xs font-semibold text-muted-foreground">(optional)</span></h2>
        <p className="text-sm text-muted-foreground">
          The same application list on any device, from a small website that you host yourself. It is not run by anyone else, and it talks only to your Firebase project.
        </p>
      </div>
      {saved && !editing ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="break-all text-sm">Your tracker: <b className="font-medium">{saved}</b></p>
          <button type="button" className={btnPrimary} onClick={open}>Open web tracker</button>
          <button type="button" className={btnGhost} onClick={() => setEditing(true)}>Change</button>
          <button type="button" className={btnGhost} onClick={remove}>Remove</button>
        </div>
      ) : (
        <div className="grid gap-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Fork the lazyfill repository on GitHub, or push your clone to a repository of your own.</li>
            <li>In that repository open <b className="font-medium text-foreground">Settings, Pages</b> and set the source to <b className="font-medium text-foreground">GitHub Actions</b>, then run the <b className="font-medium text-foreground">Publish tracker</b> workflow from the Actions tab.</li>
            <li>In the Firebase console, add the site&rsquo;s host (for example <code>your-name.github.io</code>) under <b className="font-medium text-foreground">Authentication, Settings, Authorized domains</b>.</li>
            <li>Paste the site&rsquo;s address below. The <a className="font-medium text-foreground underline underline-offset-2" href={`${REPO_URL}/blob/main/docs/SETUP.md#10-optional-host-your-own-web-tracker`} target="_blank" rel="noreferrer">setup guide</a> has the details.</li>
          </ol>
          <div className="flex gap-2">
            <input className={`${inputCls} flex-1`} aria-label="Web tracker address" placeholder="https://your-name.github.io/lazyfill/" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
            <button type="button" className={btnPrimary} disabled={!text.trim()} onClick={save}>Save</button>
            {saved && <button type="button" className={btnGhost} onClick={() => { setEditing(false); setText(''); setNote(null); }}>Cancel</button>}
          </div>
        </div>
      )}
      {note && <Notice ok={note.ok}>{note.text}</Notice>}
    </section>
  );
}

function PromptCard() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  useEffect(() => { send<string>({ action: 'getPromptTemplate' }).then((r) => { setText(r.data ?? DEFAULT_PROMPT_TEMPLATE); setLoaded(true); }); }, []);

  async function save(template: string) {
    const r = await send({ action: 'savePromptTemplate', template });
    setStatus(r.success ? { ok: true, text: template.trim() ? 'Saved.' : 'Back to the built-in prompt.' } : { ok: false, text: r.error ?? 'Could not save.' });
    if (!template.trim()) setText(DEFAULT_PROMPT_TEMPLATE);
  }

  return (
    <section className={`${card} grid gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">5 · “Generate with lazyfill” prompt</h2>
        <p className="text-sm font-medium text-muted-foreground">On an application, select a question, right-click and choose <b>Generate with lazyfill</b>. This is the prompt it sends. Placeholders: {'{{profile}}'}, {'{{jobTitle}}'}, {'{{company}}'}, {'{{description}}'}, {'{{question}}'}, {'{{hint}}'} (your answer-bank notes).</p>
      </div>
      <textarea rows={16} spellCheck={false} disabled={!loaded} className={`${inputCls} h-auto py-2 font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} aria-label="Prompt template" />
      <div className="flex flex-wrap gap-3">
        <button className={btnPrimary} onClick={() => save(text === DEFAULT_PROMPT_TEMPLATE ? '' : text)} disabled={!loaded}>Save prompt</button>
        <button className={btnGhost} onClick={() => save('')} disabled={!loaded}>Reset to built-in</button>
      </div>
      {status && <Notice ok={status.ok}>{status.text}</Notice>}
    </section>
  );
}

function AiCard() {
  const [ai, setAi] = useState<AiSettings>({ provider: 'gemini', apiKey: '', model: '' });
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => { getItem('lf_ai_settings').then((a) => a && setAi(a)); }, []);

  async function save() {
    setBusy(true);
    setStatus(null);
    await setItem('lf_ai_settings', { ...ai, apiKey: ai.apiKey.trim(), model: ai.model.trim(), importModel: (ai.importModel ?? '').trim() });
    const r = await send({ action: 'testAi' });
    setStatus(r.success ? { ok: true, text: 'Your key works.' } : { ok: false, text: r.error ?? 'The test call failed.' });
    setBusy(false);
  }

  return (
    <section className={`${card} grid gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">4 · AI key <span className="text-xs font-semibold text-muted-foreground">(optional)</span></h2>
        <p className="text-sm font-medium text-muted-foreground">Used to import profiles from your resume and to write answers with “Generate with lazyfill”. Stored only in this browser. When you use an AI feature, the resume pages, question text, profile summary and job details it needs are sent to the provider you choose, under that provider’s own terms. Free-tier plans (Google’s in particular) may use what you send to improve their products; paid plans generally do not. Check your provider’s policy.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Provider">
          <select className={inputCls} value={ai.provider} onChange={(e) => setAi({ ...ai, provider: e.target.value as AiSettings['provider'] })}>
            <option value="gemini">Google Gemini</option><option value="openai">OpenAI</option>
          </select>
        </Field>
        <Field label="API key">
          <div className="flex gap-2">
            <input className={inputCls} type={show ? 'text' : 'password'} autoComplete="off" value={ai.apiKey} onChange={(e) => setAi({ ...ai, apiKey: e.target.value })} />
            <button type="button" className={`${btnGhost} px-3`} onClick={() => setShow(!show)} aria-label={show ? 'Hide key' : 'Show key'}>{show ? 'Hide' : 'Show'}</button>
          </div>
        </Field>
        <Field label="Model (optional)"><input className={inputCls} value={ai.model} onChange={(e) => setAi({ ...ai, model: e.target.value })} placeholder={ai.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Resume import model (optional)" hint={`Reading page layouts works best with a stronger model. Empty uses ${ai.provider === 'gemini' ? 'gemini-2.5-pro' : 'gpt-4o'}, and falls back to the model above if your key cannot use it.`}>
          <input className={inputCls} value={ai.importModel ?? ''} onChange={(e) => setAi({ ...ai, importModel: e.target.value })} placeholder={ai.provider === 'gemini' ? 'gemini-2.5-pro' : 'gpt-4o'} />
        </Field>
      </div>
      <div><button className={btnPrimary} onClick={save} disabled={busy || !ai.apiKey.trim()}>{busy ? 'Testing…' : 'Save & test key'}</button></div>
      {status && <Notice ok={status.ok}>{status.text}</Notice>}
    </section>
  );
}

function DeleteAccount({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    setBusy(true);
    setError('');
    const r = await send({ action: 'deleteAccount', password });
    setBusy(false);
    if (r.success) { onDone(); return; }
    setError(r.error ?? 'Could not delete the account. Nothing further was deleted; you can try again.');
  }

  return (
    <section className={`${card} grid gap-3`}>
      <div>
        <h2 className="text-lg font-semibold">Delete my account</h2>
        <p className="text-sm text-muted-foreground">Permanently deletes your account, profiles, resumes, applications and saved answers from the cloud, and clears this browser. It cannot be undone. Export your applications first if you want a copy.</p>
      </div>
      {!open ? (
        <div><button className={btnGhost} onClick={() => setOpen(true)}>Delete account…</button></div>
      ) : (
        <form className="grid max-w-md gap-3" onSubmit={(e) => { e.preventDefault(); if (sure) void remove(); }}>
          <Field label="Confirm with your password"><input className={inputCls} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <label className="flex items-start gap-2 text-xs"><input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={sure} onChange={(e) => setSure(e.target.checked)} />I understand this permanently deletes my account and all my data.</label>
          <div className="flex gap-2">
            <button className="inline-flex h-9 items-center justify-center rounded-full bg-destructive px-4 text-[13px] font-medium text-white disabled:opacity-40" disabled={!sure || !password || busy}>{busy ? 'Deleting…' : 'Delete everything'}</button>
            <button type="button" className={btnGhost} onClick={() => { setOpen(false); setPassword(''); setSure(false); setError(''); }}>Cancel</button>
          </div>
          {error && <Notice ok={false}>{error}</Notice>}
          <p className="text-xs text-muted-foreground">Signed up with a link and never set a password? Use “Forgot password” on the sign-in screen first.</p>
        </form>
      )}
    </section>
  );
}

export function SettingsPage({ session, onSessionChange }: { session: SessionInfo | null; onSessionChange: () => void }) {
  const [fb, setFb] = useState<FirebaseSetupStatus | null>(null);
  const loadFirebase = () => send<FirebaseSetupStatus>({ action: 'getFirebaseSetup' }).then((r) => r.success && r.data && setFb(r.data));
  useEffect(() => { loadFirebase(); }, []);

  async function saveFirebase(text: string) {
    const r = await send<{ projectId: string; note?: string }>({ action: 'saveFirebaseConfig', text });
    if (!r.success) throw new Error(r.error ?? 'Could not save that config.');
    await loadFirebase();
    onSessionChange();
    return r.data?.note;
  }
  async function clearFirebase() {
    await send({ action: 'clearFirebaseConfig' });
    await loadFirebase();
    onSessionChange();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm font-medium text-muted-foreground">Connect your Firebase project and sign in once. After that, autofill and tracking work on their own.</p>
      </div>

      {fb && <FirebaseSetup status={fb} onSave={saveFirebase} onClear={clearFirebase} />}
      {fb?.configured && <AccountCard session={session} onChange={onSessionChange} />}
      {fb?.configured && <TrackerCard />}
      <AiCard />
      <PromptCard />
      {session && <DeleteAccount onDone={onSessionChange} />}
    </div>
  );
}
