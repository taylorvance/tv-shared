export type StorageKeyPart = string | number;

export interface StorageLike {
  length?: number;
  getItem(key: string): string | null;
  key?(index: number): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ProjectStorageOptions {
  storage?: StorageLike | null;
  version?: StorageKeyPart;
}

export interface ProjectStorage {
  readonly projectKey: string;
  readonly version?: StorageKeyPart;
  key: (...parts: StorageKeyPart[]) => string;
  list: () => ProjectStorageEntry[];
  readString: (...parts: StorageKeyPart[]) => string | null;
  readJson: <T>(...parts: StorageKeyPart[]) => T | null;
  writeString: (value: string, ...parts: StorageKeyPart[]) => void;
  writeJson: (value: unknown, ...parts: StorageKeyPart[]) => void;
  remove: (...parts: StorageKeyPart[]) => void;
  clear: () => void;
}

export interface ProjectStorageEntry {
  fullKey: string;
  relativeKey: string;
  rawValue: string;
}

const STORAGE_KEY_SEPARATOR = ':';

const normalizeStorageKeyPart = (part: StorageKeyPart, label: string) => {
  const value = `${part}`;

  if(value.length === 0) {
    throw new Error(`${label} must not be empty.`);
  }

  return value;
};

const resolveStorage = (storage: StorageLike | null | undefined): StorageLike | null => {
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

const isEnumerableStorage = (
  storage: StorageLike,
): storage is StorageLike & Required<Pick<StorageLike, 'key' | 'length'>> => (
  typeof storage.key === 'function'
  && typeof storage.length === 'number'
  && Number.isInteger(storage.length)
  && storage.length >= 0
);

const buildProjectStoragePrefix = (
  projectKey: string,
  version: StorageKeyPart | undefined,
) => {
  const normalizedProjectKey = normalizeStorageKeyPart(projectKey, 'projectKey');

  if(version === undefined) {
    return normalizedProjectKey;
  }

  return `${normalizedProjectKey}${STORAGE_KEY_SEPARATOR}v${normalizeStorageKeyPart(version, 'version')}`;
};

export const createProjectStorage = (
  projectKey: string,
  options: ProjectStorageOptions = {},
): ProjectStorage => {
  const prefix = buildProjectStoragePrefix(projectKey, options.version);
  const nestedPrefix = `${prefix}${STORAGE_KEY_SEPARATOR}`;

  const key = (...parts: StorageKeyPart[]) => {
    if(parts.length === 0) {
      return prefix;
    }

    const suffix = parts
      .map((part, index) => normalizeStorageKeyPart(part, `key part ${index + 1}`))
      .join(STORAGE_KEY_SEPARATOR);

    return `${prefix}${STORAGE_KEY_SEPARATOR}${suffix}`;
  };

  const list = () => {
    const activeStorage = resolveStorage(options.storage);
    if(!activeStorage || !isEnumerableStorage(activeStorage)) {
      return [];
    }

    try {
      const entries: ProjectStorageEntry[] = [];

      for(let index = 0; index < activeStorage.length; index++) {
        const fullKey = activeStorage.key(index);
        if(!fullKey || (fullKey !== prefix && !fullKey.startsWith(nestedPrefix))) {
          continue;
        }

        const rawValue = activeStorage.getItem(fullKey);
        if(rawValue === null) {
          continue;
        }

        entries.push({
          fullKey,
          relativeKey: fullKey === prefix ? '' : fullKey.slice(nestedPrefix.length),
          rawValue,
        });
      }

      entries.sort((left, right) => left.fullKey.localeCompare(right.fullKey));

      return entries;
    } catch {
      return [];
    }
  };

  const readString = (...parts: StorageKeyPart[]) => {
    const activeStorage = resolveStorage(options.storage);
    if(!activeStorage) {
      return null;
    }

    try {
      return activeStorage.getItem(key(...parts));
    } catch {
      return null;
    }
  };

  const readJson = <T>(...parts: StorageKeyPart[]) => {
    const value = readString(...parts);

    if(value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  };

  const writeString = (value: string, ...parts: StorageKeyPart[]) => {
    const activeStorage = resolveStorage(options.storage);
    if(!activeStorage) {
      return;
    }

    try {
      activeStorage.setItem(key(...parts), value);
    } catch {
      // Ignore storage quota and privacy-mode failures.
    }
  };

  const writeJson = (value: unknown, ...parts: StorageKeyPart[]) => {
    try {
      writeString(JSON.stringify(value), ...parts);
    } catch {
      // Ignore serialization failures for non-JSON-safe values.
    }
  };

  const remove = (...parts: StorageKeyPart[]) => {
    const activeStorage = resolveStorage(options.storage);
    if(!activeStorage) {
      return;
    }

    try {
      activeStorage.removeItem(key(...parts));
    } catch {
      // Ignore storage-access failures.
    }
  };

  const clear = () => {
    const activeStorage = resolveStorage(options.storage);
    if(!activeStorage) {
      return;
    }

    for(const entry of list()) {
      try {
        activeStorage.removeItem(entry.fullKey);
      } catch {
        // Ignore storage-access failures.
      }
    }
  };

  return {
    projectKey,
    ...(options.version === undefined ? {} : { version: options.version }),
    key,
    list,
    readString,
    readJson,
    writeString,
    writeJson,
    remove,
    clear,
  };
};
