import { describe, expect, it } from 'vitest';
import { ConfigParseError, parseFirebaseConfig } from './firebaseConfig';

const snippet = `// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaFakeKeyForTests",
  authDomain: "demo-app.firebaseapp.com",
  projectId: "demo-app",
  storageBucket: "demo-app.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
  measurementId: "G-ABCDEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);`;

describe('parseFirebaseConfig', () => {
  it('reads the snippet the Firebase console shows', () => {
    expect(parseFirebaseConfig(snippet)).toEqual({
      apiKey: 'AIzaFakeKeyForTests', authDomain: 'demo-app.firebaseapp.com', projectId: 'demo-app',
      storageBucket: 'demo-app.firebasestorage.app', messagingSenderId: '1234567890', appId: '1:1234567890:web:abcdef', measurementId: 'G-ABCDEF',
    });
  });

  it('reads JSON, single quotes, backticks and trailing commas', () => {
    expect(parseFirebaseConfig('{"apiKey":"k1","projectId":"p-1"}')).toEqual({ apiKey: 'k1', projectId: 'p-1' });
    expect(parseFirebaseConfig("{ apiKey: 'k2', projectId: 'p-2', }")).toEqual({ apiKey: 'k2', projectId: 'p-2' });
    expect(parseFirebaseConfig('{ apiKey: `k3`, projectId: `p-3` }')).toMatchObject({ apiKey: 'k3', projectId: 'p-3' });
  });

  it('ignores commented-out lines and fields it does not know', () => {
    const cfg = parseFirebaseConfig('{\n // apiKey: "old",\n apiKey: "new", /* projectId: "x" */ projectId: "real", databaseURL: "https://x.firebaseio.com", extra: "no"\n}');
    expect(cfg).toEqual({ apiKey: 'new', projectId: 'real' });
  });

  it('never evaluates what it is given', () => {
    const g = globalThis as unknown as { pwned?: boolean };
    parseFirebaseConfig('{ apiKey: (globalThis.pwned = true, "k"), projectId: "p-1" }'.replace('(globalThis.pwned = true, "k")', '"k"'));
    expect(g.pwned).toBeUndefined();
    expect(() => parseFirebaseConfig('{ apiKey: globalThis.pwned = true, projectId: "p" }')).toThrow(ConfigParseError);
    expect(g.pwned).toBeUndefined();
  });

  it('explains what is missing or wrong', () => {
    expect(() => parseFirebaseConfig('')).toThrow(/paste/i);
    expect(() => parseFirebaseConfig('apiKey: "k"')).toThrow(/from \{ to \}/);
    expect(() => parseFirebaseConfig('{ projectId: "p-1" }')).toThrow(/apiKey/);
    expect(() => parseFirebaseConfig('{ apiKey: "k" }')).toThrow(/projectId/);
    expect(() => parseFirebaseConfig('{ apiKey: "has space", projectId: "p-1" }')).toThrow(/apiKey/);
    expect(() => parseFirebaseConfig('{ apiKey: "k", projectId: "Bad Id!" }')).toThrow(/projectId/);
  });
});
