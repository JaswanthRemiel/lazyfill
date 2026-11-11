import { describe, expect, it } from 'vitest';
import { configFromHash, legalLinks, normalizeTrackerUrl, REPO_URL, trackerLink } from './tracker';

describe('normalizeTrackerUrl', () => {
  it('keeps an https address and adds the trailing slash', () => {
    expect(normalizeTrackerUrl(' https://me.github.io/lazyfill ')).toBe('https://me.github.io/lazyfill/');
    expect(normalizeTrackerUrl('https://me.github.io/lazyfill/')).toBe('https://me.github.io/lazyfill/');
  });
  it('drops a query string and fragment', () => {
    expect(normalizeTrackerUrl('https://me.github.io/x/?a=1#setup=zzz')).toBe('https://me.github.io/x/');
  });
  it('allows plain http only for localhost', () => {
    expect(normalizeTrackerUrl('http://localhost:4173/')).toBe('http://localhost:4173/');
    expect(() => normalizeTrackerUrl('http://example.com/')).toThrow(/https/);
  });
  it('explains what is wrong with something that is not an address', () => {
    expect(() => normalizeTrackerUrl('me.github.io/lazyfill')).toThrow(/full address/);
    expect(() => normalizeTrackerUrl('')).toThrow(/full address/);
  });
});

describe('setup links', () => {
  const cfg = { apiKey: 'AIzaFake', projectId: 'demo-app', authDomain: 'demo-app.firebaseapp.com' };

  it('round-trips a config through the fragment', () => {
    const link = trackerLink('https://me.github.io/lazyfill/', cfg);
    expect(link.startsWith('https://me.github.io/lazyfill/#setup=')).toBe(true);
    expect(configFromHash(link.slice(link.indexOf('#')))).toEqual(cfg);
  });
  it('ignores fragments that are not a setup link or are damaged', () => {
    expect(configFromHash('')).toBeNull();
    expect(configFromHash('#/applications')).toBeNull();
    expect(configFromHash('#setup=!!!not-base64')).toBeNull();
    expect(configFromHash(`#setup=${btoa('{"apiKey":"k"}')}`)).toBeNull(); // no projectId
  });
});

describe('legalLinks', () => {
  it('points at the person\'s own site when they have one', () => {
    expect(legalLinks('https://me.github.io/lazyfill/')).toEqual({ privacy: 'https://me.github.io/lazyfill/privacy.html', terms: 'https://me.github.io/lazyfill/terms.html' });
  });
  it('falls back to the project README', () => {
    expect(legalLinks()).toEqual({ privacy: `${REPO_URL}#data-and-privacy`, terms: `${REPO_URL}#disclaimer-and-license` });
    expect(legalLinks(null).privacy).toContain(REPO_URL);
  });
});
