import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { createJsonCodec, valueCodecEquals, type ValueCodec } from './codecs.js';
import type { ProjectStorage, StorageKeyPart } from './storage.js';

const PERSISTENT_STATE_CHANGE_EVENT = 'tv-shared:persistent-state-change';

type PersistentStateChangeDetail = {
  fullKey: string;
  rawValue: string | null;
};

export type PersistentStateKey = StorageKeyPart | readonly StorageKeyPart[];
export type PersistentStateSource = 'default' | 'storage';

export interface PersistentStateOptions<T> {
  codec?: ValueCodec<T>;
  defaultValue: T | (() => T);
}

export interface PersistentStateControls {
  clear: () => void;
  source: PersistentStateSource;
}

type PersistentStateSnapshot<T> = {
  source: PersistentStateSource;
  value: T;
};

const isStateUpdater = <T,>(value: SetStateAction<T>): value is ((previousState: T) => T) => (
  typeof value === 'function'
);

const resolveDefaultValue = <T,>(value: T | (() => T)) => (
  typeof value === 'function'
    ? (value as (() => T))()
    : value
);

const normalizeKeyParts = (key: PersistentStateKey): StorageKeyPart[] => {
  if(typeof key === 'string' || typeof key === 'number') {
    return [key];
  }

  return [...key];
};

const dispatchPersistentStateChange = (fullKey: string, rawValue: string | null) => {
  if(typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<PersistentStateChangeDetail>(
    PERSISTENT_STATE_CHANGE_EVENT,
    { detail: { fullKey, rawValue } },
  ));
};

const readSnapshot = <T,>(
  storage: ProjectStorage,
  keyParts: readonly StorageKeyPart[],
  codec: ValueCodec<T>,
  fallbackValue: T,
): PersistentStateSnapshot<T> => {
  const rawValue = storage.readString(...keyParts);

  if(rawValue === null) {
    return {
      source: 'default',
      value: fallbackValue,
    };
  }

  try {
    return {
      source: 'storage',
      value: codec.parse(rawValue),
    };
  } catch {
    return {
      source: 'default',
      value: fallbackValue,
    };
  }
};

export function usePersistentState<T>(
  storage: ProjectStorage,
  key: PersistentStateKey,
  options: PersistentStateOptions<T>,
): [T, Dispatch<SetStateAction<T>>, PersistentStateControls] {
  const codec = options.codec ?? createJsonCodec<T>();
  const keyParts = useMemo(() => normalizeKeyParts(key), [key]);
  const fullKey = useMemo(() => storage.key(...keyParts), [keyParts, storage]);
  const fallbackValue = resolveDefaultValue(options.defaultValue);
  const [snapshot, setSnapshot] = useState<PersistentStateSnapshot<T>>(() => (
    readSnapshot(storage, keyParts, codec, fallbackValue)
  ));

  useEffect(() => {
    const nextSnapshot = readSnapshot(storage, keyParts, codec, fallbackValue);

    setSnapshot((previousSnapshot) => (
      previousSnapshot.source === nextSnapshot.source
      && valueCodecEquals(codec, previousSnapshot.value, nextSnapshot.value)
        ? previousSnapshot
        : nextSnapshot
    ));
  }, [codec, fallbackValue, keyParts, storage]);

  useEffect(() => {
    if(typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if(event.key !== fullKey) {
        return;
      }

      const nextSnapshot = readSnapshot(storage, keyParts, codec, fallbackValue);

      setSnapshot((previousSnapshot) => (
        previousSnapshot.source === nextSnapshot.source
        && valueCodecEquals(codec, previousSnapshot.value, nextSnapshot.value)
          ? previousSnapshot
          : nextSnapshot
      ));
    };
    const handlePersistentStateChange = (event: Event) => {
      const detail = (event as CustomEvent<PersistentStateChangeDetail>).detail;

      if(detail.fullKey !== fullKey) {
        return;
      }

      if(detail.rawValue === null) {
        setSnapshot((previousSnapshot) => (
          previousSnapshot.source === 'default'
          && valueCodecEquals(codec, previousSnapshot.value, fallbackValue)
            ? previousSnapshot
            : {
                source: 'default',
                value: fallbackValue,
              }
        ));
        return;
      }

      try {
        const nextValue = codec.parse(detail.rawValue);

        setSnapshot((previousSnapshot) => (
          previousSnapshot.source === 'storage'
          && valueCodecEquals(codec, previousSnapshot.value, nextValue)
            ? previousSnapshot
            : {
                source: 'storage',
                value: nextValue,
              }
        ));
      } catch {
        setSnapshot({
          source: 'default',
          value: fallbackValue,
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PERSISTENT_STATE_CHANGE_EVENT, handlePersistentStateChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PERSISTENT_STATE_CHANGE_EVENT, handlePersistentStateChange);
    };
  }, [codec, fallbackValue, fullKey, keyParts, storage]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    setSnapshot((previousSnapshot) => {
      const nextValue = isStateUpdater(value)
        ? value(previousSnapshot.value)
        : value;
      let rawValue: string;

      try {
        rawValue = codec.serialize(nextValue);
      } catch {
        return previousSnapshot;
      }

      storage.writeString(rawValue, ...keyParts);
      dispatchPersistentStateChange(fullKey, rawValue);

      if(
        previousSnapshot.source === 'storage'
        && valueCodecEquals(codec, previousSnapshot.value, nextValue)
      ) {
        return previousSnapshot;
      }

      return {
        source: 'storage',
        value: nextValue,
      };
    });
  }, [codec, fullKey, keyParts, storage]);

  const clear = useCallback(() => {
    storage.remove(...keyParts);
    dispatchPersistentStateChange(fullKey, null);
    setSnapshot((previousSnapshot) => (
      previousSnapshot.source === 'default'
      && valueCodecEquals(codec, previousSnapshot.value, fallbackValue)
        ? previousSnapshot
        : {
            source: 'default',
            value: fallbackValue,
          }
    ));
  }, [codec, fallbackValue, fullKey, keyParts, storage]);

  return [
    snapshot.value,
    setValue,
    {
      clear,
      source: snapshot.source,
    },
  ];
}
