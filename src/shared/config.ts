import type { FirebaseConfig } from './types';

const env = import.meta.env;
const PLACEHOLDER = 'not-configured';

/**
 * The Firebase web app config. The real values are not stored in the repository: they come from build-time
 * environment variables (see .env.example), normally from a local, git-ignored .env.local file. Without them the
 * build still succeeds but cannot sign anyone in.
 */
export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || PLACEHOLDER,
  projectId: env.VITE_FIREBASE_PROJECT_ID || PLACEHOLDER,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: env.VITE_FIREBASE_APP_ID || undefined,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

/** False for a build made without a Firebase project, so the UI can say so instead of failing obscurely. */
export const firebaseConfigured = () => FIREBASE_CONFIG.apiKey !== PLACEHOLDER && FIREBASE_CONFIG.projectId !== PLACEHOLDER;

export const SITE_URL = 'https://jaswanthremiel.github.io/lazyfill/';

export const siteConfigured = () => !SITE_URL.includes('YOUR-GITHUB-USERNAME');

export const PRIVACY_URL = `${SITE_URL}privacy.html`;
export const TERMS_URL = `${SITE_URL}terms.html`;

/** Shown wherever the app talks about other companies' products. */
export const NOT_AFFILIATED =
  'lazyfill is an independent project. It is not affiliated with, endorsed by or sponsored by any employer, job board, applicant tracking system or AI provider. Product and company names belong to their owners and are used only to describe what lazyfill works with.';
