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

- at least two consumer repos should use `@tv-shared/ui`
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

Required GitHub secret for publish:
- `NPM_TOKEN`

Workflow behavior:
- on `main`, verify the repo first
- if unreleased changesets exist, create or update a version PR
- after the version PR lands, publish `@tv-shared/ui` to npm

## Workflow guidance

Until then:
- keep `tv-shared` backwards-conscious
- document shared API changes in `README.md`
- update fixture consumers and tests before touching real consumer repos
