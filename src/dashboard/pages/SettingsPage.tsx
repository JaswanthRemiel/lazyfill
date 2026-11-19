import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PROMPT_TEMPLATE } from '../../shared/answers';
import { send } from '../../shared/messages';
import { getItem, setItem } from '../../shared/storage';
import type { AiSettings } from '../../shared/types';
import { download } from '../download';
import { btnGhost, btnPrimary, card, Field, inputCls, Notice } from '../ui';

type Status = { ok: boolean; text: string } | null;

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
        <h2 className="text-lg font-semibold">2 · “Generate with lazyfill” prompt</h2>
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
        <h2 className="text-lg font-semibold">1 · AI key <span className="text-xs font-semibold text-muted-foreground">(optional)</span></h2>
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

function DataCard() {
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportAll() {
    const r = await send<object>({ action: 'exportBackup' });
    if (!r.success) return setStatus({ ok: false, text: r.error ?? 'Could not export.' });
    download(`lazyfill-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(r.data, null, 2));
    setStatus({ ok: true, text: 'Backup downloaded. It holds your profiles, resumes, applications and saved answers, so keep it somewhere private. Your AI key is not included.' });
  }

  async function restore(file: File) {
    if (!confirm('Replace everything lazyfill holds in this browser with this backup? Your AI key is kept.')) return;
    const r = await send({ action: 'importBackup', text: await file.text() });
    setStatus(r.success ? { ok: true, text: 'Backup restored.' } : { ok: false, text: r.error ?? 'Could not restore that file.' });
  }

  async function wipe() {
    if (!confirm('Delete all lazyfill data in this browser, including profiles, resumes, applications, saved answers and your AI key? This cannot be undone.')) return;
    const r = await send({ action: 'deleteAllData' });
    setStatus(r.success ? { ok: true, text: 'All lazyfill data was deleted from this browser.' } : { ok: false, text: r.error ?? 'Could not delete.' });
  }

  return (
    <section className={`${card} grid gap-4`}>
      <div>
        <h2 className="text-lg font-semibold">3 · Your data</h2>
        <p className="text-sm text-muted-foreground">Everything lazyfill knows about you is stored only in this browser. Nothing is uploaded to lazyfill or anyone else. Uninstalling the extension or clearing browser data deletes it, so export a backup to move to another computer or to keep a copy.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className={btnPrimary} onClick={exportAll}>Export backup</button>
        <button className={btnGhost} onClick={() => fileRef.current?.click()}>Restore from backup</button>
        <button className={btnGhost} onClick={wipe}>Delete all data</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void restore(f); }} />
      </div>
      {status && <Notice ok={status.ok}>{status.text}</Notice>}
    </section>
  );
}

export function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm font-medium text-muted-foreground">No account needed. Your profiles and applications stay in this browser.</p>
      </div>
      <AiCard />
      <PromptCard />
      <DataCard />
    </div>
  );
}
