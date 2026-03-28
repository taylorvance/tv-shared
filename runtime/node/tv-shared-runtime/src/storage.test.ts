import { describe, expect, it } from 'vitest';
import { createProjectStorage, type StorageLike } from './storage.js';

const createMemoryStorage = (): StorageLike => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()].sort()[index] ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
};

describe('createProjectStorage', () => {
  it('builds versioned project keys without leaking across projects', () => {
    const mctsStorage = createProjectStorage('mcts-web', { version: 1 });
    const wordlinkStorage = createProjectStorage('wordlink', { version: 1 });

    expect(mctsStorage.key('app')).toBe('mcts-web:v1:app');
    expect(mctsStorage.key('session', 'Onitama')).toBe('mcts-web:v1:session:Onitama');
    expect(wordlinkStorage.key('theme-preference')).toBe('wordlink:v1:theme-preference');
  });

  it('round-trips string and JSON values through the configured storage', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('wordlink', {
      storage: backingStorage,
      version: 2,
    });

    projectStorage.writeString('dark', 'theme-preference');
    projectStorage.writeJson({ expanded: true }, 'panels', 'complexity');

    expect(backingStorage.getItem('wordlink:v2:theme-preference')).toBe('dark');
    expect(projectStorage.readString('theme-preference')).toBe('dark');
    expect(projectStorage.readJson<{ expanded: boolean }>('panels', 'complexity')).toEqual({
      expanded: true,
    });
  });

  it('removes namespaced keys without affecting other values', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('mcts-web', {
      storage: backingStorage,
      version: 1,
    });

    backingStorage.setItem('mcts-web:v1:app', '{"selectedGame":"Onitama"}');
    backingStorage.setItem('wordlink:v1:theme-preference', 'dark');

    projectStorage.remove('app');

    expect(backingStorage.getItem('mcts-web:v1:app')).toBeNull();
    expect(backingStorage.getItem('wordlink:v1:theme-preference')).toBe('dark');
  });

  it('lists and clears only the active namespace', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('mcts-web', {
      storage: backingStorage,
      version: 1,
    });

    backingStorage.setItem('mcts-web:v1:app', '{"selectedGame":"Onitama"}');
    backingStorage.setItem('mcts-web:v1:session:Onitama', '{"history":["__INITIAL_STATE__"]}');
    backingStorage.setItem('wordlink:v1:theme-preference', 'dark');

    expect(projectStorage.list()).toEqual([
      {
        fullKey: 'mcts-web:v1:app',
        rawValue: '{"selectedGame":"Onitama"}',
        relativeKey: 'app',
      },
      {
        fullKey: 'mcts-web:v1:session:Onitama',
        rawValue: '{"history":["__INITIAL_STATE__"]}',
        relativeKey: 'session:Onitama',
      },
    ]);

    projectStorage.clear();

    expect(projectStorage.list()).toEqual([]);
    expect(backingStorage.getItem('wordlink:v1:theme-preference')).toBe('dark');
  });

  it('returns null for invalid JSON and unavailable storage', () => {
    const backingStorage = createMemoryStorage();
    backingStorage.setItem('mcts-web:v1:app', '{bad json');

    const projectStorage = createProjectStorage('mcts-web', {
      storage: backingStorage,
      version: 1,
    });
    const unavailableStorage = createProjectStorage('mcts-web', { storage: null, version: 1 });

    expect(projectStorage.readJson('app')).toBeNull();
    expect(unavailableStorage.readString('app')).toBeNull();
    expect(() => unavailableStorage.writeJson({ selectedGame: 'Onitama' }, 'app')).not.toThrow();
  });

  it('tolerates storage access failures', () => {
    const throwingStorage: StorageLike = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    };
    const projectStorage = createProjectStorage('mcts-web', {
      storage: throwingStorage,
      version: 1,
    });

    expect(projectStorage.readString('app')).toBeNull();
    expect(() => projectStorage.writeString('value', 'app')).not.toThrow();
    expect(() => projectStorage.remove('app')).not.toThrow();
  });

  it('tolerates JSON serialization failures', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('mcts-web', {
      storage: backingStorage,
      version: 1,
    });
    const circularValue: Record<string, unknown> = {};

    circularValue.self = circularValue;

    expect(() => projectStorage.writeJson(circularValue, 'app')).not.toThrow();
    expect(backingStorage.getItem('mcts-web:v1:app')).toBeNull();
  });

  it('rejects empty project keys and key parts', () => {
    expect(() => createProjectStorage('', { version: 1 })).toThrow('projectKey must not be empty.');

    const projectStorage = createProjectStorage('mcts-web', { version: 1 });

    expect(() => projectStorage.key('')).toThrow('key part 1 must not be empty.');
  });
});
