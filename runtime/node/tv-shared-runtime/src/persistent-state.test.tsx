import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createStringCodec } from './codecs.js';
import { usePersistentState } from './persistent-state.js';
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
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
};

describe('usePersistentState', () => {
  it('keeps multiple hook instances in sync for the same storage key', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('wordlink', {
      storage: backingStorage,
      version: 1,
    });

    const ValueView = ({ label }: { label: string }) => {
      const [themePreference, setThemePreference, controls] = usePersistentState(
        projectStorage,
        'theme-preference',
        {
          codec: createStringCodec(),
          defaultValue: 'system',
        },
      );

      return (
        <div>
          <span>{`${label}:${themePreference}:${controls.source}`}</span>
          <button type="button" onClick={() => setThemePreference('dark')}>
            {`Set ${label}`}
          </button>
          <button type="button" onClick={controls.clear}>
            {`Clear ${label}`}
          </button>
        </div>
      );
    };

    render(
      <>
        <ValueView label="A" />
        <ValueView label="B" />
      </>,
    );

    expect(screen.getByText('A:system:default')).toBeInTheDocument();
    expect(screen.getByText('B:system:default')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Set A' }));

    expect(backingStorage.getItem('wordlink:v1:theme-preference')).toBe('dark');
    expect(screen.getByText('A:dark:storage')).toBeInTheDocument();
    expect(screen.getByText('B:dark:storage')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear B' }));

    expect(backingStorage.getItem('wordlink:v1:theme-preference')).toBeNull();
    expect(screen.getByText('A:system:default')).toBeInTheDocument();
    expect(screen.getByText('B:system:default')).toBeInTheDocument();
  });
});
