# Adoption Plan

## Goal

Make `tv-shared` the source of truth for:

- shared web runtime primitives
- shared dev-time repo conventions
- reusable GitHub workflows

## Current Shared Surfaces

- `@taylorvance/tv-shared-web`
- `@taylorvance/tv-shared-dev`
- `taylorvance/tv-shared/.github/workflows/*`

Legacy package names should be treated as moved-from paths:

- `@taylorvance/tv-shared-runtime`
- `@taylorvance/tv-shared-ui`
- `@taylorvance/tv-shared-config`

## Consumer Direction

### `tvprograms`

- adopt shared CI and Pages workflow wrappers
- align lint/test/build/verify script contract
- use shared web primitives when the duplicated logo surface is touched next

### `mcts-web`

- use `@taylorvance/tv-shared-web` for brand and runtime helpers
- use `@taylorvance/tv-shared-dev` for ESLint, Prettier, and TypeScript baselines
- keep repo-specific persistence and rule exceptions local where they are truly app-specific

### `wordlink`

- use `@taylorvance/tv-shared-web` for brand and future runtime helpers
- use `@taylorvance/tv-shared-dev` for shared dev-time config
- keep app-owned theme and gameplay behavior local unless a second consumer appears

### `bog`

- use `@taylorvance/tv-shared-web` for brand and storage helpers
- use `@taylorvance/tv-shared-dev` for shared dev-time config

### `traingame`

- use `@taylorvance/tv-shared-web` for brand and storage helpers
- use `@taylorvance/tv-shared-dev` for shared dev-time config

### `dice`

- keep using `@taylorvance/tv-shared-web` for storage helpers
- migrate local ESLint and TypeScript config onto `@taylorvance/tv-shared-dev`

## Migration Principle

Keep the split sharp:

- app-facing imports come from `web`
- dev-time config and repo helpers come from `dev`
- workflow logic stays in reusable workflow files, not npm packages

That boundary is the convention. Anything outside it is incidental.
