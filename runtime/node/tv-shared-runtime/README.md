# `@taylorvance/tv-shared-runtime`

Shared React runtime primitives for Taylor Vance portfolio projects.

The canonical TV Programs logo files live in the repo-level `assets/` directory and are copied into this package during build so the package can continue to expose raw asset subpaths.

## Public API

Root exports:

- `BrandBadge`
- `TvProgramsMark`
- `TVPROGRAMS_URL`
- `TVPROGRAMS_HOSTNAME`
- `TVPROGRAMS_DEFAULT_LABEL`
- `brandBadgeClassNames`
- `createProjectStorage`
- `useHotkeys`
- `useKonami`
- `KONAMI_CODE_SEQUENCE`

Explicit subpaths:

- `@taylorvance/tv-shared-runtime/BrandBadge`
- `@taylorvance/tv-shared-runtime/assets`
- `@taylorvance/tv-shared-runtime/hotkeys`
- `@taylorvance/tv-shared-runtime/storage`
- `@taylorvance/tv-shared-runtime/storage-dev`

## Design goals

- Keep primitives small and stable.
- Stay CSS-agnostic by default.
- Work in utility-class and plain-CSS apps.
- Prefer composition and slot hooks over opinionated app styling.

## `BrandBadge`

Quick default usage:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-runtime';

export function Footer() {
  return <BrandBadge />;
}
```

Explicit component-only entry:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-runtime/BrandBadge';
```

Consumer-owned styling:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-runtime';

export function Footer() {
  return (
    <BrandBadge
      className="brand-badge"
      iconClassName="brand-badge-icon"
      labelClassName="brand-badge-label"
      unstyled
    />
  );
}
```

## Logo assets

React component:

```tsx
import { TvProgramsMark } from '@taylorvance/tv-shared-runtime';
```

URL exports:

```tsx
import { TVPROGRAMS_MARK_SVG_URL } from '@taylorvance/tv-shared-runtime/assets';
```

Raw asset subpaths:

```tsx
import tvMarkUrl from '@taylorvance/tv-shared-runtime/tv.svg';
```

## Project storage

Use `createProjectStorage` when a consumer needs browser `localStorage` keys that stay unique per project on shared origins such as localhost.

```ts
import { createProjectStorage } from '@taylorvance/tv-shared-runtime/storage';

const storage = createProjectStorage('wordlink', { version: 1 });

const themePreference = storage.readString('theme-preference') ?? 'system';

storage.writeString('dark', 'theme-preference');
storage.writeJson({ expanded: true }, 'panels', 'complexity');
const entries = storage.list();
```

When `version` is provided, keys follow the pattern `<projectKey>:v<version>:<key parts...>`, for example `wordlink:v1:theme-preference`.

The helper is SSR-safe and treats storage-access failures as soft failures by returning `null` or doing nothing.

It also provides namespace-level maintenance helpers:
- `list()` returns the current keys and raw string values for the active project/version namespace.
- `clear()` removes only the current project/version namespace.

## Storage dev tools

For dev-only inspection, manual edits, and namespace JSON import/export, use the explicit `storage-dev` entry:

```tsx
import { ProjectStorageInspector } from '@taylorvance/tv-shared-runtime/storage-dev';

export function StorageDebugPanel() {
  return (
    <ProjectStorageInspector
      projectKey="mcts-web"
      versions={[
        { label: 'Version 1', value: 1 },
        { label: 'Version 2', value: 2 },
      ]}
    />
  );
}
```

This inspector is meant for local tooling and debug screens, not default production UI.

## Hotkeys

Use `useHotkeys` for shared app shortcuts. It supports the library's normal global behavior by default, and it becomes element-scoped when you attach the returned ref to a focusable container.

```tsx
import { useHotkeys } from '@taylorvance/tv-shared-runtime';

export function SessionPanel() {
  const hotkeyRef = useHotkeys<HTMLDivElement>([
    { keys: 'r', callback: () => resetGame() },
    { keys: 'z', callback: () => undoMove() },
    { keys: 'x', callback: () => redoMove() },
  ]);

  return (
    <section ref={hotkeyRef} tabIndex={-1}>
      ...
    </section>
  );
}
```

If you do not attach the returned ref, the hotkeys are global for the current document.

The hook keeps the default input-safe behavior from `react-hotkeys-hook`, so shortcuts do not fire while a user is typing into an `input`, `textarea`, or `select` unless you opt in through `enableOnFormTags`.

For an easy easter-egg path, `useKonami` exposes a built-in Konami listener with the same optional scoping model:

```tsx
import { useKonami } from '@taylorvance/tv-shared-runtime';

export function SessionPanel() {
  const hotkeyRef = useKonami<HTMLDivElement>(() => {
    setDebugMode(true);
  });

  return (
    <section ref={hotkeyRef} tabIndex={-1}>
      ...
    </section>
  );
}
```

The shared Konami sequence is also exported as `KONAMI_CODE_SEQUENCE`.
