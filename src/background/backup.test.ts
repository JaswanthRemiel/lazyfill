import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteAllData, exportBackup, importBackup, parseBackup } from './backup';

let local: Record<string, unknown> = {};

beforeEach(() => {
  local = {
    lf_profile_cache: [{ id: 'p1', name: 'Alex' }],
    lf_applications_cache: [{ id: 'a1' }],
    lf_resume_p1: { fileName: 'cv.pdf', mimeType: 'application/pdf', base64: 'AA==' },
    lf_ai_settings: { provider: 'openai', apiKey: 'sk-secret', model: '' },
    unrelated: 1,
  };
  const pick = (k: string | string[] | null) => (k === null ? { ...local } : Object.fromEntries([k].flat().map((x) => [x, local[x]])));
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (k: string | null) => pick(k),
        set: async (o: object) => Object.assign(local, o),
        remove: async (k: string | string[]) => [k].flat().forEach((x) => delete local[x]),
        clear: async () => { local = {}; },
      },
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('backup', () => {
  it('exports lazyfill data but never the AI key', async () => {
    const b = await exportBackup();
    expect(Object.keys(b.data).sort()).toEqual(['lf_applications_cache', 'lf_profile_cache', 'lf_resume_p1']);
    expect(JSON.stringify(b)).not.toContain('sk-secret');
  });

  it('round-trips, replacing old data and keeping the AI key', async () => {
    const text = JSON.stringify(await exportBackup());
    local.lf_profile_cache = [{ id: 'other', name: 'Other' }];
    local.lf_learned_fields = { stale: {} };
    await importBackup(text);
    expect(local.lf_profile_cache).toEqual([{ id: 'p1', name: 'Alex' }]);
    expect(local.lf_learned_fields).toBeUndefined();
    expect((local.lf_ai_settings as { apiKey: string }).apiKey).toBe('sk-secret');
  });

  it('rejects files that are not a usable backup', () => {
    expect(() => parseBackup('nope')).toThrow(/JSON/);
    expect(() => parseBackup('{"format":"x"}')).toThrow(/not a lazyfill backup/);
    expect(() => parseBackup('{"format":"lazyfill-backup","version":99,"data":{}}')).toThrow(/newer/);
    expect(() => parseBackup('{"format":"lazyfill-backup","version":1,"data":{"lf_profile_cache":"x"}}')).toThrow(/damaged/);
  });

  it('ignores an AI key or foreign keys smuggled into a backup', () => {
    const data = parseBackup(JSON.stringify({ format: 'lazyfill-backup', version: 1, data: { lf_ai_settings: { apiKey: 'evil' }, other: 1, lf_prompt_template: 'hi' } }));
    expect(data).toEqual({ lf_prompt_template: 'hi' });
  });

  it('delete all data clears storage', async () => {
    await deleteAllData();
    expect(local).toEqual({});
  });
});
