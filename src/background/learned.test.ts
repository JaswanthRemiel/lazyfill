import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeLabel, type LearnedEntry } from '../shared/learned';

const local: Record<string, unknown> = {};

beforeEach(() => {
  vi.resetModules();
  for (const k of Object.keys(local)) delete local[k];
  vi.stubGlobal('chrome', { storage: { local: { get: async (k: string) => ({ [k]: local[k] }), set: async (o: object) => Object.assign(local, o), remove: async (k: string) => delete local[k] } } });
});
afterEach(() => vi.unstubAllGlobals());

const entry = (value: string, over: Partial<LearnedEntry> = {}) => ({
  originalLabel: 'Favourite language', value, fieldType: 'text' as const, selectedOptionText: null, selectedIndex: null, options: null, lastUrl: 'https://x.test/job', ...over,
});

describe('learned answers store', () => {
  it('saves per profile and platform, keyed by the normalised question', async () => {
    const L = await import('./learned');
    await L.saveLearned('p1', 'greenhouse', 'Favourite language?  *', entry('TypeScript'));
    await L.saveLearned('p1', 'lever', 'Favourite language', entry('Rust'));
    await L.saveLearned('p2', 'greenhouse', 'Favourite language', entry('Go'));
    const key = normalizeLabel('Favourite language');
    expect((await L.getLearned('p1', 'greenhouse'))[key].value).toBe('TypeScript');
    expect((await L.getLearned('p1', 'lever'))[key].value).toBe('Rust');
    expect((await L.getLearned('p2', 'greenhouse'))[key].value).toBe('Go');
    expect(await L.getLearned('p3', 'greenhouse')).toEqual({});
  });

  it('a second save of the same question updates the value but keeps firstSeen and usage', async () => {
    const L = await import('./learned');
    const key = normalizeLabel('Favourite language');
    await L.saveLearned('p1', 'x', 'Favourite language', entry('A'));
    const first = (await L.getLearned('p1', 'x'))[key];
    await L.learnedUsed('p1', 'x', [key, key]);
    await L.saveLearned('p1', 'x', 'Favourite language', entry('B'));
    const e = (await L.getLearned('p1', 'x'))[key];
    expect(e.value).toBe('B');
    expect(e.firstSeen).toBe(first.firstSeen);
    expect(e.timesUsed).toBe(2);
  });

  it('edits and deletes', async () => {
    const L = await import('./learned');
    const key = normalizeLabel('Favourite language');
    await L.saveLearned('p1', 'x', 'Favourite language', entry('A', { fieldType: 'select', selectedOptionText: 'A' }));
    await L.updateLearned('p1', 'x', key, 'Edited');
    const e = (await L.getLearned('p1', 'x'))[key];
    expect(e).toMatchObject({ value: 'Edited', selectedOptionText: 'Edited', source: 'edited' });
    await L.deleteLearned('p1', 'x', key);
    expect(await L.getLearned('p1', 'x')).toEqual({});
    expect((await L.listLearned()).p1?.x).toBeUndefined();
  });

  it('clearing a profile removes all its answers', async () => {
    const L = await import('./learned');
    await L.saveLearned('p1', 'x', 'Q one', entry('1', { originalLabel: 'Q one' }));
    await L.saveLearned('p1', 'y', 'Q two', entry('2', { originalLabel: 'Q two' }));
    await L.clearLearned('p1');
    expect((await L.listLearned()).p1).toBeUndefined();
  });

  it('ignores an empty question', async () => {
    const L = await import('./learned');
    await L.saveLearned('p1', 'x', '   *  ', entry('A'));
    expect(await L.getLearned('p1', 'x')).toEqual({});
  });
});
