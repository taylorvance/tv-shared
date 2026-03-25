# Shared Package Checklist

Use this whenever you add a new published runtime package in `tv-shared`.

## Default policy

For this repo, shared packages are assumed to be intended for cross-repo installs in GitHub Actions and deployed apps.

That means:
- new shared packages should be designed as publishable packages
- local `file:` dependencies are fine for short migration work, but they are not the target distribution model
- npm trusted publishing is the default publish path

## What this repo owns

This repo owns three different shared surfaces:
- published Node runtime packages under `runtime/node/*`
- reusable GitHub workflows under `.github/workflows`
- consumer documentation under `docs/`

Only `runtime/node/*` need npm package setup.

## Package creation checklist

1. Create `runtime/node/<name>/`.
2. Add a `package.json` with:
   - `name`
   - `version`
   - `description`
   - `type`
   - `exports`
   - `files`
   - `publishConfig.access`
   - `repository.directory`
   - `peerDependencies` for tool/runtime packages the consumer must install
3. Add a `README.md` describing:
   - what the package is for
   - what it exports
   - one minimal consumer example
4. Add source files and any build config the package needs.
5. If the package needs a build step, add package-local scripts and make sure the root release flow still builds what must be published.
6. Update root docs that describe available packages.
7. Add a Changeset in the same change when the package is meant to be published.

## npm setup checklist

Do this once per published package on npmjs.com.

1. Confirm the package name and scope in `package.json`.
2. If npm already shows the package page, open:
   - `npmjs.com` -> your package -> `Settings`
3. In `Trusted publishing`, add a GitHub Actions trusted publisher with:
   - Organization or user: `taylorvance`
   - Repository: `tv-shared`
   - Workflow file: `release.yml`
   - Environment: leave empty unless the workflow later publishes through a protected GitHub environment
4. Save the trusted publisher.
5. Recommended after trusted publishing works:
   - `Settings` -> `Publishing access`
   - choose `Require two-factor authentication and disallow tokens`

Notes:
- Trusted publishing removes the need for a long-lived `NPM_TOKEN`.
- The release workflow must keep `id-token: write`.
- The workflow filename must match npm exactly, including `.yml`.
- If npm does not expose package settings until after the first publish, do the first publish from a trusted local session, then immediately add the trusted publisher so all later releases come from GitHub Actions.

## GitHub repo checklist

1. Keep `.github/workflows/release.yml` present at that exact path.
2. Keep workflow permissions including `id-token: write`.
3. Make sure branch protection on `main` does not block the release workflow from pushing its version commit, or change the release strategy before relying on automation.
4. Do not create per-package repositories; this monorepo is the source of truth.

## Consumer checklist

When a consumer adopts a published shared package:

1. Add the package from npm, not a sibling `file:` path, unless you are intentionally doing temporary local migration work.
2. Update the consumer README or setup notes if the package changes the installation story.
3. If the package affects shared scripts or config contracts, update `docs/consumer-standard.md`.

## Changeset rule

Add a Changeset whenever a change affects a published package unless the user explicitly says not to.

Do not add a Changeset for:
- docs-only changes
- workflow-only changes
- internal repo tooling that does not affect a published package

## Release behavior

This repo's release workflow is package-agnostic:
- verify the repo
- version packages if Changesets exist
- commit and push version/changelog updates
- run `changeset publish`

In practice, that means a new Node runtime package does not need its own bespoke release workflow.

## Official references

- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- npm package.json reference: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
