import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createProjectStorage, type StorageLike } from './storage.js';
import {
  resolveThemePreference,
  useThemePreference,
} from './theme.js';

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

const createThemeWindow = (prefersDark: boolean) => ({
  matchMedia: () => ({
    addEventListener: () => {},
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    removeEventListener: () => {},
  }),
  document: window.document,
}) as unknown as Window;

describe('theme helpers', () => {
  it('resolves system preferences to the active theme', () => {
    expect(resolveThemePreference('system', 'dark')).toBe('dark');
    expect(resolveThemePreference('light', 'dark')).toBe('light');
  });

  it('persists theme preference and applies the resolved theme to the document root', () => {
    const backingStorage = createMemoryStorage();
    const projectStorage = createProjectStorage('wordlink', {
      storage: backingStorage,
      version: 1,
    });

    const Example = () => {
      const {
        resolvedTheme,
        setThemePreference,
        source,
        systemTheme,
        themePreference,
      } = useThemePreference(projectStorage, {
        applyToDocument: true,
        window: createThemeWindow(true),
      });

      return (
        <div>
          <span>{`${themePreference}:${systemTheme}:${resolvedTheme}:${source}`}</span>
          <button type="button" onClick={() => setThemePreference('light')}>
            Set Light
          </button>
        </div>
      );
    };

    render(<Example />);

    expect(screen.getByText('system:dark:dark:default')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(screen.getByRole('button', { name: 'Set Light' }));

    expect(backingStorage.getItem('wordlink:v1:theme-preference')).toBe('light');
    expect(screen.getByText('light:dark:light:storage')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
