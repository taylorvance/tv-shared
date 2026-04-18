import {
  useCallback,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefCallback,
  type RefObject,
} from 'react';
import type { Keys, Options as HotkeyOptions } from 'react-hotkeys-hook';
import {
  useHotkeys,
  useKeySequence,
  type KeySequenceOptions,
} from './hotkeys.js';

const FALLBACK_DISABLED_HOTKEY = 'f24';
const FALLBACK_DISABLED_SEQUENCE = ['__tv_shared_disabled__'] as const;

type MutableRef<T> = {
  current: T | null;
};

export interface ShortcutDefinition {
  description?: ReactNode;
  hidden?: boolean;
  id: string;
  keys?: Keys;
  label: ReactNode;
  onTrigger: (event: KeyboardEvent) => void;
  sequence?: readonly string[];
}

export interface RegisteredShortcut {
  description?: ReactNode;
  hidden?: boolean;
  id: string;
  keys?: Keys;
  label: ReactNode;
  sequence?: readonly string[];
}

export interface ShortcutRegistryOptions {
  hotkeys?: HotkeyOptions;
  sequences?: KeySequenceOptions;
}

export interface ShortcutRegistryResult<T extends HTMLElement> {
  ref: RefCallback<T>;
  shortcuts: readonly RegisteredShortcut[];
  visibleShortcuts: readonly RegisteredShortcut[];
}

export interface ShortcutPanelProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'title'> {
  emptyLabel?: ReactNode;
  heading?: ReactNode;
  shortcuts: readonly RegisteredShortcut[];
  unstyled?: boolean;
}

const DEFAULT_PANEL_STYLE = {
  background: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '18px',
  color: '#0f172a',
  display: 'grid',
  gap: '0.85rem',
  padding: '1rem',
} as const;

const DEFAULT_LIST_STYLE = {
  display: 'grid',
  gap: '0.65rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
} as const;

const DEFAULT_ITEM_STYLE = {
  alignItems: 'center',
  display: 'grid',
  gap: '0.65rem',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
} as const;

const DEFAULT_GESTURE_STYLE = {
  background: 'rgba(15, 23, 42, 0.08)',
  borderRadius: '999px',
  fontSize: '0.8rem',
  fontWeight: 700,
  padding: '0.28rem 0.6rem',
  whiteSpace: 'nowrap',
} as const;

const noop = () => {};

const stripShortcut = ({
  description,
  hidden,
  id,
  keys,
  label,
  sequence,
}: ShortcutDefinition): RegisteredShortcut => ({
  ...(description === undefined ? {} : { description }),
  ...(hidden === undefined ? {} : { hidden }),
  id,
  ...(keys === undefined ? {} : { keys }),
  label,
  ...(sequence === undefined ? {} : { sequence }),
});

const assignRef = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  value: T | null,
) => {
  (ref as MutableRef<T>).current = value;
};

export const formatShortcutGesture = (shortcut: Pick<RegisteredShortcut, 'keys' | 'sequence'>) => {
  if(shortcut.keys !== undefined) {
    return Array.isArray(shortcut.keys)
      ? shortcut.keys.join(' / ')
      : shortcut.keys;
  }

  if(shortcut.sequence !== undefined) {
    return shortcut.sequence.join(' then ');
  }

  return '';
};

export function useShortcutRegistry<T extends HTMLElement>(
  shortcuts: readonly ShortcutDefinition[],
  options: ShortcutRegistryOptions = {},
): ShortcutRegistryResult<T> {
  const registeredShortcuts = shortcuts.map(stripShortcut);
  const visibleShortcuts = registeredShortcuts.filter((shortcut) => !shortcut.hidden);
  const hotkeyBindings = shortcuts
    .filter((shortcut) => shortcut.keys !== undefined)
    .map((shortcut) => ({
      callback: shortcut.onTrigger,
      keys: shortcut.keys as Keys,
    }));
  const sequenceBindings = shortcuts
    .filter((shortcut) => shortcut.sequence !== undefined)
    .map((shortcut) => ({
      callback: shortcut.onTrigger,
      sequence: shortcut.sequence as readonly string[],
    }));
  const hotkeyRef = useHotkeys<T>(
    hotkeyBindings.length > 0
      ? hotkeyBindings
      : [{ callback: noop, keys: FALLBACK_DISABLED_HOTKEY }],
    {
      ...options.hotkeys,
      enabled: hotkeyBindings.length > 0 && options.hotkeys?.enabled !== false,
    },
  );
  const sequenceRef = useKeySequence<T>(
    sequenceBindings.length > 0
      ? sequenceBindings
      : [{ callback: noop, sequence: FALLBACK_DISABLED_SEQUENCE }],
    {
      ...options.sequences,
      enabled: sequenceBindings.length > 0 && options.sequences?.enabled !== false,
    },
  );
  const ref = useCallback<RefCallback<T>>((node) => {
    assignRef(hotkeyRef, node);
    assignRef(sequenceRef, node);
  }, [hotkeyRef, sequenceRef]);

  return {
    ref,
    shortcuts: registeredShortcuts,
    visibleShortcuts,
  };
}

export function ShortcutPanel({
  className,
  emptyLabel = 'No shortcuts registered.',
  heading = 'Shortcuts',
  shortcuts,
  style,
  unstyled = false,
  ...props
}: ShortcutPanelProps) {
  if(shortcuts.length === 0) {
    return (
      <section
        className={className}
        style={unstyled ? style : { ...DEFAULT_PANEL_STYLE, ...style }}
        {...props}
      >
        <strong>{heading}</strong>
        <p>{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section
      className={className}
      style={unstyled ? style : { ...DEFAULT_PANEL_STYLE, ...style }}
      {...props}
    >
      <strong>{heading}</strong>
      <ul style={unstyled ? undefined : DEFAULT_LIST_STYLE}>
        {shortcuts.map((shortcut) => (
          <li key={shortcut.id} style={unstyled ? undefined : DEFAULT_ITEM_STYLE}>
            <span>
              <span>{shortcut.label}</span>
              {shortcut.description ? (
                <span style={{ color: '#475569', display: 'block', marginTop: '0.2rem' }}>
                  {shortcut.description}
                </span>
              ) : null}
            </span>
            <kbd style={unstyled ? undefined : DEFAULT_GESTURE_STYLE}>
              {formatShortcutGesture(shortcut)}
            </kbd>
          </li>
        ))}
      </ul>
    </section>
  );
}
