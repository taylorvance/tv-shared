import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { createStringUnionCodec } from './codecs.js';
import {
  usePersistentState,
  type PersistentStateControls,
  type PersistentStateKey,
} from './persistent-state.js';
import type { ProjectStorage } from './storage.js';

const DARK_THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const themePreferenceCodec = createStringUnionCodec(['light', 'dark', 'system']);

export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemePreferenceOptions {
  applyToDocument?: boolean;
  attributeName?: string;
  defaultValue?: ThemePreference;
  storageKey?: PersistentStateKey;
  window?: Window | null;
}

export interface ThemePreferenceState extends PersistentStateControls {
  resolvedTheme: ResolvedTheme;
  setThemePreference: Dispatch<SetStateAction<ThemePreference>>;
  systemTheme: ResolvedTheme;
  themePreference: ThemePreference;
}

const resolveWindow = (providedWindow?: Window | null) => {
  if(providedWindow !== undefined) {
    return providedWindow;
  }

  if(typeof window === 'undefined') {
    return null;
  }

  return window;
};

const getSystemTheme = (providedWindow?: Window | null): ResolvedTheme => {
  const activeWindow = resolveWindow(providedWindow);

  if(!activeWindow?.matchMedia) {
    return 'light';
  }

  return activeWindow.matchMedia(DARK_THEME_MEDIA_QUERY).matches ? 'dark' : 'light';
};

export const resolveThemePreference = (
  themePreference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme => (
  themePreference === 'system' ? systemTheme : themePreference
);

export const useSystemTheme = (options: {
  window?: Window | null;
} = {}) => {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme(options.window));

  useEffect(() => {
    const activeWindow = resolveWindow(options.window);

    if(!activeWindow?.matchMedia) {
      return undefined;
    }

    const mediaQuery = activeWindow.matchMedia(DARK_THEME_MEDIA_QUERY);
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [options.window, setSystemTheme]);

  return systemTheme;
};

export const useThemePreference = (
  storage: ProjectStorage,
  options: ThemePreferenceOptions = {},
): ThemePreferenceState => {
  const themeStorageKey = options.storageKey ?? 'theme-preference';
  const [themePreference, setThemePreference, controls] = usePersistentState(
    storage,
    themeStorageKey,
    {
      codec: themePreferenceCodec,
      defaultValue: options.defaultValue ?? 'system',
    },
  );
  const systemTheme = useSystemTheme(
    options.window === undefined
      ? undefined
      : { window: options.window },
  );
  const resolvedTheme = resolveThemePreference(themePreference, systemTheme);

  useEffect(() => {
    if(!options.applyToDocument) {
      return;
    }

    const activeWindow = resolveWindow(options.window);
    const rootElement = activeWindow?.document?.documentElement;

    if(!rootElement) {
      return;
    }

    rootElement.setAttribute(options.attributeName ?? 'data-theme', resolvedTheme);
  }, [options.applyToDocument, options.attributeName, options.window, resolvedTheme]);

  return {
    ...controls,
    resolvedTheme,
    setThemePreference,
    systemTheme,
    themePreference,
  };
};
