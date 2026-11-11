import { useState } from 'react';
import type { FirebaseSetupStatus } from '../shared/firebaseConfig';
import { btnGhost, btnPrimary, card, inputCls, Notice } from './ui';

const EXAMPLE = `const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};`;

interface Props {
  status: FirebaseSetupStatus;
  /** Saves the pasted text. Resolves with an optional note to show, or rejects with a readable message. */
  onSave: (text: string) => Promise<string | void>;
  /** Removes the pasted config. Omit where that makes no sense. */
  onClear?: () => Promise<void>;
  className?: string;
  /** Open the paste box straight away even when a project is already connected. */
  startEditing?: boolean;
  onCancel?: () => void;
}

/** The one place a person connects lazyfill to their own Firebase project. Used by the dashboard and the web tracker. */
export function FirebaseSetup({ status, onSave, onClear, className = '', startEditing, onCancel }: Props) {
  const [editing, setEditing] = useState(startEditing ?? !status.configured);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setNote(null);
    try {
      const msg = await onSave(text);
      setNote({ ok: true, text: msg || 'Saved. lazyfill is now using this Firebase project.' });
      setText('');
      setEditing(false);
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : 'Could not save that config.' });
    }
    setBusy(false);
  }

  return (
    <section className={`${card} grid gap-4 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold">1 · Firebase project</h2>
        <p className="text-sm text-muted-foreground">
          lazyfill stores your account and data in a Firebase project that you own. Nothing is shared with anyone else.
        </p>
      </div>

      {status.configured && !editing ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm">
            Connected to <b className="font-medium">{status.projectId}</b>
            {status.source === 'build' && <span className="text-muted-foreground"> (set when this build was made)</span>}
          </p>
          <button type="button" className={btnGhost} onClick={() => setEditing(true)}>Change project</button>
          {onClear && status.source === 'pasted' && (
            <button type="button" className={btnGhost} onClick={async () => { setBusy(true); await onClear(); setBusy(false); setNote({ ok: true, text: 'Removed.' }); }} disabled={busy}>Remove</button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Open the <a className="font-medium text-foreground underline underline-offset-2" href="https://console.firebase.google.com" target="_blank" rel="noreferrer">Firebase console</a>, create a project and add a <b className="font-medium text-foreground">Web app</b>.</li>
            <li>Turn on <b className="font-medium text-foreground">Authentication, Email/Password</b> and create a <b className="font-medium text-foreground">Firestore</b> database. Publish the rules from the repository file <code>firestore.rules</code>.</li>
            <li>Copy the config block the console shows for the web app and paste it below.</li>
          </ol>
          <textarea
            className={`${inputCls} h-40 font-mono text-xs leading-5`}
            spellCheck={false}
            aria-label="Firebase web app config"
            placeholder={EXAMPLE}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className={btnPrimary} disabled={busy || !text.trim()} onClick={save}>{busy ? 'Checking…' : 'Save and connect'}</button>
            {status.configured && <button type="button" className={btnGhost} onClick={() => { setEditing(false); setText(''); setNote(null); onCancel?.(); }}>Cancel</button>}
          </div>
          {status.configured && (
            <p className="text-xs text-muted-foreground">Switching to a different project signs you out here and clears the data stored in this browser. Nothing is deleted from either project.</p>
          )}
        </div>
      )}
      {note && <Notice ok={note.ok}>{note.text}</Notice>}
    </section>
  );
}
