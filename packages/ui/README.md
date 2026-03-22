# `@tv-shared/ui`

Shared React UI primitives for Taylor Vance portfolio projects.

## Current exports

- `BrandBadge`
- `TvProgramsMark`
- `TVPROGRAMS_MARK_SVG_URL`
- `TVPROGRAMS_MARK_PNG_URL`
- `TVPROGRAMS_URL`
- `TVPROGRAMS_HOSTNAME`
- `TVPROGRAMS_DEFAULT_LABEL`
- `brandBadgeClassNames`

## Design goals

- Keep primitives small and stable.
- Stay CSS-agnostic by default.
- Work in utility-class and plain-CSS apps.
- Prefer composition and slot hooks over opinionated app styling.

## `BrandBadge`

Quick default usage:

```tsx
import { BrandBadge } from '@tv-shared/ui';

export function Footer() {
  return <BrandBadge />;
}
```

Consumer-owned styling:

```tsx
import { BrandBadge } from '@tv-shared/ui';

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
import { TvProgramsMark } from '@tv-shared/ui';
```

URL exports:

```tsx
import { TVPROGRAMS_MARK_SVG_URL } from '@tv-shared/ui';
```

Raw asset subpaths:

```tsx
import tvMarkUrl from '@tv-shared/ui/tv.svg';
```
