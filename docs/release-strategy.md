# Release Strategy

## Current recommendation

Treat `tv-shared` as the source of publishable Node runtime packages for separate consumer repos.

Because the consumers build independently in GitHub Actions, published packages are the default model for shared code under `runtime/node/*`.

Use `file:` links only for short-lived local migration or debugging work, not as the long-term installation path.

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
- then run `changeset publish` for any unpublished package versions in the repo

Changeset rule for this repo:
- when a change affects any published package in `runtime/node/*`, add a Changeset in the same change unless the user explicitly says not to
- do not add Changesets for docs-only, workflow-only, or internal tooling changes that do not affect the published package

Release model for this repo:
- no manual release PR merge
- pushes to `main` remain the release trigger
- Changesets still define semver intent
- versioning and publish happen in one workflow run

## Trusted publishing setup

Use npm trusted publishing instead of a long-lived automation token.

Required npm-side configuration:
1. Use the package name under the `@taylorvance` npm user scope.
2. On npm, open the package settings for that package.
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

## One checklist

Use [`docs/package-checklist.md`](./package-checklist.md) as the single checklist for creating and publishing future packages in this repo.

## Workflow guidance

Until then:
- keep `tv-shared` backwards-conscious
- document shared API changes in `README.md`
- update fixture consumers and tests before touching real consumer repos
