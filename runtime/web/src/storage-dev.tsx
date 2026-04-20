import { type CSSProperties, type ComponentPropsWithoutRef, type ReactNode, useEffect, useState } from 'react';
import {
  createProjectStorage,
  type ProjectStorage,
  type ProjectStorageEntry,
  type StorageKeyPart,
  type StorageLike,
} from './storage.js';

export interface ProjectStorageInspectorVersionOption {
  label: string;
  value: StorageKeyPart | null;
}

export interface ProjectStorageNamespaceEntry {
  keyParts: string[];
  relativeKey: string;
  rawValue: string;
}

export interface ProjectStorageNamespaceSnapshot {
  entries: ProjectStorageNamespaceEntry[];
  projectKey: string;
  version?: StorageKeyPart;
}

export interface ImportProjectStorageNamespaceOptions {
  mode?: 'merge' | 'replace';
  requireNamespaceMatch?: boolean;
}

export type ProjectStorageInspectorProps = Omit<ComponentPropsWithoutRef<'section'>, 'children'> & {
  defaultRelativeKey?: string;
  emptyMessage?: ReactNode;
  projectKey: string;
  storage?: StorageLike | null;
  title?: ReactNode;
  unstyled?: boolean;
  version?: StorageKeyPart;
  versions?: readonly ProjectStorageInspectorVersionOption[];
};

const DEFAULT_ROOT_STYLE: CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '1rem',
  color: '#0f172a',
  display: 'grid',
  gap: '1rem',
  padding: '1rem',
};

const DEFAULT_HEADER_STYLE: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
};

const DEFAULT_TOOLBAR_STYLE: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const DEFAULT_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'minmax(14rem, 18rem) minmax(0, 1fr)',
};

const DEFAULT_LIST_STYLE: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '0.75rem',
  display: 'grid',
  gap: '0.5rem',
  maxHeight: '22rem',
  overflow: 'auto',
  padding: '0.75rem',
};

const DEFAULT_EDITOR_STYLE: CSSProperties = {
  display: 'grid',
  gap: '0.75rem',
};

const DEFAULT_TRANSFER_STYLE: CSSProperties = {
  borderTop: '1px solid #cbd5e1',
  display: 'grid',
  gap: '0.75rem',
  paddingTop: '1rem',
};

const DEFAULT_BUTTON_STYLE: CSSProperties = {
  backgroundColor: '#e2e8f0',
  border: '1px solid #94a3b8',
  borderRadius: '0.5rem',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  padding: '0.45rem 0.7rem',
};

const DEFAULT_INPUT_STYLE: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #94a3b8',
  borderRadius: '0.5rem',
  color: 'inherit',
  font: 'inherit',
  padding: '0.5rem 0.65rem',
  width: '100%',
};

const DEFAULT_TEXTAREA_STYLE: CSSProperties = {
  ...DEFAULT_INPUT_STYLE,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  minHeight: '14rem',
  resize: 'vertical',
};

const DEFAULT_TRANSFER_TEXTAREA_STYLE: CSSProperties = {
  ...DEFAULT_TEXTAREA_STYLE,
  minHeight: '12rem',
};

const DEFAULT_KEY_BUTTON_STYLE: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  display: 'grid',
  font: 'inherit',
  gap: '0.2rem',
  padding: '0.55rem 0.65rem',
  textAlign: 'left',
  width: '100%',
};

const DEFAULT_SELECTED_KEY_BUTTON_STYLE: CSSProperties = {
  borderColor: '#2563eb',
  boxShadow: '0 0 0 1px #2563eb inset',
};

const DEFAULT_META_STYLE: CSSProperties = {
  color: '#475569',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.8rem',
};

const resolveInspectorStorage = (storage: StorageLike | null | undefined): StorageLike | null => {
  if(storage !== undefined) {
    return storage;
  }

  if(typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getVersionOptions = (
  version: StorageKeyPart | undefined,
  versions: readonly ProjectStorageInspectorVersionOption[] | undefined,
) => {
  if(versions && versions.length > 0) {
    return [...versions];
  }

  if(version === undefined) {
    return [] as ProjectStorageInspectorVersionOption[];
  }

  return [{
    label: `v${version}`,
    value: version,
  }];
};

const buildRelativeKey = (keyParts: readonly string[]) => keyParts.join(':');

const formatEntryLabel = (entry: ProjectStorageEntry) => (
  entry.keyParts.length === 0
    ? '(root key)'
    : entry.keyParts.some((part) => part.includes(':') || part.length === 0)
      ? JSON.stringify(entry.keyParts)
      : entry.relativeKey
);

const relativeKeyToParts = (relativeKey: string) => {
  if(relativeKey.length === 0) {
    return [] as string[];
  }

  const parts = relativeKey.split(':');
  if(parts.some((part) => part.length === 0)) {
    throw new Error('Imported relative keys must not contain empty segments.');
  }

  return parts;
};

const isStorageKeyPart = (value: unknown): value is StorageKeyPart => (
  typeof value === 'string' || typeof value === 'number'
);

const isNamespaceEntry = (value: unknown): value is {
  keyParts?: unknown;
  relativeKey: string;
  rawValue: string;
} => {
  if(!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.relativeKey === 'string'
    && typeof entry.rawValue === 'string'
    && (
      entry.keyParts === undefined
      || (
        Array.isArray(entry.keyParts)
        && entry.keyParts.every((part) => typeof part === 'string' && part.length > 0)
      )
    )
  );
};

const normalizeNamespaceEntry = (
  value: unknown,
): ProjectStorageNamespaceEntry => {
  if(!isNamespaceEntry(value)) {
    throw new Error('Namespace JSON entries must be an array of { relativeKey, rawValue }.');
  }

  const entry = value as {
    keyParts?: string[];
    relativeKey: string;
    rawValue: string;
  };
  const keyParts = entry.keyParts ?? relativeKeyToParts(entry.relativeKey);
  const relativeKey = buildRelativeKey(keyParts);

  if(entry.keyParts && entry.relativeKey !== relativeKey) {
    throw new Error('Namespace JSON relativeKey must match keyParts when keyParts is provided.');
  }

  return {
    keyParts,
    relativeKey,
    rawValue: entry.rawValue,
  };
};

const matchesNamespace = (
  projectStorage: ProjectStorage,
  snapshot: ProjectStorageNamespaceSnapshot,
) => {
  const snapshotProjectStorage = createProjectStorage(snapshot.projectKey, {
    ...(snapshot.version === undefined ? {} : { version: snapshot.version }),
  });

  return snapshotProjectStorage.key() === projectStorage.key();
};

export const exportProjectStorageNamespace = (
  projectStorage: ProjectStorage,
): ProjectStorageNamespaceSnapshot => ({
  entries: projectStorage.list().map(({ keyParts, relativeKey, rawValue }) => ({
    keyParts,
    relativeKey,
    rawValue,
  })),
  projectKey: projectStorage.projectKey,
  ...(projectStorage.version === undefined ? {} : { version: projectStorage.version }),
});

export const stringifyProjectStorageNamespace = (
  projectStorage: ProjectStorage,
) => JSON.stringify(exportProjectStorageNamespace(projectStorage), null, 2);

export const parseProjectStorageNamespace = (
  value: string,
): ProjectStorageNamespaceSnapshot => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Namespace JSON must be valid JSON.');
  }

  if(!parsed || typeof parsed !== 'object') {
    throw new Error('Namespace JSON must be an object.');
  }

  const parsedRecord = parsed as Record<string, unknown>;
  const projectKey = parsedRecord.projectKey;
  const version = parsedRecord.version;
  const entries = parsedRecord.entries;

  if(typeof projectKey !== 'string' || projectKey.length === 0) {
    throw new Error('Namespace JSON must include a non-empty projectKey.');
  }

  if(version !== undefined && !isStorageKeyPart(version)) {
    throw new Error('Namespace JSON version must be a string or number when present.');
  }

  if(!Array.isArray(entries)) {
    throw new Error('Namespace JSON entries must be an array of { relativeKey, rawValue }.');
  }

  return {
    entries: entries.map((entry) => normalizeNamespaceEntry(entry)),
    projectKey,
    ...(version === undefined ? {} : { version }),
  };
};

export const importProjectStorageNamespace = (
  projectStorage: ProjectStorage,
  snapshot: ProjectStorageNamespaceSnapshot,
  options: ImportProjectStorageNamespaceOptions = {},
) => {
  const {
    mode = 'merge',
    requireNamespaceMatch = true,
  } = options;

  if(requireNamespaceMatch && !matchesNamespace(projectStorage, snapshot)) {
    throw new Error('Imported namespace does not match the selected project key and version.');
  }

  if(mode === 'replace') {
    projectStorage.clear();
  }

  for(const entry of snapshot.entries) {
    projectStorage.writeString(entry.rawValue, ...entry.keyParts);
  }

  return snapshot.entries.length;
};

const resolveSelectedVersionOption = (
  value: string,
  versionOptions: readonly ProjectStorageInspectorVersionOption[],
) => (
  versionOptions.find((option) => (
    (option.value === null ? '__none__' : `${option.value}`) === value
  ))?.value ?? (value === '__none__' ? null : value)
);

export function ProjectStorageInspector({
  className,
  defaultRelativeKey = '',
  emptyMessage = 'No keys in this namespace.',
  projectKey,
  storage,
  style,
  title = 'Project Storage Inspector',
  unstyled = false,
  version,
  versions,
  ...props
}: ProjectStorageInspectorProps) {
  const versionOptions = getVersionOptions(version, versions);
  const [selectedVersion, setSelectedVersion] = useState<StorageKeyPart | null>(
    versionOptions[0]?.value ?? version ?? null,
  );
  const [entries, setEntries] = useState<ProjectStorageEntry[]>([]);
  const [selectedFullKey, setSelectedFullKey] = useState<string | null>(null);
  const [draftRelativeKey, setDraftRelativeKey] = useState(defaultRelativeKey);
  const [draftKeyParts, setDraftKeyParts] = useState<string[] | null>(null);
  const [editorValue, setEditorValue] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [transferValue, setTransferValue] = useState('');

  const projectStorage = createProjectStorage(projectKey, {
    ...(storage === undefined ? {} : { storage }),
    ...(selectedVersion === null ? {} : { version: selectedVersion }),
  });

  const syncTransferValue = () => {
    const nextTransferValue = stringifyProjectStorageNamespace(projectStorage);
    setTransferValue(nextTransferValue);

    return nextTransferValue;
  };

  const refreshEntries = ({
    nextDraftRelativeKey = draftRelativeKey,
    selectedEntryFullKey = selectedFullKey,
  }: {
    nextDraftRelativeKey?: string;
    selectedEntryFullKey?: string | null;
  } = {}) => {
    const nextEntries = projectStorage.list();
    setEntries(nextEntries);

    const matchingEntry = selectedEntryFullKey
      ? nextEntries.find((entry) => entry.fullKey === selectedEntryFullKey)
      : nextEntries.find((entry) => entry.relativeKey === nextDraftRelativeKey);
    if(matchingEntry) {
      setSelectedFullKey(matchingEntry.fullKey);
      setDraftRelativeKey(matchingEntry.relativeKey);
      setDraftKeyParts([...matchingEntry.keyParts]);
      setEditorValue(matchingEntry.rawValue);
      return;
    }

    if((selectedEntryFullKey === null || selectedEntryFullKey === undefined) && nextEntries[0]) {
      setSelectedFullKey(nextEntries[0].fullKey);
      setDraftRelativeKey(nextEntries[0].relativeKey);
      setDraftKeyParts([...nextEntries[0].keyParts]);
      setEditorValue(nextEntries[0].rawValue);
      return;
    }

    setSelectedFullKey(null);
    setDraftRelativeKey(nextDraftRelativeKey);
    setDraftKeyParts(null);

    if(nextDraftRelativeKey.length === 0) {
      setEditorValue('');
      return;
    }

    try {
      setEditorValue(projectStorage.readString(...relativeKeyToParts(nextDraftRelativeKey)) ?? '');
    } catch {
      setEditorValue('');
    }
  };

  useEffect(() => {
    refreshEntries({ nextDraftRelativeKey: defaultRelativeKey, selectedEntryFullKey: null });
    syncTransferValue();
    setStatus(null);
  }, [defaultRelativeKey, projectKey, selectedVersion, storage]);

  const handleSelectEntry = (entry: ProjectStorageEntry) => {
    setSelectedFullKey(entry.fullKey);
    setDraftRelativeKey(entry.relativeKey);
    setDraftKeyParts([...entry.keyParts]);
    setEditorValue(entry.rawValue);
    setStatus(null);
  };

  const handleSave = () => {
    const activeStorage = resolveInspectorStorage(storage);
    const nextRelativeKey = draftRelativeKey.trim();

    if(!activeStorage) {
      setStatus('Storage is unavailable.');
      return;
    }

    try {
      const nextFullKey = selectedFullKey && draftKeyParts
        ? selectedFullKey
        : projectStorage.key(...(draftKeyParts ?? relativeKeyToParts(nextRelativeKey)));

      activeStorage.setItem(nextFullKey, editorValue);
      setStatus('Saved.');
      refreshEntries({ selectedEntryFullKey: nextFullKey });
      syncTransferValue();
    } catch(error) {
      setStatus(error instanceof Error ? error.message : 'Save failed.');
    }
  };

  const handleRemove = () => {
    const activeStorage = resolveInspectorStorage(storage);
    const nextRelativeKey = draftRelativeKey.trim();

    if(!activeStorage) {
      setStatus('Storage is unavailable.');
      return;
    }

    try {
      const nextFullKey = selectedFullKey && draftKeyParts
        ? selectedFullKey
        : projectStorage.key(...(draftKeyParts ?? relativeKeyToParts(nextRelativeKey)));

      activeStorage.removeItem(nextFullKey);
      setStatus('Removed.');
      refreshEntries({ nextDraftRelativeKey: '', selectedEntryFullKey: null });
      syncTransferValue();
    } catch(error) {
      setStatus(error instanceof Error ? error.message : 'Remove failed.');
    }
  };

  const handleClear = () => {
    projectStorage.clear();
    setStatus('Namespace cleared.');
    refreshEntries({ nextDraftRelativeKey: '', selectedEntryFullKey: null });
    syncTransferValue();
  };

  const handleCopyNamespaceJson = async () => {
    try {
      const exportValue = stringifyProjectStorageNamespace(projectStorage);

      if(typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        setTransferValue(exportValue);
        setStatus('Clipboard copy is unavailable. Copy from the textarea instead.');
        return;
      }

      await navigator.clipboard.writeText(exportValue);
      setTransferValue(exportValue);
      setStatus('Namespace JSON copied.');
    } catch {
      setStatus('Clipboard copy failed. Copy from the textarea instead.');
    }
  };

  const handleImportNamespace = (mode: 'merge' | 'replace') => {
    try {
      const snapshot = parseProjectStorageNamespace(transferValue);
      const importedEntryCount = importProjectStorageNamespace(projectStorage, snapshot, { mode });

      refreshEntries({ nextDraftRelativeKey: '', selectedEntryFullKey: null });
      syncTransferValue();
      setStatus(`${mode === 'replace' ? 'Replaced' : 'Merged'} ${importedEntryCount} entries.`);
    } catch(error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.');
    }
  };

  const mergedStyle = unstyled ? style : { ...DEFAULT_ROOT_STYLE, ...style };

  return (
    <section className={className} style={mergedStyle} {...props}>
      <div style={unstyled ? undefined : DEFAULT_HEADER_STYLE}>
        <div>
          <strong>{title}</strong>
          <div style={unstyled ? undefined : DEFAULT_META_STYLE}>
            Namespace: <code>{projectStorage.key()}</code>
          </div>
        </div>

        <div style={unstyled ? undefined : DEFAULT_TOOLBAR_STYLE}>
          {versionOptions.length > 0 ? (
            <label>
              <span style={unstyled ? undefined : DEFAULT_META_STYLE}>Version </span>
              <select
                aria-label="Storage version"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSelectedVersion(resolveSelectedVersionOption(nextValue, versionOptions));
                }}
                style={unstyled ? undefined : DEFAULT_INPUT_STYLE}
                value={selectedVersion === null ? '__none__' : `${selectedVersion}`}
              >
                {versionOptions.map((option) => (
                  <option
                    key={`${option.label}:${option.value ?? '__none__'}`}
                    value={option.value === null ? '__none__' : `${option.value}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button onClick={() => refreshEntries()} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Refresh
          </button>
          <button onClick={handleClear} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Clear Namespace
          </button>
        </div>
      </div>

      <div style={unstyled ? undefined : DEFAULT_GRID_STYLE}>
        <div style={unstyled ? undefined : DEFAULT_LIST_STYLE}>
          {entries.length === 0 ? <div>{emptyMessage}</div> : null}

          {entries.map((entry) => {
            const isSelected = entry.fullKey === selectedFullKey;

            return (
              <button
                key={entry.fullKey}
                onClick={() => handleSelectEntry(entry)}
                style={unstyled ? undefined : {
                  ...DEFAULT_KEY_BUTTON_STYLE,
                  ...(isSelected ? DEFAULT_SELECTED_KEY_BUTTON_STYLE : {}),
                }}
                type="button"
              >
                <strong>{formatEntryLabel(entry)}</strong>
                <span style={unstyled ? undefined : DEFAULT_META_STYLE}>
                  {entry.rawValue.length} chars
                </span>
              </button>
            );
          })}
        </div>

        <div style={unstyled ? undefined : DEFAULT_EDITOR_STYLE}>
          <label>
            <div style={unstyled ? undefined : DEFAULT_META_STYLE}>Key suffix</div>
            <input
              aria-label="Key suffix"
              onChange={(event) => {
                setDraftRelativeKey(event.target.value);
                setDraftKeyParts(null);
                setSelectedFullKey(null);
              }}
              style={unstyled ? undefined : DEFAULT_INPUT_STYLE}
              type="text"
              value={draftRelativeKey}
            />
          </label>

          <label>
            <div style={unstyled ? undefined : DEFAULT_META_STYLE}>Raw value</div>
            <textarea
              aria-label="Raw value"
              onChange={(event) => setEditorValue(event.target.value)}
              spellCheck={false}
              style={unstyled ? undefined : DEFAULT_TEXTAREA_STYLE}
              value={editorValue}
            />
          </label>

          <div style={unstyled ? undefined : DEFAULT_TOOLBAR_STYLE}>
            <button onClick={handleSave} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
              Save Raw Value
            </button>
            <button onClick={handleRemove} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
              Remove Key
            </button>
          </div>

          <div style={unstyled ? undefined : DEFAULT_META_STYLE}>
            {status ?? 'Edits write raw strings directly to storage. Key suffix uses ":" between key parts; use Namespace JSON keyParts for exact literal ":" segments.'}
          </div>
        </div>
      </div>

      <div style={unstyled ? undefined : DEFAULT_TRANSFER_STYLE}>
        <label>
          <div style={unstyled ? undefined : DEFAULT_META_STYLE}>Namespace JSON</div>
          <textarea
            aria-label="Namespace JSON"
            onChange={(event) => setTransferValue(event.target.value)}
            spellCheck={false}
            style={unstyled ? undefined : DEFAULT_TRANSFER_TEXTAREA_STYLE}
            value={transferValue}
          />
        </label>

        <div style={unstyled ? undefined : DEFAULT_TOOLBAR_STYLE}>
          <button onClick={syncTransferValue} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Refresh Export JSON
          </button>
          <button onClick={() => void handleCopyNamespaceJson()} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Copy Namespace JSON
          </button>
          <button onClick={() => handleImportNamespace('merge')} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Import Merge
          </button>
          <button onClick={() => handleImportNamespace('replace')} style={unstyled ? undefined : DEFAULT_BUTTON_STYLE} type="button">
            Import Replace
          </button>
        </div>

        <div style={unstyled ? undefined : DEFAULT_META_STYLE}>
          Import validates the selected project key and version before writing raw string values, and keyParts keep literal ":" segments lossless.
        </div>
      </div>
    </section>
  );
}
