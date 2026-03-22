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

## Reusable workflows

Consumers should call these workflows from this repo:
- `tv-shared/.github/workflows/verify.yml`
- `tv-shared/.github/workflows/deploy-pages.yml`

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
- `pre-push`: run `npm run verify`

Recommended tools:
- `simple-git-hooks`
- `lint-staged`

Suggested package.json additions:

```json
{
  "scripts": {
    "verify": "npm run lint && npm run test && npm run build",
    "prepare": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "pre-push": "npm run verify"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": "eslint --fix"
  }
}
```

This keeps hook ownership local while still converging on one quality gate across projects.
