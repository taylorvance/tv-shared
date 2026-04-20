# `@taylorvance/tv-shared-web`

Shared web runtime primitives for Taylor Vance portfolio projects.

The package stays intentionally small. It is meant to hold stable cross-app building blocks, not app shells or business logic.

The canonical TV Programs logo files live in the repo-level `assets/` directory and are copied into this package during build so npm consumers can keep using raw asset subpaths.

## Public API

Root exports:

- brand primitives: `BrandBadge`, `TvProgramsMark`, `TvProgramsWordmark`
- shared branding constants: `TVPROGRAMS_URL`, `TVPROGRAMS_HOSTNAME`, `TVPROGRAMS_DEFAULT_LABEL`
- styling hooks: `brandBadgeClassNames`, `tvProgramsWordmarkClassNames`
- storage: `createProjectStorage`, `usePersistentState`
- URL and debug helpers: `useUrlState`, `useDebugFlag`
- hotkeys and shortcut helpers: `useHotkeys`, `useKeySequence`, `useKonami`, `useShortcutRegistry`, `ShortcutPanel`, `formatShortcutGesture`
- codecs: `createStringCodec`, `createJsonCodec`, `createNumberCodec`, `createBooleanCodec`, `createStringUnionCodec`
- share and snapshot helpers: `writeClipboardText`, `shareContent`, `formatShareContent`, `createSnapshotEnvelope`, `serializeSnapshot`, `parseSnapshot`, `copySnapshotToClipboard`
- theme and accessibility helpers: `useThemePreference`, `useSystemTheme`, `resolveThemePreference`, `usePrefersReducedMotion`, `LiveAnnouncer`, `useLiveAnnouncer`

Explicit subpaths:

- `@taylorvance/tv-shared-web/BrandBadge`
- `@taylorvance/tv-shared-web/TvProgramsWordmark`
- `@taylorvance/tv-shared-web/assets`
- `@taylorvance/tv-shared-web/codecs`
- `@taylorvance/tv-shared-web/storage`
- `@taylorvance/tv-shared-web/persistent-state`
- `@taylorvance/tv-shared-web/url-state`
- `@taylorvance/tv-shared-web/debug-flags`
- `@taylorvance/tv-shared-web/shortcuts`
- `@taylorvance/tv-shared-web/hotkeys`
- `@taylorvance/tv-shared-web/share`
- `@taylorvance/tv-shared-web/snapshots`
- `@taylorvance/tv-shared-web/theme`
- `@taylorvance/tv-shared-web/a11y`
- `@taylorvance/tv-shared-web/storage-dev`

## Design goals

- Keep primitives small and stable.
- Stay CSS-agnostic by default.
- Work in utility-class and plain-CSS apps.
- Prefer composable hooks and helpers over broad abstractions.
- Let consumer apps keep ownership of layout and domain logic.

## Brand primitives

Default badge:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-web';

export function Footer() {
  return <BrandBadge />;
}
```

Wordmark:

```tsx
import { TvProgramsWordmark } from '@taylorvance/tv-shared-web';

export function Header() {
  return <TvProgramsWordmark />;
}
```

Consumer-owned styling:

```tsx
import { TvProgramsWordmark } from '@taylorvance/tv-shared-web';

export function Header() {
  return (
    <TvProgramsWordmark
      className="brand-wordmark"
      labelClassName="brand-wordmark-label"
      markClassName="brand-wordmark-mark"
      unstyled
    />
  );
}
```

Raw asset subpaths remain available:

```tsx
import tvMarkUrl from '@taylorvance/tv-shared-web/tv.svg';
```

## Storage and state

Use `createProjectStorage()` for namespaced `localStorage` keys on shared origins such as localhost:

```ts
import { createProjectStorage } from '@taylorvance/tv-shared-web/storage';

const storage = createProjectStorage('wordlink', { version: 1 });
```

Each key part is percent-encoded before it is joined into the stored key, so `storage.key('a:b')` and `storage.key('a', 'b')` do not collide.

For React state backed by that namespace:

```tsx
import {
  createStringCodec,
  usePersistentState,
} from '@taylorvance/tv-shared-web';

const storage = createProjectStorage('wordlink', { version: 1 });

export function NotesPanel() {
  const [notes, setNotes, controls] = usePersistentState(storage, ['demo', 'notes'], {
    codec: createStringCodec(),
    defaultValue: '',
  });

  return (
    <>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      <button onClick={controls.clear}>Reset</button>
    </>
  );
}
```

For shareable URL state:

```tsx
import { createStringCodec, useUrlState } from '@taylorvance/tv-shared-web';

export function InspectorTabs() {
  const [tab, setTab] = useUrlState('tab', {
    codec: createStringCodec(),
    defaultValue: 'overview',
  });

  return <button onClick={() => setTab('history')}>{tab}</button>;
}
```

`useUrlState()` supports both query params and hash-param mode.

## Debug flags and shortcuts

Use `useDebugFlag()` when a flag should be storage-backed, optionally overridable by a URL param, and optionally toggleable by a hotkey:

```tsx
import { useDebugFlag } from '@taylorvance/tv-shared-web';

export function SessionDebug({ storage }: { storage: ProjectStorage }) {
  const debugGrid = useDebugFlag<HTMLDivElement>('grid', {
    hotkeys: 'g',
    label: 'Toggle grid overlay',
    storage,
    urlParam: 'grid',
  });

  return (
    <section ref={debugGrid.ref} tabIndex={-1}>
      <button onClick={debugGrid.toggle}>
        {debugGrid.value ? 'Disable grid' : 'Enable grid'}
      </button>
    </section>
  );
}
```

For a reusable visible-shortcuts list, keep one shortcut definition source of truth and pass the visible subset into `ShortcutPanel`:

```tsx
import { ShortcutPanel, useShortcutRegistry } from '@taylorvance/tv-shared-web';

export function ShortcutHelp() {
  const shortcuts = useShortcutRegistry([
    { id: 'copy', keys: 'c', label: 'Copy snapshot', onTrigger: () => {} },
    { id: 'secret', hidden: true, sequence: ['d', 'e', 'm', 'o'], label: 'Secret', onTrigger: () => {} },
  ]);

  return <ShortcutPanel shortcuts={shortcuts.visibleShortcuts} />;
}
```

Hidden shortcuts stay active but are not shown by `ShortcutPanel`.

`useHotkeys()`, `useKeySequence()`, and `useKonami()` are still available directly for lower-level control.

## Snapshots and share helpers

For deterministic app state, use the shared snapshot envelope instead of inventing a new JSON blob per app:

```tsx
import {
  copySnapshotToClipboard,
  parseSnapshot,
  serializeSnapshot,
} from '@taylorvance/tv-shared-web';

const snapshot = serializeSnapshot({ seed: '123', moves: ['A1-B2'] }, {
  kind: 'session',
  version: 1,
});
const parsed = parseSnapshot(snapshot, { kind: 'session', version: 1 });

await copySnapshotToClipboard(parsed.value, { kind: 'session', version: 1 });
```

For generic clipboard/share flows:

```tsx
import { shareContent } from '@taylorvance/tv-shared-web';

await shareContent({
  title: 'wordlink',
  text: 'seed=123',
});
```

The helper uses the Web Share API when available and falls back to the clipboard by default.

## Theme and accessibility helpers

Theme preference helper:

```tsx
import {
  createProjectStorage,
  useThemePreference,
} from '@taylorvance/tv-shared-web';

const storage = createProjectStorage('wordlink', { version: 1 });

export function ThemeToggle() {
  const theme = useThemePreference(storage, { applyToDocument: true });

  return (
    <button onClick={() => theme.setThemePreference('dark')}>
      {theme.themePreference} -> {theme.resolvedTheme}
    </button>
  );
}
```

Reduced motion:

```tsx
import { usePrefersReducedMotion } from '@taylorvance/tv-shared-web';
```

Live announcements:

```tsx
import { LiveAnnouncer, useLiveAnnouncer } from '@taylorvance/tv-shared-web';
```

These helpers are intentionally light. They handle system-preference and announcement plumbing, while the consumer app still decides what to animate, theme, or announce.

## Storage dev tools

For dev-only inspection, manual edits, and namespace JSON import/export, use the explicit `storage-dev` entry:

```tsx
import { ProjectStorageInspector } from '@taylorvance/tv-shared-web/storage-dev';
```

This inspector is meant for local tooling and debug screens, not default production UI.

Namespace JSON exports include `keyParts` so keys containing literal separator characters round-trip exactly.
