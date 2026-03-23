# Release Strategy

## Current recommendation

Treat `tv-shared` as a versioned shared source repo now, even if the first consumers start by linking it locally.

Near-term options, in order of practicality:

1. Local workspace or file-link adoption while APIs are still settling.
2. Git-based dependency adoption once the package shape is stable across multiple repos.
3. Registry publishing only after semver boundaries are clear and changes need independent rollout cadence.

## Why not publish immediately

This repo is still establishing:
- the first real shared UI API surface
- the reusable workflow contract
- the consumer script standard

Publishing too early creates versioning pressure before the boundaries are proven.

## What should happen before registry publishing

- at least two consumer repos should use `@taylorvance/tv-shared-ui`
- the package exports should stop changing every session
- the consumer installation story should be routine
- release notes should matter because changes are no longer obvious from local context

## Release automation

This repo now uses Changesets for package release automation.

Relevant files:
- `.changeset/config.json`
- `.github/workflows/release.yml`

Relevant scripts:
- `npm run changeset`
- `npm run version-packages`
- `npm run release`

Release authentication model:
- GitHub Actions OIDC trusted publishing
- no long-lived `NPM_TOKEN` secret required for publish

Workflow behavior:
- on `main`, verify the repo first
- if unreleased changesets exist, create and push a version commit directly to `main`
- if the current package version is not yet on npm, publish it in that same release run
- if the current package version is already on npm and no changesets remain, do nothing

Changeset rule for this repo:
- when a change affects the published package `@taylorvance/tv-shared-ui`, add a Changeset in the same change unless the user explicitly says not to
- do not add Changesets for docs-only, workflow-only, or internal tooling changes that do not affect the published package

Release model for this repo:
- no manual release PR merge
- pushes to `main` remain the release trigger
- Changesets still define semver intent
- versioning and publish happen in one workflow run

## Trusted publishing setup

Use npm trusted publishing instead of a long-lived automation token.

Required npm-side configuration:
1. Use the package name `@taylorvance/tv-shared-ui` under the existing `@taylorvance` npm user scope.
2. On npm, open the package settings for `@taylorvance/tv-shared-ui`.
3. In the trusted publisher section, add a GitHub Actions trusted publisher.
4. Use these exact values:
   - GitHub owner: `taylorvance`
   - Repository: `tv-shared`
   - Workflow file: `release.yml`
   - Environment: leave empty unless you later add a required GitHub environment to publishing
5. Save the trusted publisher.

Required GitHub-side configuration:
- none for npm credentials
- the workflow already requests `id-token: write`

Important implementation detail:
- npm trusted publishing currently requires Node `22.14.0+` and npm `11.5.1+`, which the release workflow now installs explicitly

## Workflow guidance

Until then:
- keep `tv-shared` backwards-conscious
- document shared API changes in `README.md`
- update fixture consumers and tests before touching real consumer repos
