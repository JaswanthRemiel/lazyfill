import { buildTimeFirebaseConfig } from '../../shared/config';
import { ConfigParseError, parseFirebaseConfig, type FirebaseSetupStatus } from '../../shared/firebaseConfig';
import { getItem, removeItem, setItem } from '../../shared/storage';
import type { FirebaseConfig } from '../../shared/types';

export class NotConfiguredError extends Error {
  constructor() {
    super('Connect your Firebase project first: open lazyfill Settings and paste the web app config from the Firebase console.');
  }
}

const usable = (c?: FirebaseConfig | null): c is FirebaseConfig => !!c?.apiKey && !!c?.projectId;

/** The config in use: the one pasted into Settings, else one baked into the build. Throws if there is neither. */
export async function getFirebaseConfig(): Promise<FirebaseConfig> {
  const saved = await getItem('lf_firebase_config');
  if (usable(saved)) return saved;
  const built = buildTimeFirebaseConfig();
  if (usable(built)) return built;
  throw new NotConfiguredError();
}

export async function firebaseStatus(): Promise<FirebaseSetupStatus> {
  const saved = await getItem('lf_firebase_config');
  if (usable(saved)) return { configured: true, projectId: saved.projectId, source: 'pasted' };
  const built = buildTimeFirebaseConfig();
  if (usable(built)) return { configured: true, projectId: built.projectId, source: 'build' };
  return { configured: false, projectId: '', source: 'none' };
}

/** Everything stored locally belongs to one Firebase project, so it goes when the project changes. */
async function forgetProjectData() {
  const all = await chrome.storage.local.get(null);
  const resumes = Object.keys(all).filter((k) => k.startsWith('lf_resume_'));
  await chrome.storage.local.remove([
    'lf_session', 'lf_profile_cache', 'lf_active_profile_id', 'lf_pending_writes', 'lf_failed_writes',
    'lf_applications_cache', 'lf_learned_fields', ...resumes,
  ]);
}

/**
 * Asks Identity Toolkit about a token that cannot exist. A working key answers "invalid token"; a wrong or blocked key
 * answers differently. Nothing is created. Returns a note for the user, or throws when the key is clearly unusable.
 */
async function probe(cfg: FirebaseConfig): Promise<string | undefined> {
  let res: Response;
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(cfg.apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: 'lazyfill-check' }),
    });
  } catch {
    return 'Saved. Could not reach Firebase to check it, so it was not verified.';
  }
  const message: string = (await res.json().catch(() => ({})))?.error?.message ?? '';
  if (/api key not valid|API_KEY_INVALID/i.test(message)) throw new Error('Firebase says this API key is not valid. Copy the config again from Project settings.');
  if (/blocked|referer|referrer/i.test(message)) {
    throw new Error('This API key is restricted in a way that blocks the extension. Restrict it by API (Identity Toolkit, Token Service, Cloud Firestore), not by website.');
  }
  if (/has not been used|disabled|PROJECT_NOT_FOUND/i.test(message)) {
    return 'Saved, but Authentication does not look enabled yet. In the Firebase console open Authentication, press Get started, and enable Email/Password.';
  }
  return undefined;
}

/** Parses and saves a pasted config. A different project than before signs the user out and clears local data. */
export async function saveFirebaseConfig(text: string): Promise<{ projectId: string; note?: string }> {
  let cfg: FirebaseConfig;
  try {
    cfg = parseFirebaseConfig(text);
  } catch (e) {
    throw e instanceof ConfigParseError ? e : new Error('Could not read that config.');
  }
  const note = await probe(cfg);
  const before = await firebaseStatus();
  if (before.configured && before.projectId !== cfg.projectId) await forgetProjectData();
  await setItem('lf_firebase_config', cfg);
  return { projectId: cfg.projectId, note };
}

/** Removes the pasted config (a build-time one, if any, takes over). */
export async function clearFirebaseConfig(): Promise<void> {
  const before = await firebaseStatus();
  await removeItem('lf_firebase_config');
  const after = await firebaseStatus();
  if (before.projectId !== after.projectId) await forgetProjectData();
}
