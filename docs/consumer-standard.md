# Consumer Standard

This repo defines the shared contract for portfolio-project consumers.

## Gold standard

Each consumer repo should expose these scripts when practical:
- `npm run clean`
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run verify`

Recommended behavior:
- `clean` should remove dependency installs, build artifacts, caches, and other reproducible generated files.
- `dev` should be the default local entrypoint. For Vite apps that need LAN or Tailscale access, prefer folding host binding into `dev` instead of maintaining a separate `dev:host`.
- `build` must include any preprocess step the app needs.
- `test` must be non-watch in CI. If the repo keeps `vitest` in watch mode locally, the workflow should pass an explicit CI-safe command such as `npm test -- --run`.
- `verify` should be the full local quality gate: lint, test, then build.

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

For workspace repos, prefer a root dispatcher plus package-local `clean` scripts:

```json
{
  "scripts": {
    "clean": "npm run clean:workspaces && npm run clean:root",
    "clean:root": "rm -rf node_modules coverage .turbo .vite .eslintcache *.tsbuildinfo",
    "clean:workspaces": "npm run clean --workspaces --if-present"
  }
}
```

## Node tooling baselines

Consumers should copy and adapt the Node tooling baselines from this repo rather than depending on a shared config package.

Recommended ESLint setup for Vite + React apps:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'off'
    }
  }
)
```

Recommended TypeScript setup:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Recommended Prettier setup:

```js
const prettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all'
}

export default prettierConfig
```

Recommended Node-side TypeScript setup:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
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
- `tooling/node/examples/eslint.config.mjs`
- `tooling/node/examples/prettier.config.mjs`
- `tooling/node/examples/tsconfig.app.json`
- `tooling/node/examples/tsconfig.node.json`

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
    uses: taylorvance/tv-shared/.github/workflows/verify.yml@main
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
    uses: taylorvance/tv-shared/.github/workflows/deploy-pages.yml@main
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
- `pre-push`: optionally fail if the branch is behind its upstream, run `npm run verify`, then fail again if the upstream moved during verification

Recommended tools:
- `simple-git-hooks`
- `lint-staged`

Suggested package.json additions:

```json
{
  "scripts": {
    "verify": "npm run lint && npm run test && npm run build",
    "verify:push": "node scripts/pre-push-check.mjs && npm run verify && node scripts/pre-push-check.mjs",
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

## Repo-level audit helper

From this repo, run `npm run doctor:consumers` to get a read-only adoption snapshot of sibling consumer repos:
- runtime package usage
- moved-from `tv-shared-ui` usage and frozen `tv-shared-config` usage
- `verify` script presence
- shared workflow wrapper usage

It is a maintenance aid for this repo only. It does not modify sibling repos.
