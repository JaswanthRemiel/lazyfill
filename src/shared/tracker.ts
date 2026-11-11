import type { FirebaseConfig } from './types';
import { parseFirebaseConfig } from './firebaseConfig';

/** The project's home on GitHub. Not a service: lazyfill is software that people run themselves. */
export const REPO_URL = 'https://github.com/JaswanthRemiel/lazyfill';

/** What a person typed for their own web tracker, cleaned up: https (or localhost), no query or fragment, trailing slash. */
export function normalizeTrackerUrl(input: string): string {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    throw new Error('Enter the full address of your tracker, for example https://your-name.github.io/lazyfill/');
  }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !(local && u.protocol === 'http:')) throw new Error('The tracker address must start with https://');
  u.search = '';
  u.hash = '';
  return u.href.endsWith('/') ? u.href : `${u.href}/`;
}

const toB64Url = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

const SETUP = '#setup=';

/**
 * A link that opens the person's own tracker already connected to their Firebase project. The config travels in the
 * URL fragment, which browsers never send to a server, and the tracker removes it from the address bar on load.
 */
export function trackerLink(trackerUrl: string, cfg: FirebaseConfig): string {
  return `${trackerUrl}${SETUP}${toB64Url(JSON.stringify(cfg))}`;
}

/** Reads a config out of `#setup=...`, or null if the fragment is not one or does not hold a usable config. */
export function configFromHash(hash: string): FirebaseConfig | null {
  if (!hash.startsWith(SETUP)) return null;
  try {
    return parseFirebaseConfig(fromB64Url(hash.slice(SETUP.length)));
  } catch {
    return null;
  }
}

/**
 * Where the privacy policy and terms live: on the person's own tracker site when they have one (relative links on that
 * site itself), otherwise in the project's README.
 */
export function legalLinks(trackerUrl?: string | null): { privacy: string; terms: string } {
  if (trackerUrl) return { privacy: `${trackerUrl}privacy.html`, terms: `${trackerUrl}terms.html` };
  return { privacy: `${REPO_URL}#data-and-privacy`, terms: `${REPO_URL}#disclaimer-and-license` };
}
