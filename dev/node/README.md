# `@taylorvance/tv-shared-dev`

Shared dev-time config and tooling helpers for Taylor Vance web projects.

This package owns the reusable Node-side convention surface: ESLint, Prettier, and TypeScript baselines. It is intentionally narrower than a generic toolbox, but broad enough to grow into checks, doctors, codemods, and other non-runtime repo helpers later.

## Public API

- root exports: `defineReactAppConfig`, `prettierConfig`
- ESLint subpath: `@taylorvance/tv-shared-dev/eslint/react-app`
- Prettier subpath: `@taylorvance/tv-shared-dev/prettier`
- TypeScript subpaths:
  - `@taylorvance/tv-shared-dev/tsconfig/react-app.json`
  - `@taylorvance/tv-shared-dev/tsconfig/vite-node.json`

## ESLint

```js
import defineReactAppConfig from '@taylorvance/tv-shared-dev/eslint/react-app';

export default [
  ...defineReactAppConfig({
    extraIgnores: ['public/generated/**'],
  }),
];
```

`defineReactAppConfig()` returns a flat-config array for Vite-style React apps and accepts:

- `extraIgnores`: extra glob patterns in addition to the default `dist/**`

Repo-specific overrides should stay local:

- special-case rule exceptions
- non-standard source globs
- generated directories unique to one repo

## Prettier

```js
import { prettierConfig } from '@taylorvance/tv-shared-dev';

export default prettierConfig;
```

## TypeScript

App config:

```json
{
  "extends": "@taylorvance/tv-shared-dev/tsconfig/react-app.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"]
}
```

Node-side Vite config:

```json
{
  "extends": "@taylorvance/tv-shared-dev/tsconfig/vite-node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
```
