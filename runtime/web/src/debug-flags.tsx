import { useCallback, type Dispatch, type ReactNode, type RefCallback, type SetStateAction } from 'react';
import type { Keys } from 'react-hotkeys-hook';
import { createBooleanCodec, type ValueCodec } from './codecs.js';
import { createProjectStorage } from './storage.js';
import {
  usePersistentState,
  type PersistentStateKey,
} from './persistent-state.js';
import {
  useShortcutRegistry,
  type RegisteredShortcut,
} from './shortcuts.js';
import type { ProjectStorage } from './storage.js';
import {
  useUrlState,
  type UrlStateHistoryMode,
  type UrlStateMode,
} from './url-state.js';

const debugFlagUrlCodec: ValueCodec<boolean> = {
  parse: (rawValue) => {
    if(['1', 'true', 'yes', 'on'].includes(rawValue)) {
      return true;
    }

    if(['0', 'false', 'no', 'off'].includes(rawValue)) {
      return false;
    }

    throw new Error('Debug flag URL value is not a recognized boolean literal.');
  },
  serialize: (value) => value ? '1' : '0',
};

const isStateUpdater = <T,>(value: SetStateAction<T>): value is ((previousState: T) => T) => (
  typeof value === 'function'
);

export type DebugFlagSource = 'default' | 'storage' | 'url';

export interface DebugFlagOptions {
  defaultValue?: boolean;
  description?: ReactNode;
  hidden?: boolean;
  hotkeys?: Keys;
  label?: ReactNode;
  sequence?: readonly string[];
  storage?: ProjectStorage | null;
  storageKey?: PersistentStateKey;
  urlHistory?: UrlStateHistoryMode;
  urlMode?: UrlStateMode;
  urlParam?: string;
}

export interface DebugFlagState<T extends HTMLElement> {
  clearStoredValue: () => void;
  clearUrlOverride: () => void;
  ref: RefCallback<T>;
  shortcut: RegisteredShortcut | null;
  setValue: Dispatch<SetStateAction<boolean>>;
  source: DebugFlagSource;
  toggle: () => void;
  value: boolean;
}

const fallbackDebugStorage = createProjectStorage('__tv-shared-debug-flags__', { storage: null });

export function useDebugFlag<T extends HTMLElement>(
  id: string,
  options: DebugFlagOptions = {},
): DebugFlagState<T> {
  const defaultValue = options.defaultValue ?? false;
  const storageKey = options.storageKey ?? ['debug', id];
  const [storedValue, setStoredValue, storedControls] = usePersistentState(
    options.storage ?? fallbackDebugStorage,
    storageKey,
    {
      codec: createBooleanCodec(),
      defaultValue,
    },
  );
  const [urlOverride, , urlControls] = useUrlState<boolean | null>(
    options.urlParam ?? '__tv_shared_debug_flag_disabled__',
    {
      codec: debugFlagUrlCodec as ValueCodec<boolean | null>,
      defaultValue: null,
      ...(options.urlHistory === undefined ? {} : { history: options.urlHistory }),
      ...(options.urlMode === undefined ? {} : { mode: options.urlMode }),
    },
  );
  const value = options.urlParam && urlOverride !== null ? urlOverride : storedValue;
  const source: DebugFlagSource = options.urlParam && urlControls.source === 'url'
    ? 'url'
    : options.storage
      ? storedControls.source
      : 'default';
  const clearUrlOverride = useCallback(() => {
    if(options.urlParam) {
      urlControls.clear();
    }
  }, [options.urlParam, urlControls]);
  const clearStoredValue = useCallback(() => {
    storedControls.clear();
  }, [storedControls]);
  const setValue = useCallback<Dispatch<SetStateAction<boolean>>>((nextValue) => {
    const resolvedValue = isStateUpdater(nextValue)
      ? nextValue(value)
      : nextValue;

    clearUrlOverride();
    setStoredValue(resolvedValue);
  }, [clearUrlOverride, setStoredValue, value]);
  const toggle = useCallback(() => {
    setValue((previousValue) => !previousValue);
  }, [setValue]);
  const shortcutRegistry = useShortcutRegistry<T>(
    options.hotkeys || options.sequence
      ? [{
          ...(options.description === undefined ? {} : { description: options.description }),
          ...(options.hidden === undefined ? {} : { hidden: options.hidden }),
          id,
          ...(options.hotkeys === undefined ? {} : { keys: options.hotkeys }),
          label: options.label ?? id,
          onTrigger: toggle,
          ...(options.sequence === undefined ? {} : { sequence: options.sequence }),
        }]
      : [],
  );

  return {
    clearStoredValue,
    clearUrlOverride,
    ref: shortcutRegistry.ref,
    shortcut: shortcutRegistry.shortcuts[0] ?? null,
    setValue,
    source,
    toggle,
    value,
  };
}
