import type { FirebaseConfig } from './types';

const env = import.meta.env;

/**
 * A Firebase config baked into the build from VITE_FIREBASE_* variables (see .env.example), or null. This is optional:
 * people normally paste their config into Settings instead, and it is stored in the browser, not in the code.
 */
export function buildTimeFirebaseConfig(): FirebaseConfig | null {
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID) return null;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    appId: env.VITE_FIREBASE_APP_ID || undefined,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  };
}

export const SITE_URL = 'https://jaswanthremiel.github.io/lazyfill/';

export const siteConfigured = () => !SITE_URL.includes('YOUR-GITHUB-USERNAME');

export const PRIVACY_URL = `${SITE_URL}privacy.html`;
export const TERMS_URL = `${SITE_URL}terms.html`;

/** Shown wherever the app talks about other companies' products. */
export const NOT_AFFILIATED =
  'lazyfill is an independent project. It is not affiliated with, endorsed by or sponsored by any employer, job board, applicant tracking system or AI provider. Product and company names belong to their owners and are used only to describe what lazyfill works with.';
