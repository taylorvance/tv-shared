# Release Strategy

## Current Recommendation

Treat `tv-shared` as the source of publishable shared packages and reusable workflows for the portfolio repos.

Published packages live under:

- `runtime/web`
- `dev/node`

Workflow logic lives under:

- `.github/workflows/*`

Because the consumers build independently in GitHub Actions, published packages are the default model for shared code.

## Release Automation

This repo uses Changesets for package release automation.

Relevant files:

- `.changeset/config.json`
- `.github/workflows/release.yml`

Relevant scripts:

- `npm run changeset`
- `npm run version-packages`
- `npm run release`

Workflow behavior:

- on `main`, verify the repo first
- if unreleased changesets exist, create and push a version commit directly to `main`
- then run `changeset publish` for any unpublished package versions in the repo

## Legacy Packages

The old package names should be deprecated after the new package names are published and adopted:

- `@taylorvance/tv-shared-runtime`
- `@taylorvance/tv-shared-ui`
- `@taylorvance/tv-shared-config`

New work should target:

- `@taylorvance/tv-shared-web`
- `@taylorvance/tv-shared-dev`

## Trusted Publishing

Use npm trusted publishing instead of a long-lived automation token.

Required npm-side configuration:

1. Use the package name under the `@taylorvance` npm scope.
2. On npm, open the package settings for that package.
3. In trusted publisher settings, add:
   - GitHub owner: `taylorvance`
   - Repository: `tv-shared`
   - Workflow file: `release.yml`
4. Save the trusted publisher.

Required GitHub-side configuration:

- keep `id-token: write` in the release workflow

Important implementation detail:

- npm trusted publishing currently requires Node `22.14.0+` and npm `11.5.1+`, which the release workflow installs explicitly
