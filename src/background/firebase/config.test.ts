import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const local: Record<string, unknown> = {};
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  for (const k of Object.keys(local)) delete local[k];
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (k: string | null) => (k === null ? { ...local } : { [k]: local[k] }),
        set: async (o: object) => Object.assign(local, o),
        remove: async (k: string | string[]) => { for (const x of Array.isArray(k) ? k : [k]) delete local[x]; },
      },
    },
  });
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const reply = (message: string, status = 400) => ({ ok: false, status, json: async () => ({ error: { message } }) });
const A = '{ apiKey: "key-a", projectId: "project-a" }';
const B = '{ apiKey: "key-b", projectId: "project-b" }';

describe('Firebase config', () => {
  it('is not configured until one is saved', async () => {
    const { firebaseStatus, getFirebaseConfig, NotConfiguredError } = await import('./config');
    expect(await firebaseStatus()).toEqual({ configured: false, projectId: '', source: 'none' });
    await expect(getFirebaseConfig()).rejects.toBeInstanceOf(NotConfiguredError);
  });

  it('saves a pasted config and serves it back', async () => {
    fetchMock.mockResolvedValue(reply('INVALID_ID_TOKEN'));
    const { saveFirebaseConfig, getFirebaseConfig, firebaseStatus } = await import('./config');
    expect(await saveFirebaseConfig(A)).toEqual({ projectId: 'project-a', note: undefined });
    expect(await getFirebaseConfig()).toEqual({ apiKey: 'key-a', projectId: 'project-a' });
    expect(await firebaseStatus()).toEqual({ configured: true, projectId: 'project-a', source: 'pasted' });
    expect(String(fetchMock.mock.calls[0][0])).toContain('key=key-a');
  });

  it('rejects text it cannot read and a key Firebase says is invalid, saving nothing', async () => {
    const { saveFirebaseConfig, firebaseStatus } = await import('./config');
    await expect(saveFirebaseConfig('nonsense')).rejects.toThrow(/from \{ to \}/);
    fetchMock.mockResolvedValue(reply('API key not valid. Please pass a valid API key.'));
    await expect(saveFirebaseConfig(A)).rejects.toThrow(/not valid/);
    fetchMock.mockResolvedValue(reply('API_KEY_HTTP_REFERRER_BLOCKED'));
    await expect(saveFirebaseConfig(A)).rejects.toThrow(/restricted/);
    expect((await firebaseStatus()).configured).toBe(false);
  });

  it('saves anyway when Firebase cannot be reached, and says it was not checked', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    const { saveFirebaseConfig, firebaseStatus } = await import('./config');
    expect((await saveFirebaseConfig(A)).note).toMatch(/not verified/);
    expect((await firebaseStatus()).configured).toBe(true);
  });

  it('points at the Authentication switch when the project has not enabled it', async () => {
    fetchMock.mockResolvedValue(reply('Identity Toolkit API has not been used in project 1 before or it is disabled.', 403));
    const { saveFirebaseConfig } = await import('./config');
    expect((await saveFirebaseConfig(A)).note).toMatch(/Authentication/);
  });

  it('keeps local data when the same project is saved again, and clears it when the project changes', async () => {
    fetchMock.mockResolvedValue(reply('INVALID_ID_TOKEN'));
    const { saveFirebaseConfig } = await import('./config');
    await saveFirebaseConfig(A);
    Object.assign(local, { lf_session: { uid: 'u' }, lf_profile_cache: [1], lf_applications_cache: [2], lf_pending_writes: [3], lf_resume_p1: 'x', lf_ai_settings: { provider: 'gemini' }, lf_prompt_template: 't' });
    await saveFirebaseConfig('{ apiKey: "key-a2", projectId: "project-a" }');
    expect(local.lf_session).toBeDefined();
    await saveFirebaseConfig(B);
    for (const k of ['lf_session', 'lf_profile_cache', 'lf_applications_cache', 'lf_pending_writes', 'lf_resume_p1']) expect(local[k]).toBeUndefined();
    expect(local.lf_ai_settings).toBeDefined(); // AI key and prompt are not tied to a project
    expect(local.lf_prompt_template).toBeDefined();
  });

  it('removes the pasted config', async () => {
    fetchMock.mockResolvedValue(reply('INVALID_ID_TOKEN'));
    const { saveFirebaseConfig, clearFirebaseConfig, firebaseStatus } = await import('./config');
    await saveFirebaseConfig(A);
    local.lf_session = { uid: 'u' };
    await clearFirebaseConfig();
    expect((await firebaseStatus()).configured).toBe(false);
    expect(local.lf_session).toBeUndefined();
  });
});

describe('build-time config', () => {
  it('is used when nothing was pasted, and a pasted one wins', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'built-key');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'built-project');
    fetchMock.mockResolvedValue(reply('INVALID_ID_TOKEN'));
    const { firebaseStatus, getFirebaseConfig, saveFirebaseConfig } = await import('./config');
    expect(await firebaseStatus()).toEqual({ configured: true, projectId: 'built-project', source: 'build' });
    expect((await getFirebaseConfig()).apiKey).toBe('built-key');
    await saveFirebaseConfig(A);
    expect((await getFirebaseConfig()).apiKey).toBe('key-a');
    vi.unstubAllEnvs();
  });
});

describe('tracker link', () => {
  it('is null until a tracker address is saved, then carries the Firebase config', async () => {
    fetchMock.mockResolvedValue(reply('INVALID_ID_TOKEN'));
    const { getTrackerLink, saveFirebaseConfig } = await import('./config');
    const { configFromHash } = await import('../../shared/tracker');
    expect(await getTrackerLink()).toBeNull();
    local.lf_tracker_url = 'https://me.github.io/lazyfill/';
    expect(await getTrackerLink()).toBe('https://me.github.io/lazyfill/'); // no project yet: plain address
    await saveFirebaseConfig(A);
    const link = (await getTrackerLink())!;
    expect(configFromHash(link.slice(link.indexOf('#')))).toEqual({ apiKey: 'key-a', projectId: 'project-a' });
  });
});
