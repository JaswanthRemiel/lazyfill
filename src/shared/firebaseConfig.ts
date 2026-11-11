import type { FirebaseConfig } from './types';

const FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'] as const;

export class ConfigParseError extends Error {}

/** Drops // line comments and block comments, which the console's snippet can contain. */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * Reads the Firebase web app config the way the console shows it: a JavaScript snippet such as
 * `const firebaseConfig = { apiKey: "...", projectId: "..." };`, or the same object as JSON.
 * The text is only scanned for `name: "value"` pairs, never evaluated.
 */
export function parseFirebaseConfig(text: string): FirebaseConfig {
  const src = stripComments(text).trim();
  if (!src) throw new ConfigParseError('Paste the Firebase config first.');
  const open = src.indexOf('{');
  const close = src.lastIndexOf('}');
  if (open < 0 || close < open) throw new ConfigParseError('Paste the whole config block from the Firebase console, from { to }.');

  const found: Partial<Record<(typeof FIELDS)[number], string>> = {};
  const pair = /["'`]?([A-Za-z][A-Za-z0-9_]*)["'`]?\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)/g;
  for (const m of src.slice(open + 1, close).matchAll(pair)) {
    const key = m[1] as (typeof FIELDS)[number];
    if (!FIELDS.includes(key)) continue;
    found[key] = (m[2] ?? m[3] ?? m[4] ?? '').replace(/\\(.)/g, '$1').trim();
  }

  if (!found.apiKey) throw new ConfigParseError('The config has no apiKey. Copy the whole block for your web app.');
  if (!found.projectId) throw new ConfigParseError('The config has no projectId. Copy the whole block for your web app.');
  if (/\s/.test(found.apiKey)) throw new ConfigParseError('The apiKey looks wrong: it should be a single string with no spaces.');
  if (!/^[a-z0-9][a-z0-9.:-]*$/i.test(found.projectId)) throw new ConfigParseError('The projectId looks wrong: expected letters, digits and hyphens.');

  const out: FirebaseConfig = { apiKey: found.apiKey, projectId: found.projectId };
  for (const k of FIELDS) if (k !== 'apiKey' && k !== 'projectId' && found[k]) out[k] = found[k];
  return out;
}

export interface FirebaseSetupStatus {
  configured: boolean;
  projectId: string;
  /** where the active config comes from: pasted by the user, baked in at build time, or missing */
  source: 'pasted' | 'build' | 'none';
}
