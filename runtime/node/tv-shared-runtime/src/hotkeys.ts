import { useCallback, useEffect, useRef } from 'react';
import {
  useHotkeys as useLibraryHotkeys,
  type HotkeyCallback,
  type Keys,
  type Options,
} from 'react-hotkeys-hook';
import type { DependencyList, MutableRefObject } from 'react';

export type FormTags = 'input' | 'textarea' | 'select' | 'INPUT' | 'TEXTAREA' | 'SELECT';

export interface HotkeyBinding {
  callback: HotkeyCallback;
  keys: Keys;
}

export interface KonamiOptions {
  document?: Document;
  enableOnContentEditable?: boolean;
  enableOnFormTags?: readonly FormTags[] | boolean;
  enabled?: boolean;
  preventDefault?: boolean;
  timeoutMs?: number;
}

const DEFAULT_COMBINATION_KEY = '+';
const DEFAULT_SPLIT_KEY = ',';
const KONAMI_TIMEOUT_MS = 1_000;
const hotkeyKeyAliases: Record<string, string> = {
  ' ': 'space',
  ',': 'comma',
  '-': 'slash',
  '.': 'period',
  '#': 'backslash',
  '+': 'bracketright',
  altleft: 'alt',
  altright: 'alt',
  cmd: 'meta',
  command: 'meta',
  control: 'ctrl',
  controlleft: 'ctrl',
  controlright: 'ctrl',
  esc: 'escape',
  metaleft: 'meta',
  metaright: 'meta',
  os: 'meta',
  osleft: 'meta',
  osright: 'meta',
  option: 'alt',
  return: 'enter',
  shiftleft: 'shift',
  shiftright: 'shift',
};
const modifierKeys = new Set(['alt', 'ctrl', 'meta', 'mod', 'shift']);

const KONAMI_CODE_SEQUENCE = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'b',
  'a',
] as const;

type NormalizedHotkey = {
  alt: boolean;
  ctrl: boolean;
  keys: string[];
  meta: boolean;
  mod: boolean;
  shift: boolean;
};

type SharedHotkeysEvent = {
  alt?: boolean;
  ctrl?: boolean;
  keys?: readonly string[];
  meta?: boolean;
  mod?: boolean;
  shift?: boolean;
};

const isBindingArray = (value: Keys | readonly HotkeyBinding[]): value is readonly HotkeyBinding[] => (
  Array.isArray(value)
  && value.every((item) => typeof item === 'object' && item !== null && 'callback' in item && 'keys' in item)
);

const isDependencyList = (value: DependencyList | Options | undefined): value is DependencyList => (
  Array.isArray(value)
);

const normalizeKey = (key: string): string => {
  const alias = hotkeyKeyAliases[key];

  return (alias ?? key)
    .trim()
    .toLowerCase()
    .replace(/key|digit|numpad|arrow/g, '');
};

const normalizeHotkey = (
  hotkey: string,
  combinationKey: string = DEFAULT_COMBINATION_KEY,
): NormalizedHotkey => {
  const keys = hotkey
    .toLowerCase()
    .split(combinationKey)
    .map((part) => normalizeKey(part));

  return {
    alt: keys.includes('alt'),
    ctrl: keys.includes('ctrl'),
    meta: keys.includes('meta'),
    mod: keys.includes('mod'),
    shift: keys.includes('shift'),
    keys: keys.filter((key) => !modifierKeys.has(key)),
  };
};

const matchesHotkey = (event: SharedHotkeysEvent, hotkey: NormalizedHotkey): boolean => {
  const eventKeys = [...(event.keys ?? [])];

  return event.alt === hotkey.alt
    && event.ctrl === hotkey.ctrl
    && event.meta === hotkey.meta
    && event.mod === hotkey.mod
    && event.shift === hotkey.shift
    && eventKeys.length === hotkey.keys.length
    && eventKeys.every((key, index) => key === hotkey.keys[index]);
};

const isHotkeyEnabledOnTag = (
  target: EventTarget | null,
  enabledOnTags: readonly FormTags[] | boolean = false,
): boolean => {
  const tagName = target instanceof HTMLElement ? target.tagName : null;

  if (Array.isArray(enabledOnTags)) {
    return Boolean(
      tagName
      && enabledOnTags.some((tag) => tag.toLowerCase() === tagName.toLowerCase()),
    );
  }

  return Boolean(tagName && enabledOnTags);
};

const isKeyboardEventTriggeredByInput = (event: KeyboardEvent): boolean => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName);
};

const isScopeActive = (scopeRef: MutableRefObject<HTMLElement | null>): boolean => {
  const scopeElement = scopeRef.current;

  if (!scopeElement) {
    return true;
  }

  const rootNode = scopeElement.getRootNode();
  if (!(rootNode instanceof Document || rootNode instanceof ShadowRoot)) {
    return false;
  }

  return rootNode.activeElement === scopeElement || scopeElement.contains(rootNode.activeElement);
};

const getBindingKeys = (
  keys: Keys,
  splitKey: string = DEFAULT_SPLIT_KEY,
): string[] => {
  const values = Array.isArray(keys) ? keys : [keys];

  return values.flatMap((value) => (
    value.split(splitKey).map((part: string) => part.trim()).filter(Boolean)
  ));
};

export { KONAMI_CODE_SEQUENCE };

export function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: Options,
  deps?: DependencyList,
): MutableRefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
  bindings: readonly HotkeyBinding[],
  options?: Options,
  deps?: DependencyList,
): MutableRefObject<T | null>;
export function useHotkeys<T extends HTMLElement>(
  keysOrBindings: Keys | readonly HotkeyBinding[],
  callbackOrOptions?: HotkeyCallback | Options,
  maybeOptions?: Options | DependencyList,
  maybeDeps?: DependencyList,
): MutableRefObject<T | null> {
  if (!isBindingArray(keysOrBindings)) {
    const options = (
      typeof callbackOrOptions === 'function'
        ? maybeOptions
        : callbackOrOptions
    );
    const deps = (
      typeof callbackOrOptions === 'function'
        ? maybeDeps
        : isDependencyList(maybeOptions)
          ? maybeOptions
          : maybeDeps
    );
    const callback = (
      typeof callbackOrOptions === 'function'
        ? callbackOrOptions
        : () => {}
    );

    return useLibraryHotkeys<T>(keysOrBindings, callback, options, deps);
  }

  const options = isDependencyList(callbackOrOptions) ? undefined : callbackOrOptions;
  const deps = isDependencyList(callbackOrOptions)
    ? callbackOrOptions
    : isDependencyList(maybeOptions)
      ? maybeOptions
      : maybeDeps;
  const splitKey = options?.splitKey ?? DEFAULT_SPLIT_KEY;
  const combinationKey = options?.combinationKey ?? DEFAULT_COMBINATION_KEY;
  const compiledBindings = keysOrBindings.flatMap((binding) => (
    getBindingKeys(binding.keys, splitKey).map((key) => ({
      callback: binding.callback,
      hotkey: normalizeHotkey(key, combinationKey),
    }))
  ));
  const flattenedKeys = keysOrBindings.flatMap((binding) => getBindingKeys(binding.keys, splitKey));

  return useLibraryHotkeys<T>(
    flattenedKeys,
    (event: KeyboardEvent, hotkeyEvent: SharedHotkeysEvent) => {
      const match = compiledBindings.find((binding) => matchesHotkey(hotkeyEvent, binding.hotkey));

      match?.callback(event, hotkeyEvent);
    },
    options,
    deps,
  );
}

export function useKonami<T extends HTMLElement>(
  callback: (event: KeyboardEvent) => void,
  options?: KonamiOptions,
  deps?: DependencyList,
): MutableRefObject<T | null> {
  const scopeRef = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  const progressRef = useRef(0);
  const lastKeyTimestampRef = useRef(0);
  const memoizedCallback = useCallback(callback, deps ?? []);
  const timeoutMs = options?.timeoutMs ?? KONAMI_TIMEOUT_MS;

  callbackRef.current = deps ? memoizedCallback : callback;

  useEffect(() => {
    if (options?.enabled === false) {
      return undefined;
    }

    const hotkeyDocument = options?.document ?? document;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isKeyboardEventTriggeredByInput(event)
        && !isHotkeyEnabledOnTag(event.target, options?.enableOnFormTags)
      ) {
        return;
      }

      if (
        event.target instanceof HTMLElement
        && event.target.isContentEditable
        && !options?.enableOnContentEditable
      ) {
        return;
      }

      if (!isScopeActive(scopeRef as MutableRefObject<HTMLElement | null>)) {
        return;
      }

      const normalizedKey = normalizeKey(event.key);
      const expectedKey = KONAMI_CODE_SEQUENCE[progressRef.current];

      if (!expectedKey) {
        progressRef.current = 0;
        lastKeyTimestampRef.current = 0;
        return;
      }

      if (
        lastKeyTimestampRef.current > 0
        && Date.now() - lastKeyTimestampRef.current > timeoutMs
      ) {
        progressRef.current = 0;
      }

      if (normalizedKey === expectedKey) {
        progressRef.current += 1;
        lastKeyTimestampRef.current = Date.now();

        if (progressRef.current === KONAMI_CODE_SEQUENCE.length) {
          if (options?.preventDefault) {
            event.preventDefault();
          }

          callbackRef.current(event);
          progressRef.current = 0;
          lastKeyTimestampRef.current = 0;
        }

        return;
      }

      progressRef.current = normalizedKey === KONAMI_CODE_SEQUENCE[0] ? 1 : 0;
      lastKeyTimestampRef.current = progressRef.current > 0 ? Date.now() : 0;
    };

    hotkeyDocument.addEventListener('keydown', handleKeyDown);

    return () => {
      hotkeyDocument.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    options?.document,
    options?.enableOnContentEditable,
    options?.enableOnFormTags,
    options?.enabled,
    options?.preventDefault,
    timeoutMs,
  ]);

  return scopeRef;
}
