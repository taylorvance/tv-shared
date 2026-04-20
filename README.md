# tv-shared

Shared web runtime code, shared dev conventions, and reusable GitHub workflow logic for Taylor Vance portfolio projects.

> Personal infrastructure repo for Taylor Vance projects.
>
> This is not a public framework. It exists to keep portfolio apps aligned without making one app own the shared code for the others.

## Repo Model

This repo is organized by delivery surface, not by app:

- `runtime/web/`: published app-facing code
- `dev/node/`: published dev-time config and tooling helpers
- `.github/workflows/`: reusable GitHub Actions workflows
- `assets/`: canonical shared static assets used by the packages
- `apps/playground/`: local demo consumer for the shared web package

Current packages:

- [`@taylorvance/tv-shared-web`](./runtime/web/README.md)
- [`@taylorvance/tv-shared-dev`](./dev/node/README.md)

Legacy package names are no longer the preferred path:

- `@taylorvance/tv-shared-runtime`
- `@taylorvance/tv-shared-ui`
- `@taylorvance/tv-shared-config`

## `@taylorvance/tv-shared-web`

`@taylorvance/tv-shared-web` is the published app-facing package for shared browser and React primitives.

Current surface includes:

- brand primitives: `BrandBadge`, `TvProgramsMark`, `TvProgramsWordmark`
- shared branding constants and raw asset subpaths
- project-scoped storage and persistent state helpers
- URL state, debug flag, shortcut, snapshot, share, theme, and accessibility helpers

Example:

```tsx
import { BrandBadge, createProjectStorage, usePersistentState } from '@taylorvance/tv-shared-web';

const storage = createProjectStorage('wordlink', { version: 1 });

export function FooterNotes() {
  const [notes, setNotes] = usePersistentState(storage, ['footer', 'notes'], {
    defaultValue: '',
  });

  return (
    <>
      <BrandBadge />
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
    </>
  );
}
```

## `@taylorvance/tv-shared-dev`

`@taylorvance/tv-shared-dev` is the published dev-time package for shared Node-side repo conventions.

Current surface includes:

- `defineReactAppConfig()` for ESLint flat config
- `prettierConfig`
- shared TypeScript JSON baselines for React apps and Vite-side Node config

Example ESLint config:

```js
import defineReactAppConfig from '@taylorvance/tv-shared-dev/eslint/react-app';

export default [
  ...defineReactAppConfig({
    extraIgnores: ['public/generated/**'],
  }),
];
```

Example TypeScript config:

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

Repo-specific aliases, generated directories, and one-off rule exceptions should stay local to the consumer repo.

## Reusable Workflows

Consumers should keep thin repo-local workflow wrappers and call the shared workflow logic from this repo.

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

Pages example:

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

Copyable workflow wrappers also live in [`docs/examples/`](./docs/examples/README.md).

## Local Development

Useful scripts:

- `npm run dev`: rebuild `@taylorvance/tv-shared-web` and run the playground
- `npm run test`: run repo tests
- `npm run build`: build the shared web package
- `npm run test:dist`: smoke-test the shared packages as published surfaces
- `npm run doctor:consumers`: read-only audit of sibling consumer repos

The playground is a real local consumer app under `apps/playground`. It imports the web package through the same package boundary used by real apps.
Root `npm install` also builds `@taylorvance/tv-shared-web` so workspace consumers resolve the published entrypoints without a separate manual build step.

## Consumer Rules

The repo tries to enforce a strong long-term split:

- app-facing code belongs in `@taylorvance/tv-shared-web`
- dev-time conventions belong in `@taylorvance/tv-shared-dev`
- CI/CD logic belongs in `.github/workflows`

If something is not importable as a package or directly referenceable as a workflow, it should not be presented as the primary shared contract.
