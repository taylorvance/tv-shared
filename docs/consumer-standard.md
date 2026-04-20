# Consumer Standard

This repo defines the shared contract for Taylor Vance portfolio-project consumers.

## Scripts

Each consumer should expose these scripts when practical:

- `npm run clean`
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run verify`

Recommended behavior:

- `clean` removes installs, build artifacts, caches, and other reproducible generated files
- `dev` is the default local entrypoint
- `build` includes any preprocess step the app needs
- `test` is non-watch in CI
- `verify` is the local quality gate: lint, test, then build

Suggested shape:

```json
{
  "scripts": {
    "clean": "rm -rf node_modules dist coverage .vite .eslintcache *.tsbuildinfo",
    "dev": "vite --host",
    "lint": "eslint .",
    "test": "vitest --run",
    "build": "tsc -b && vite build",
    "verify": "npm run lint && npm run test && npm run build"
  }
}
```

## Shared Dev Package

Consumers should prefer `@taylorvance/tv-shared-dev` for shared Node-side conventions.

### ESLint

```js
import defineReactAppConfig from '@taylorvance/tv-shared-dev/eslint/react-app';

export default [
  ...defineReactAppConfig({
    extraIgnores: ['public/generated/**'],
  }),
  {
    files: ['src/games/Onitama/Board.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
```

### Prettier

```js
import { prettierConfig } from '@taylorvance/tv-shared-dev';

export default prettierConfig;
```

### TypeScript

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

Settings that should stay local:

- `baseUrl`
- `paths`
- repo-specific generated directories
- test globals unique to one app
- niche compiler flags or rule exceptions that are not actually shared

## Shared Web Package

Consumers should use `@taylorvance/tv-shared-web` for shared app-facing code.

Current common uses:

- `BrandBadge`
- `TvProgramsMark` / `TvProgramsWordmark`
- `createProjectStorage()`
- `usePersistentState()`
- `useUrlState()`
- `useHotkeys()`

Example:

```tsx
import { BrandBadge, createProjectStorage } from '@taylorvance/tv-shared-web';

const storage = createProjectStorage('mcts-web', { version: 1 });

export function Footer() {
  return <BrandBadge />;
}
```

## Reusable Workflows

Consumers should call these workflows from this repo:

- `tv-shared/.github/workflows/verify.yml`
- `tv-shared/.github/workflows/deploy-pages.yml`

Copyable wrappers live in `docs/examples/`.

CI example:

```yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  verify:
    uses: taylorvance/tv-shared/.github/workflows/verify.yml@main
    with:
      node-version: '22'
      working-directory: .
      install-command: npm ci
      lint-command: npm run lint
      test-command: npm run test
      build-command: npm run build
```

Deploy example:

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
      node-version: '22'
      working-directory: .
      install-command: npm ci
      lint-command: npm run lint
      test-command: npm run test
      build-command: npm run build
      artifact-path: dist
```
