import { getItem, setItem } from '../shared/storage';
import type { Application, Profile } from '../shared/types';
import { normaliseProfileData } from '../shared/profile';

// Everything lives in chrome.storage.local, in this browser only. The key names are historical ("cache").

/** Older or partial records are upgraded to the current shape on read. */
const withData = (p: Profile): Profile => ({ ...p, data: normaliseProfileData(p.data) });

// ---- profiles ----

export async function listProfiles(): Promise<Profile[]> {
  const profiles = ((await getItem('lf_profile_cache')) ?? []).map(withData);
  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveProfile(profile: Profile): Promise<void> {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  const all = (await getItem('lf_profile_cache')) ?? [];
  await setItem('lf_profile_cache', [...all.filter((p) => p.id !== next.id), next]);
}

export async function deleteProfile(id: string): Promise<void> {
  const all = (await getItem('lf_profile_cache')) ?? [];
  await setItem('lf_profile_cache', all.filter((p) => p.id !== id));
  if ((await getItem('lf_active_profile_id')) === id) await chrome.storage.local.remove('lf_active_profile_id');
  await deleteResume(id);
}

export async function setActiveProfile(id: string): Promise<void> {
  await setItem('lf_active_profile_id', id);
}

export async function getActiveProfile(): Promise<Profile | null> {
  const [all, id] = await Promise.all([getItem('lf_profile_cache'), getItem('lf_active_profile_id')]);
  if (!all?.length) return null;
  return withData(all.find((p) => p.id === id) ?? all[0]);
}

// ---- applications ----

const sortApps = (apps: Application[]) =>
  [...apps].sort((a, b) => (b.submittedAt ?? b.filledAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.filledAt ?? a.createdAt));

export async function listApplications(): Promise<Application[]> {
  return sortApps((await getItem('lf_applications_cache')) ?? []);
}

export async function getCachedApplication(id: string): Promise<Application | undefined> {
  return ((await getItem('lf_applications_cache')) ?? []).find((a) => a.id === id);
}

export async function saveApplication(application: Application): Promise<void> {
  const next = { ...application, updatedAt: new Date().toISOString() };
  const all = (await getItem('lf_applications_cache')) ?? [];
  await setItem('lf_applications_cache', sortApps([...all.filter((a) => a.id !== next.id), next]));
}

export async function deleteApplication(id: string): Promise<void> {
  const all = (await getItem('lf_applications_cache')) ?? [];
  await setItem('lf_applications_cache', all.filter((a) => a.id !== id));
}

// ---- resumes: one file per profile ----

const resumeKey = (profileId: string) => `lf_resume_${profileId}`;

export interface ResumeFile {
  fileName: string;
  mimeType: string;
  base64: string;
}

export async function saveResume(profileId: string, file: ResumeFile): Promise<void> {
  await chrome.storage.local.set({ [resumeKey(profileId)]: file });
}

export async function getResume(profileId: string): Promise<ResumeFile | null> {
  const key = resumeKey(profileId);
  return ((await chrome.storage.local.get(key))[key] as ResumeFile | undefined) ?? null;
}

export async function deleteResume(profileId: string): Promise<void> {
  await chrome.storage.local.remove(resumeKey(profileId));
}
