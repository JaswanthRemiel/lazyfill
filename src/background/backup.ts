// A single JSON file holding everything lazyfill keeps in this browser, so people can move to another computer or
// survive a reinstall. The AI key is never written to it.

const FORMAT = 'lazyfill-backup';
const VERSION = 1;
const SECRET_KEYS = ['lf_ai_settings'];
const ARRAY_KEYS = ['lf_profile_cache', 'lf_applications_cache'];

const isData = (k: string) => k.startsWith('lf_') && !SECRET_KEYS.includes(k);

export interface Backup {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export async function exportBackup(): Promise<Backup> {
  const all = await chrome.storage.local.get(null);
  const data = Object.fromEntries(Object.entries(all).filter(([k]) => isData(k)));
  return { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), data };
}

/** Checks a backup file without touching storage. Throws a message a person can act on. */
export function parseBackup(text: string): Record<string, unknown> {
  let b: Partial<Backup>;
  try {
    b = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!b || typeof b !== 'object' || b.format !== FORMAT) throw new Error('That file is not a lazyfill backup.');
  if (typeof b.version !== 'number' || b.version > VERSION) throw new Error('That backup was made by a newer version of lazyfill. Update the extension first.');
  if (!b.data || typeof b.data !== 'object' || Array.isArray(b.data)) throw new Error('The backup has no data in it.');
  const data = Object.fromEntries(Object.entries(b.data).filter(([k]) => isData(k)));
  for (const k of ARRAY_KEYS) if (k in data && !Array.isArray(data[k])) throw new Error('The backup is damaged.');
  return data;
}

/** Replaces this browser's lazyfill data with the backup. The AI key is kept. */
export async function importBackup(text: string): Promise<{ keys: number }> {
  const data = parseBackup(text);
  const old = Object.keys(await chrome.storage.local.get(null)).filter(isData);
  await chrome.storage.local.remove(old);
  await chrome.storage.local.set(data);
  return { keys: Object.keys(data).length };
}

/** Wipes everything lazyfill stores in this browser, including the AI key and settings. */
export async function deleteAllData(): Promise<void> {
  await Promise.all([chrome.storage.local.clear(), chrome.storage.session?.clear?.(), chrome.storage.sync?.clear?.()]);
}
