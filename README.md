# tv-shared

Shared runtime code, tooling, and GitHub workflow infrastructure for Taylor Vance portfolio projects.

This repo is intended to be the source of truth for code reused across:
- `tvprograms`
- `mcts-web`
- `wordlink`
- future portfolio projects that link back to `https://tvprograms.tech`

## Why this repo exists

The portfolio site should remain an app consumer, not the owner of shared code. Common pieces like the `BrandBadge` and the GitHub Pages deploy pipeline belong in a separate repo so they can be versioned and reused independently.

The repo is organized by delivery mechanism:

- published runtime code under `runtime/<stack>/`
- reusable workflows in `.github/workflows/`
- stack-specific tooling assets under `tooling/<stack>/`

## Initial scope

### Runtime
Keep published application code under `runtime/<stack>/`.

Current runtime package:
- `runtime/node/tv-shared-runtime`

Initial extraction targets:
- `BrandBadge`
- shared TV Programs mark / logo exports
- shared site constants such as `https://tvprograms.tech`

Constraints:
- Keep components CSS-agnostic by default.
- Prefer small primitives over app-specific abstractions.
- Support both Tailwind consumers and plain CSS consumers.
- Do not move project-specific layout, page, or feature components here unless they have at least two real consumers.

### Tooling
Keep reusable tooling source outside runtime packages.

Current shape:

```text
runtime/
  node/
    tv-shared-runtime/
tooling/
  node/
```

### GitHub Actions
Create reusable GitHub workflow(s) under `.github/workflows`.

Initial extraction target:
- reusable GitHub Pages build + deploy workflow using `workflow_call`

Constraints:
- Prefer reusable workflows over composite actions for full CI/CD pipelines.
- Keep inputs simple: node version, working directory, install command, lint command, test command, build command, artifact path.
- Use official Pages actions unless there is a clear reason not to.

## Current structure

```text
runtime/
  node/
    tv-shared-runtime/
tooling/
  node/
.github/
  workflows/
```

## Current implementation

This repo now contains:
- `assets/`: canonical shared static assets such as the TV Programs mark.
- `runtime/node/tv-shared-runtime`: the published Node runtime package.
- `tooling/node/`: copyable Node and TypeScript tooling baselines.
- `apps/playground`: a local example consumer for live UI development.
- `.github/workflows/verify.yml`: a reusable CI verification workflow.
- `.github/workflows/deploy-pages.yml`: a reusable GitHub Pages workflow built around `workflow_call`.
- `.github/workflows/release.yml`: a Changesets-based release workflow for the published Node runtime package.
- `docs/consumer-standard.md`: the shared consumer contract for scripts, workflows, and tooling baselines.
- `docs/adoption-plan.md`: the current consumer alignment plan.
- `docs/package-checklist.md`: the checklist for creating and publishing future runtime packages.
- `docs/release-strategy.md`: the release/versioning guidance for runtime packages in this repo.
- `docs/examples/`: copyable consumer workflow wrappers.

## Runtime package

### Exports

`@taylorvance/tv-shared-runtime` currently exposes:

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

### `BrandBadge`

The extracted badge keeps the shared behavior stable:
- default href: `https://tvprograms.tech`
- default label: `tvprograms.tech`
- local inline SVG mark instead of a hotlinked remote image
- default presentation for quick use
- `unstyled` mode for Tailwind or app-owned CSS

Example with defaults:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-runtime';

export function Footer() {
  return <BrandBadge />;
}
```

Example with app-owned styling:

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

The stable class hooks are also exported via `brandBadgeClassNames` for CSS consumers that want library-provided slot names.

Consumers that want an explicit component-only entry can also import:

```tsx
import { BrandBadge } from '@taylorvance/tv-shared-runtime/BrandBadge';
```

### Raw logo assets

For cases that need an image URL rather than a React component, the package now exposes the TV mark in two ways.

Bundler-friendly URL constants:

```tsx
import { TVPROGRAMS_MARK_SVG_URL } from '@taylorvance/tv-shared-runtime/assets';

export function HeaderLogo() {
  return <img src={TVPROGRAMS_MARK_SVG_URL} alt="TV Programs" />;
}
```

Raw asset subpaths:

```tsx
import tvMarkUrl from '@taylorvance/tv-shared-runtime/tv.svg';

export function HeaderLogo() {
  return <img src={tvMarkUrl} alt="TV Programs" />;
}
```

Available raw asset subpaths:
- `@taylorvance/tv-shared-runtime/tv.svg`
- `@taylorvance/tv-shared-runtime/tv.png`

## Shared assets

Canonical shared asset files live at the repo top level in `assets/`.

Current shared assets:
- `assets/tv.svg`
- `assets/tv.png`

The runtime package copies these files into its published package during build so npm consumers can still import them through `@taylorvance/tv-shared-runtime`.

### Build

From the repo root:

```bash
npm install
npm run verify
```

For live visual development:

```bash
npm run dev
```

The playground is a real local consumer app under `apps/playground`. `npm run dev` runs both the runtime package watcher and the Vite app, so edits in `runtime/node/tv-shared-runtime` rebuild into `dist` and the playground consumes them through the same package boundary a real app would use. The Vite host config also allows the `tvmini` host header to match the local setup used in sibling repos.

The repo now verifies itself with:
- ESLint
- Vitest component tests
- a built example consumer app under `apps/playground`
- internal consumer fixtures for plain CSS and utility-class usage
- a built-package smoke test against `runtime/node/tv-shared-runtime/dist`

Local hooks are also configured:
- `pre-commit`: `lint-staged`
- `pre-push`: check the upstream branch, run `npm run verify`, then check upstream again

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
    uses: taylorvance/tv-shared/.github/workflows/deploy-pages.yml@main
    with:
      node-version: '20'
      working-directory: .
      install-command: npm ci
      lint-command: npm run lint
      test-command: npm test -- --run
      build-command: npm run build
      artifact-path: dist
```

Example copyable wrapper file:

```text
docs/examples/deploy.yml
```

## CI standard

Reusable CI workflow path:

```text
.github/workflows/verify.yml
```

The recommended consumer contract is documented in:
- `docs/consumer-standard.md`
- `docs/adoption-plan.md`
- `docs/release-strategy.md`

At a minimum, future consumers should converge on:
- `clean`
- `lint`
- `test`
- `build`
- `verify`

This repo also uses the standard itself via:

```text
.github/workflows/ci.yml
```

Example copyable wrapper file:

```text
docs/examples/ci.yml
```

## Node tooling

Reusable Node and TypeScript baselines live under `tooling/node/`.

Recommended consumer docs:
- `docs/consumer-standard.md`
- `tooling/node/examples/eslint.config.mjs`
- `tooling/node/examples/prettier.config.mjs`
- `tooling/node/examples/tsconfig.app.json`
- `tooling/node/examples/tsconfig.node.json`

## Release automation

Release automation is now handled with Changesets.

Key files:
- `.changeset/config.json`
- `.github/workflows/release.yml`
- `docs/release-strategy.md`

Key scripts:
- `npm run changeset`
- `npm run version-packages`
- `npm run release`

The release workflow:
- verifies the repo on every `main` push
- creates and pushes a version commit when pending changesets exist
- publishes changed packages in that same run using npm trusted publishing via GitHub OIDC

## Local hooks

This repo uses local hook automation through `simple-git-hooks`.

Current hook behavior:
- `pre-commit`: run `lint-staged`
- `pre-push`: fail if the branch is behind its upstream, run `npm run verify`, then fail again if the upstream moved during verification

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
