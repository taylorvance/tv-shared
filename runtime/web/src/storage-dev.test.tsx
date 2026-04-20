import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  exportProjectStorageNamespace,
  importProjectStorageNamespace,
  parseProjectStorageNamespace,
  ProjectStorageInspector,
  stringifyProjectStorageNamespace,
} from './storage-dev.js';
import { createProjectStorage } from './storage.js';
import type { StorageLike } from './storage.js';

const createMemoryStorage = (initialEntries: Record<string, string> = {}): StorageLike => {
  const values = new Map<string, string>(Object.entries(initialEntries));

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

describe('ProjectStorageInspector', () => {
  it('exports, parses, and imports namespace JSON', () => {
    const sourceStorage = createMemoryStorage({
      'mcts-web:v1:app': '{"selectedGame":"Onitama"}',
      'mcts-web:v1:session:Onitama': '{"history":["__INITIAL_STATE__"]}',
    });
    const targetStorage = createMemoryStorage({
      'mcts-web:v1:stale': 'true',
    });
    const sourceNamespace = createProjectStorage('mcts-web', { storage: sourceStorage, version: 1 });
    const targetNamespace = createProjectStorage('mcts-web', { storage: targetStorage, version: 1 });
    const serialized = stringifyProjectStorageNamespace(sourceNamespace);
    const parsed = parseProjectStorageNamespace(serialized);

    expect(exportProjectStorageNamespace(sourceNamespace)).toEqual(parsed);

    importProjectStorageNamespace(targetNamespace, parsed, { mode: 'replace' });

    expect(targetStorage.getItem('mcts-web:v1:stale')).toBeNull();
    expect(targetStorage.getItem('mcts-web:v1:app')).toBe('{"selectedGame":"Onitama"}');
    expect(targetStorage.getItem('mcts-web:v1:session:Onitama')).toBe('{"history":["__INITIAL_STATE__"]}');
  });

  it('round-trips literal separators through keyParts in namespace JSON', () => {
    const sourceStorage = createMemoryStorage({
      'wordlink:v1:a%3Ab': 'literal-colon',
      'wordlink:v1:a:b': 'nested',
    });
    const sourceNamespace = createProjectStorage('wordlink', { storage: sourceStorage, version: 1 });
    const serialized = stringifyProjectStorageNamespace(sourceNamespace);
    const parsed = parseProjectStorageNamespace(serialized);
    const targetStorage = createMemoryStorage();
    const targetNamespace = createProjectStorage('wordlink', { storage: targetStorage, version: 1 });

    expect(parsed.entries).toEqual([
      {
        keyParts: ['a', 'b'],
        rawValue: 'nested',
        relativeKey: 'a:b',
      },
      {
        keyParts: ['a:b'],
        rawValue: 'literal-colon',
        relativeKey: 'a:b',
      },
    ]);

    importProjectStorageNamespace(targetNamespace, parsed, { mode: 'replace' });

    expect(targetStorage.getItem('wordlink:v1:a%3Ab')).toBe('literal-colon');
    expect(targetStorage.getItem('wordlink:v1:a:b')).toBe('nested');
  });

  it('rejects namespace imports that target a different project/version', () => {
    const snapshot = parseProjectStorageNamespace(JSON.stringify({
      entries: [{ relativeKey: 'app', rawValue: '{"selectedGame":"Onitama"}' }],
      projectKey: 'mcts-web',
      version: 2,
    }));
    const targetNamespace = createProjectStorage('mcts-web', {
      storage: createMemoryStorage(),
      version: 1,
    });

    expect(() => importProjectStorageNamespace(targetNamespace, snapshot)).toThrow(
      'Imported namespace does not match the selected project key and version.',
    );
  });

  it('lists namespaced keys and clears only the active namespace', async () => {
    const storage = createMemoryStorage({
      'mcts-web:v1:app': '{"selectedGame":"Onitama"}',
      'mcts-web:v1:session:Onitama': '{"history":["__INITIAL_STATE__"]}',
      'wordlink:v1:theme-preference': 'dark',
    });

    render(<ProjectStorageInspector projectKey="mcts-web" storage={storage} version={1} />);

    expect(await screen.findByRole('button', { name: /app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /session:Onitama/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Namespace' }));

    await waitFor(() => {
      expect(storage.getItem('mcts-web:v1:app')).toBeNull();
      expect(storage.getItem('mcts-web:v1:session:Onitama')).toBeNull();
    });

    expect(storage.getItem('wordlink:v1:theme-preference')).toBe('dark');
  });

  it('can save and remove raw values for the selected version', async () => {
    const storage = createMemoryStorage();

    render(
      <ProjectStorageInspector
        defaultRelativeKey="theme-preference"
        projectKey="wordlink"
        storage={storage}
        version={1}
      />,
    );

    fireEvent.change(screen.getByLabelText('Raw value'), { target: { value: 'dark' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Raw Value' }));

    await waitFor(() => {
      expect(storage.getItem('wordlink:v1:theme-preference')).toBe('dark');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Key' }));

    await waitFor(() => {
      expect(storage.getItem('wordlink:v1:theme-preference')).toBeNull();
    });
  });

  it('switches versions on the fly', async () => {
    const storage = createMemoryStorage({
      'mcts-web:v1:app': '{"selectedGame":"Onitama"}',
      'mcts-web:v2:app': '{"selectedGame":"Tak"}',
    });

    render(
      <ProjectStorageInspector
        projectKey="mcts-web"
        storage={storage}
        versions={[
          { label: 'Version 1', value: 1 },
          { label: 'Version 2', value: 2 },
        ]}
      />,
    );

    expect(await screen.findByDisplayValue('{"selectedGame":"Onitama"}')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Storage version'), { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText(/Namespace:/)).toHaveTextContent('mcts-web:v2');
      expect(screen.getByDisplayValue('{"selectedGame":"Tak"}')).toBeInTheDocument();
    });
  });

  it('accepts numeric import versions after switching versions in the inspector', async () => {
    const storage = createMemoryStorage({
      'mcts-web:v1:app': '{"selectedGame":"Onitama"}',
      'mcts-web:v2:app': '{"selectedGame":"Tak"}',
    });

    render(
      <ProjectStorageInspector
        projectKey="mcts-web"
        storage={storage}
        versions={[
          { label: 'Version 1', value: 1 },
          { label: 'Version 2', value: 2 },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText('Storage version'), { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText(/Namespace:/)).toHaveTextContent('mcts-web:v2');
    });

    fireEvent.change(screen.getByLabelText('Namespace JSON'), {
      target: {
        value: JSON.stringify({
          entries: [{
            keyParts: ['app'],
            relativeKey: 'app',
            rawValue: '{"selectedGame":"Hex"}',
          }],
          projectKey: 'mcts-web',
          version: 2,
        }, null, 2),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import Merge' }));

    await waitFor(() => {
      expect(storage.getItem('mcts-web:v2:app')).toBe('{"selectedGame":"Hex"}');
    });
  });

  it('imports namespace JSON through the inspector', async () => {
    const storage = createMemoryStorage({
      'wordlink:v1:theme-preference': 'dark',
      'wordlink:v1:legacy': '1',
    });

    render(
      <ProjectStorageInspector
        projectKey="wordlink"
        storage={storage}
        version={1}
      />,
    );

    fireEvent.change(screen.getByLabelText('Namespace JSON'), {
      target: {
        value: JSON.stringify({
          entries: [
            { relativeKey: 'theme-preference', rawValue: 'light' },
            { relativeKey: 'panels:complexity', rawValue: '{"expanded":true}' },
          ],
          projectKey: 'wordlink',
          version: 1,
        }, null, 2),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import Replace' }));

    await waitFor(() => {
      expect(storage.getItem('wordlink:v1:theme-preference')).toBe('light');
      expect(storage.getItem('wordlink:v1:panels:complexity')).toBe('{"expanded":true}');
    });

    expect(storage.getItem('wordlink:v1:legacy')).toBeNull();
  });

  it('refreshes namespace JSON after saving a raw value', async () => {
    const storage = createMemoryStorage();

    render(
      <ProjectStorageInspector
        defaultRelativeKey="theme-preference"
        projectKey="wordlink"
        storage={storage}
        version={1}
      />,
    );

    fireEvent.change(screen.getByLabelText('Raw value'), { target: { value: 'dark' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Raw Value' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Namespace JSON')).toHaveValue(JSON.stringify({
        entries: [{
          keyParts: ['theme-preference'],
          relativeKey: 'theme-preference',
          rawValue: 'dark',
        }],
        projectKey: 'wordlink',
        version: 1,
      }, null, 2));
    });
  });
});
