import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createProjectStorage, type StorageLike } from './storage.js';
import { useDebugFlag } from './debug-flags.js';

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
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
};

describe('useDebugFlag', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('lets URL overrides win until a shortcut toggle clears the override and persists the new value', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('mcts-web', {
      storage: backingStorage,
      version: 1,
    });

    backingStorage.setItem('mcts-web:v1:debug:grid', 'false');
    window.history.replaceState({}, '', '/?grid=0');

    const Example = () => {
      const debugFlag = useDebugFlag<HTMLDivElement>('grid', {
        hotkeys: 'g',
        label: 'Grid overlay',
        storage: projectStorage,
        urlParam: 'grid',
      });

      return (
        <div ref={debugFlag.ref} tabIndex={-1}>
          <button type="button">Inside</button>
          <span>{`${debugFlag.value}:${debugFlag.source}`}</span>
        </div>
      );
    };

    render(<Example />);

    const inside = screen.getByRole('button', { name: 'Inside' });

    expect(screen.getByText('false:url')).toBeInTheDocument();

    inside.focus();
    fireEvent.keyDown(inside, { code: 'KeyG', key: 'g' });

    expect(backingStorage.getItem('mcts-web:v1:debug:grid')).toBe('true');
    expect(window.location.search).toBe('');
    expect(screen.getByText('true:storage')).toBeInTheDocument();
  });
});
