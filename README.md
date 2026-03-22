# tv-shared

Shared UI and GitHub Actions infrastructure for Taylor Vance portfolio projects.

This repo is intended to be the source of truth for code reused across:
- `tvprograms`
- `mcts-web`
- `wordlink`
- future portfolio projects that link back to `https://tvprograms.tech`

## Why this repo exists

The portfolio site should remain an app consumer, not the owner of shared code. Common pieces like the `BrandBadge` and the GitHub Pages deploy pipeline belong in a separate repo so they can be versioned and reused independently.

## Initial scope

### UI package
Create a reusable React package under `packages/ui` for small, stable cross-project components.

Initial extraction targets:
- `BrandBadge`
- shared TV Programs mark / logo exports
- shared site constants such as `https://tvprograms.tech`

Constraints:
- Keep components CSS-agnostic by default.
- Prefer small primitives over app-specific abstractions.
- Support both Tailwind consumers and plain CSS consumers.
- Do not move project-specific layout, page, or feature components here unless they have at least two real consumers.

### GitHub Actions
Create reusable GitHub workflow(s) under `.github/workflows`.

Initial extraction target:
- reusable GitHub Pages build + deploy workflow using `workflow_call`

Constraints:
- Prefer reusable workflows over composite actions for full CI/CD pipelines.
- Keep inputs simple: node version, working directory, install command, lint command, test command, build command, artifact path.
- Use official Pages actions unless there is a clear reason not to.

## Proposed structure

```text
packages/
  ui/
    src/
.github/
  workflows/
```

## Current implementation

This repo now contains:
- `packages/ui`: a small React package exporting `BrandBadge`, `TvProgramsMark`, and shared site constants.
- `.github/workflows/verify.yml`: a reusable CI verification workflow.
- `.github/workflows/deploy-pages.yml`: a reusable GitHub Pages workflow built around `workflow_call`.
- `docs/consumer-standard.md`: the shared consumer contract for scripts, workflows, and hooks.
- `docs/adoption-plan.md`: the forward migration plan for current and future consumers.

## UI package

### Exports

`@tv-shared/ui` currently exports:
- `BrandBadge`
- `TvProgramsMark`
- `TVPROGRAMS_MARK_SVG_URL`
- `TVPROGRAMS_MARK_PNG_URL`
- `TVPROGRAMS_URL`
- `TVPROGRAMS_HOSTNAME`
- `TVPROGRAMS_DEFAULT_LABEL`
- `brandBadgeClassNames`

### `BrandBadge`

The extracted badge keeps the shared behavior stable:
- default href: `https://tvprograms.tech`
- default label: `tvprograms.tech`
- local inline SVG mark instead of a hotlinked remote image
- default presentation for quick use
- `unstyled` mode for Tailwind or app-owned CSS

Example with defaults:

```tsx
import { BrandBadge } from '@tv-shared/ui';

export function Footer() {
  return <BrandBadge />;
}
```

Example with app-owned styling:

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

The stable class hooks are also exported via `brandBadgeClassNames` for CSS consumers that want library-provided slot names.

### Raw logo assets

For cases that need an image URL rather than a React component, the package now exposes the TV mark in two ways.

Bundler-friendly URL constants:

```tsx
import { TVPROGRAMS_MARK_SVG_URL } from '@tv-shared/ui';

export function HeaderLogo() {
  return <img src={TVPROGRAMS_MARK_SVG_URL} alt="TV Programs" />;
}
```

Raw asset subpaths:

```tsx
import tvMarkUrl from '@tv-shared/ui/tv.svg';

export function HeaderLogo() {
  return <img src={tvMarkUrl} alt="TV Programs" />;
}
```

Available raw asset subpaths:
- `@tv-shared/ui/tv.svg`
- `@tv-shared/ui/tv.png`

### Build

From the repo root:

```bash
npm install
npm run build
```

## GitHub Pages workflow

Reusable workflow path:

```text
.github/workflows/deploy-pages.yml
```

The workflow accepts these inputs:
- `node-version`
- `working-directory`
- `install-command`
- `lint-command`
- `test-command`
- `build-command`
- `artifact-path`

Example consumer workflow:

```yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    uses: ttvance/tv-shared/.github/workflows/deploy-pages.yml@main
    with:
      node-version: '20'
      working-directory: .
      install-command: npm ci
      lint-command: npm run lint
      test-command: npm test -- --run
      build-command: npm run build
      artifact-path: dist
```

## CI standard

Reusable CI workflow path:

```text
.github/workflows/verify.yml
```

The recommended consumer contract is documented in:
- `docs/consumer-standard.md`
- `docs/adoption-plan.md`

At a minimum, future consumers should converge on:
- `lint`
- `test`
- `build`
- `verify`

This repo also uses the standard itself via:

```text
.github/workflows/ci.yml
```

## Consumer repos to inspect before changing shared code

Sibling paths from the local `dev` directory:
- `../tvprograms`
- `../mcts-web`
- `../wordlink`

## Notes

Current duplication already confirmed:
- `mcts-web/src/components/BrandBadge.tsx`
- `wordlink/src/components/BrandBadge.tsx`

The two apps use different styling approaches, so the shared component API does not assume one CSS system.
