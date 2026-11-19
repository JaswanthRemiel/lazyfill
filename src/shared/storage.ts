import type { LearnedStore } from './learned';
import type { AiSettings, Application, Profile } from './types';

interface Schema {
  lf_profile_cache: Profile[];
  lf_active_profile_id: string;
  lf_ai_settings: AiSettings;
  lf_applications_cache: Application[];
  lf_learned_fields: LearnedStore;
  lf_prompt_template: string;
}

export async function getItem<K extends keyof Schema>(key: K): Promise<Schema[K] | undefined> {
  const r = await chrome.storage.local.get(key);
  return r[key] as Schema[K] | undefined;
}

export async function setItem<K extends keyof Schema>(key: K, value: Schema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeItem(key: keyof Schema): Promise<void> {
  await chrome.storage.local.remove(key);
}
