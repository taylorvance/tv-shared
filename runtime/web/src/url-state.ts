import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { createStringCodec, valueCodecEquals, type ValueCodec } from './codecs.js';

const URL_STATE_CHANGE_EVENT = 'tv-shared:url-state-change';

type UrlStateChangeDetail = {
  key: string;
  mode: UrlStateMode;
};

export type UrlStateHistoryMode = 'push' | 'replace';
export type UrlStateMode = 'hash' | 'query';
export type UrlStateSource = 'default' | 'url';

export interface UrlStateOptions<T> {
  codec?: ValueCodec<T>;
  defaultValue: T | (() => T);
  history?: UrlStateHistoryMode;
  mode?: UrlStateMode;
  persistDefault?: boolean;
  window?: Window | null;
}

export interface UrlStateControls {
  clear: () => void;
  source: UrlStateSource;
}

type UrlStateSnapshot<T> = {
  source: UrlStateSource;
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

const resolveWindow = (providedWindow?: Window | null) => {
  if(providedWindow !== undefined) {
    return providedWindow;
  }

  if(typeof window === 'undefined') {
    return null;
  }

  return window;
};

const getParamsForMode = (url: URL, mode: UrlStateMode) => (
  mode === 'query'
    ? new URLSearchParams(url.search)
    : new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)
);

const setParamsForMode = (url: URL, mode: UrlStateMode, params: URLSearchParams) => {
  const serializedParams = params.toString();

  if(mode === 'query') {
    url.search = serializedParams.length > 0 ? `?${serializedParams}` : '';
    return;
  }

  url.hash = serializedParams.length > 0 ? `#${serializedParams}` : '';
};

const getHistoryUrl = (url: URL) => `${url.pathname}${url.search}${url.hash}`;

const dispatchUrlStateChange = (
  activeWindow: Window,
  key: string,
  mode: UrlStateMode,
) => {
  activeWindow.dispatchEvent(new CustomEvent<UrlStateChangeDetail>(
    URL_STATE_CHANGE_EVENT,
    { detail: { key, mode } },
  ));
};

const readSnapshot = <T,>(
  key: string,
  codec: ValueCodec<T>,
  fallbackValue: T,
  mode: UrlStateMode,
  activeWindow: Window | null,
): UrlStateSnapshot<T> => {
  if(!activeWindow) {
    return {
      source: 'default',
      value: fallbackValue,
    };
  }

  const url = new URL(activeWindow.location.href);
  const rawValue = getParamsForMode(url, mode).get(key);

  if(rawValue === null) {
    return {
      source: 'default',
      value: fallbackValue,
    };
  }

  try {
    return {
      source: 'url',
      value: codec.parse(rawValue),
    };
  } catch {
    return {
      source: 'default',
      value: fallbackValue,
    };
  }
};

const writeSnapshot = <T,>(
  activeWindow: Window | null,
  key: string,
  value: T,
  codec: ValueCodec<T>,
  fallbackValue: T,
  mode: UrlStateMode,
  historyMode: UrlStateHistoryMode,
  persistDefault: boolean,
) => {
  if(!activeWindow) {
    return;
  }

  const url = new URL(activeWindow.location.href);
  const params = getParamsForMode(url, mode);

  if(!persistDefault && valueCodecEquals(codec, value, fallbackValue)) {
    params.delete(key);
  } else {
    params.set(key, codec.serialize(value));
  }

  setParamsForMode(url, mode, params);
  activeWindow.history[historyMode === 'push' ? 'pushState' : 'replaceState'](
    activeWindow.history.state,
    '',
    getHistoryUrl(url),
  );
  dispatchUrlStateChange(activeWindow, key, mode);
};

const clearSnapshot = (
  activeWindow: Window | null,
  key: string,
  mode: UrlStateMode,
  historyMode: UrlStateHistoryMode,
) => {
  if(!activeWindow) {
    return;
  }

  const url = new URL(activeWindow.location.href);
  const params = getParamsForMode(url, mode);

  params.delete(key);
  setParamsForMode(url, mode, params);
  activeWindow.history[historyMode === 'push' ? 'pushState' : 'replaceState'](
    activeWindow.history.state,
    '',
    getHistoryUrl(url),
  );
  dispatchUrlStateChange(activeWindow, key, mode);
};

export function useUrlState<T>(
  key: string,
  options: UrlStateOptions<T>,
): [T, Dispatch<SetStateAction<T>>, UrlStateControls] {
  const codec = options.codec ?? createStringCodec() as unknown as ValueCodec<T>;
  const fallbackValue = resolveDefaultValue(options.defaultValue);
  const mode = options.mode ?? 'query';
  const historyMode = options.history ?? 'replace';
  const persistDefault = options.persistDefault ?? false;
  const activeWindow = resolveWindow(options.window);
  const [snapshot, setSnapshot] = useState<UrlStateSnapshot<T>>(() => (
    readSnapshot(key, codec, fallbackValue, mode, activeWindow)
  ));

  useEffect(() => {
    const nextSnapshot = readSnapshot(key, codec, fallbackValue, mode, activeWindow);

    setSnapshot((previousSnapshot) => (
      previousSnapshot.source === nextSnapshot.source
      && valueCodecEquals(codec, previousSnapshot.value, nextSnapshot.value)
        ? previousSnapshot
        : nextSnapshot
    ));
  }, [activeWindow, codec, fallbackValue, key, mode]);

  useEffect(() => {
    if(!activeWindow) {
      return undefined;
    }

    const handleChange = () => {
      const nextSnapshot = readSnapshot(key, codec, fallbackValue, mode, activeWindow);

      setSnapshot((previousSnapshot) => (
        previousSnapshot.source === nextSnapshot.source
        && valueCodecEquals(codec, previousSnapshot.value, nextSnapshot.value)
          ? previousSnapshot
          : nextSnapshot
      ));
    };
    const handleUrlStateChange = (event: Event) => {
      const detail = (event as CustomEvent<UrlStateChangeDetail>).detail;

      if(detail.key !== key || detail.mode !== mode) {
        return;
      }

      handleChange();
    };

    activeWindow.addEventListener('popstate', handleChange);
    activeWindow.addEventListener('hashchange', handleChange);
    activeWindow.addEventListener(URL_STATE_CHANGE_EVENT, handleUrlStateChange);

    return () => {
      activeWindow.removeEventListener('popstate', handleChange);
      activeWindow.removeEventListener('hashchange', handleChange);
      activeWindow.removeEventListener(URL_STATE_CHANGE_EVENT, handleUrlStateChange);
    };
  }, [activeWindow, codec, fallbackValue, key, mode]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    setSnapshot((previousSnapshot) => {
      const nextValue = isStateUpdater(value)
        ? value(previousSnapshot.value)
        : value;

      try {
        writeSnapshot(
          activeWindow,
          key,
          nextValue,
          codec,
          fallbackValue,
          mode,
          historyMode,
          persistDefault,
        );
      } catch {
        return previousSnapshot;
      }

      if(
        previousSnapshot.source === 'url'
        && valueCodecEquals(codec, previousSnapshot.value, nextValue)
      ) {
        return previousSnapshot;
      }

      return {
        source: 'url',
        value: nextValue,
      };
    });
  }, [activeWindow, codec, fallbackValue, historyMode, key, mode, persistDefault]);

  const clear = useCallback(() => {
    clearSnapshot(activeWindow, key, mode, historyMode);
    setSnapshot((previousSnapshot) => (
      previousSnapshot.source === 'default'
      && valueCodecEquals(codec, previousSnapshot.value, fallbackValue)
        ? previousSnapshot
        : {
            source: 'default',
            value: fallbackValue,
          }
    ));
  }, [activeWindow, codec, fallbackValue, historyMode, key, mode]);

  return [
    snapshot.value,
    setValue,
    {
      clear,
      source: snapshot.source,
    },
  ];
}
