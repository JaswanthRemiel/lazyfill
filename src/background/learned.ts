import { normalizeLabel, type LearnedEntry, type LearnedMap, type LearnedStore } from '../shared/learned';
import { getItem, setItem } from '../shared/storage';

const read = async (): Promise<LearnedStore> => (await getItem('lf_learned_fields')) ?? {};

// chrome.storage has no transactions; serialise read-modify-write so two quick saves cannot lose one
let chain: Promise<unknown> = Promise.resolve();
const exclusive = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
};

export async function getLearned(profileId: string, scope: string): Promise<LearnedMap> {
  return (await read())[profileId]?.[scope] ?? {};
}

export async function listLearned(): Promise<LearnedStore> {
  return read();
}

type NewEntry = Omit<LearnedEntry, 'firstSeen' | 'lastUsed' | 'timesUsed' | 'source'>;

export async function saveLearned(profileId: string, scope: string, label: string, entry: NewEntry): Promise<void> {
  const key = normalizeLabel(label);
  if (!key) return;
  await exclusive(async () => {
    const store = await read();
    const map = ((store[profileId] ??= {})[scope] ??= {});
    const prev = map[key];
    const now = new Date().toISOString();
    map[key] = { ...entry, originalLabel: entry.originalLabel.trim(), firstSeen: prev?.firstSeen ?? now, lastUsed: now, timesUsed: prev?.timesUsed ?? 0, source: 'manual' };
    await setItem('lf_learned_fields', store);
  });
}

/** Count a replay. */
export async function learnedUsed(profileId: string, scope: string, keys: string[]): Promise<void> {
  await exclusive(async () => {
    const store = await read();
    const map = store[profileId]?.[scope];
    if (!map) return;
    const now = new Date().toISOString();
    for (const k of keys) if (map[k]) map[k] = { ...map[k], timesUsed: map[k].timesUsed + 1, lastUsed: now };
    await setItem('lf_learned_fields', store);
  });
}

/** Edit an answer from the dashboard; it becomes a plain text answer. */
export async function updateLearned(profileId: string, scope: string, key: string, value: string): Promise<void> {
  await exclusive(async () => {
    const store = await read();
    const e = store[profileId]?.[scope]?.[key];
    if (!e) return;
    store[profileId][scope][key] = { ...e, value, selectedOptionText: value, lastUsed: new Date().toISOString(), source: 'edited' };
    await setItem('lf_learned_fields', store);
  });
}

export async function deleteLearned(profileId: string, scope: string, key: string): Promise<void> {
  await exclusive(async () => {
    const store = await read();
    const map = store[profileId]?.[scope];
    if (!map?.[key]) return;
    delete map[key];
    if (!Object.keys(map).length) delete store[profileId][scope];
    await setItem('lf_learned_fields', store);
  });
}

export async function clearLearned(profileId: string): Promise<void> {
  await exclusive(async () => {
    const store = await read();
    delete store[profileId];
    await setItem('lf_learned_fields', store);
  });
}
