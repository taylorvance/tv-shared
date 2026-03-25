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

Explicit subpaths:

- `@taylorvance/tv-shared-runtime/BrandBadge`
- `@taylorvance/tv-shared-runtime/assets`

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
