import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut as fbSignOut, type User,
} from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { buildTimeFirebaseConfig } from '../../src/shared/config';
import { parseFirebaseConfig, type FirebaseSetupStatus } from '../../src/shared/firebaseConfig';
import { configFromHash } from '../../src/shared/tracker';
import type { FirebaseConfig } from '../../src/shared/types';

const CONFIG_KEY = 'lf_firebase_config';

function pasted(): FirebaseConfig | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null') as FirebaseConfig | null;
    return c?.apiKey && c?.projectId ? c : null;
  } catch {
    return null;
  }
}

/** Opened from the extension's Settings: take the config from the link, keep it, and clear it from the address bar. */
function adoptFromLink(): FirebaseConfig | null {
  const cfg = configFromHash(location.hash);
  if (!cfg) return null;
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch { /* private mode: it still works for this visit */ }
  history.replaceState(null, '', location.pathname + location.search);
  return cfg;
}

const chosen = adoptFromLink() ?? pasted();
const active = chosen ?? buildTimeFirebaseConfig();

/** Whether this page knows which Firebase project to talk to. When it does not, App shows the setup screen first. */
export const webStatus: FirebaseSetupStatus = active
  ? { configured: true, projectId: active.projectId, source: chosen ? 'pasted' : 'build' }
  : { configured: false, projectId: '', source: 'none' };

/** Saves a pasted config for this browser and reloads, because the Firebase SDK reads its config once at start. */
export function saveWebConfig(text: string): Promise<never> {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(parseFirebaseConfig(text)));
  location.reload();
  return new Promise<never>(() => {}); // stays pending until the page reloads
}

export function clearWebConfig(): Promise<never> {
  localStorage.removeItem(CONFIG_KEY);
  location.reload();
  return new Promise<never>(() => {});
}

// A placeholder keeps the imports below harmless until a real config exists.
const app = initializeApp(active ?? { apiKey: 'not-configured', projectId: 'not-configured' });
export const auth = getAuth(app);
// the extension leaves optional fields out; the web page should too
export const db = (() => {
  try { return initializeFirestore(app, { ignoreUndefinedProperties: true }); } catch { return getFirestore(app); }
})();

const EMAIL_KEY = 'lf_last_email';

/** The page this one is served from; emails link back here when they can. */
export const pageUrl = () => `${location.origin}${location.pathname}`;

const actionSettings = () => ({ url: pageUrl(), handleCodeInApp: false });

export const signInWithPassword = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then((c) => c.user);

/** Creates the account and emails a verification link. Nothing is saved until the address is verified. */
export async function signUpWithPassword(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user, actionSettings());
  return user;
}

export const resendVerification = (user: User) => sendEmailVerification(user, actionSettings());
export const sendReset = (email: string) => sendPasswordResetEmail(auth, email, actionSettings());

/** Re-reads the account and refreshes the token, so the verified flag reaches Firestore's rules. */
export async function refreshVerification(user: User): Promise<boolean> {
  await user.reload();
  if (user.emailVerified) await user.getIdToken(true);
  return user.emailVerified;
}

export const rememberedEmail = () => localStorage.getItem(EMAIL_KEY) ?? '';
export const rememberEmail = (email: string) => localStorage.setItem(EMAIL_KEY, email);

export const signOut = () => fbSignOut(auth);
export const watchUser = (cb: (u: User | null) => void) => onAuthStateChanged(auth, cb);
