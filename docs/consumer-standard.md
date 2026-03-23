# Consumer Standard

This repo defines the shared contract for portfolio-project consumers.

## Gold standard

Each consumer repo should expose these scripts when practical:
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run verify`

Recommended behavior:
- `build` must include any preprocess step the app needs.
- `test` must be non-watch in CI. If the repo keeps `vitest` in watch mode locally, the workflow should pass an explicit CI-safe command such as `npm test -- --run`.
- `verify` should be the full local quality gate: lint, test, then build.

Suggested shape:

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest --run",
    "build": "tsc -b && vite build",
    "verify": "npm run lint && npm run test && npm run build"
  }
}
```

## Shared config packages

Consumers should standardize on the shared config package from this repo:
- `@taylorvance/tv-shared-config`

Install it from npm in consumer repos:

```json
{
  "devDependencies": {
    "@taylorvance/tv-shared-config": "^0.1.0"
  }
}
```

Recommended ESLint setup for Vite + React apps:

```js
import defineReactAppConfig from '@taylorvance/tv-shared-config/eslint/react-app'

export default defineReactAppConfig()
```

Recommended TypeScript setup:

```json
{
  "extends": "@taylorvance/tv-shared-config/tsconfig/react-app.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Recommended Prettier setup:

```js
import prettierConfig from '@taylorvance/tv-shared-config/prettier'

export default prettierConfig
```

```json
{
  "extends": "@taylorvance/tv-shared-config/tsconfig/vite-node.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
```

Consumer-owned settings should stay local:
- `baseUrl`
- `paths`
- test globals and other repo-specific `types`
- generated-file ignores such as `public/generated/**`
- niche compiler flags that only one app needs

Copyable examples live in:
- `docs/examples/eslint.config.mjs`
- `docs/examples/prettier.config.mjs`
- `docs/examples/tsconfig.app.json`
- `docs/examples/tsconfig.node.json`

## Reusable workflows

Consumers should call these workflows from this repo:
- `tv-shared/.github/workflows/verify.yml`
- `tv-shared/.github/workflows/deploy-pages.yml`

Copyable examples live in:
- `docs/examples/ci.yml`
- `docs/examples/deploy.yml`

Example CI workflow:

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
    uses: ttvance/tv-shared/.github/workflows/verify.yml@main
    with:
      node-version: '20'
      working-directory: .
      install-command: npm ci
      lint-command: npm run lint
      test-command: npm run test -- --run
      build-command: npm run build
```

Example Pages workflow:

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
      test-command: npm run test -- --run
      build-command: npm run build
      artifact-path: dist
```

## Pre-commit standard

Hooks should stay local to each consumer repo. The shared contract is what they run, not the raw `.git/hooks` files.

Recommended setup:
- `pre-commit`: run `lint-staged`
- `pre-push`: optionally fail if the branch is behind its upstream, then run `npm run verify:push`

Recommended tools:
- `simple-git-hooks`
- `lint-staged`

Suggested package.json additions:

```json
{
  "scripts": {
    "verify": "npm run lint && npm run test && npm run build",
    "verify:push": "node scripts/pre-push-check.mjs && npm run verify",
    "prepare": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "pre-push": "npm run verify:push"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": "eslint --fix"
  }
}
```

This keeps hook ownership local while still converging on one quality gate across projects.

`tv-shared` itself now uses this exact pattern.
