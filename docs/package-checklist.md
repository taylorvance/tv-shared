# Shared Package Checklist

Use this whenever you add a new published package in `tv-shared`.

## Default Policy

For this repo, shared packages are meant for cross-repo installs in independently built apps.

That means:

- new shared packages should be publishable
- local `file:` dependencies are acceptable for short migration work, not the long-term model
- npm trusted publishing is the default publish path

## What This Repo Owns

This repo owns three shared surfaces:

- published packages under `runtime/*` and `dev/*`
- reusable GitHub workflows under `.github/workflows`
- consumer documentation under `docs/`

Only the published packages need npm package setup.

## Package Creation Checklist

1. Create the package under the correct role/stack directory.
2. Add a `package.json` with:
   - `name`
   - `version`
   - `description`
   - `type`
   - `exports`
   - `files`
   - `publishConfig.access`
   - `repository.directory`
3. Add a `README.md` with:
   - the package purpose
   - the supported public API
   - one minimal consumer example
4. Add source files and any build config the package needs.
5. Add package-local scripts if the package needs a build step.
6. Update the root docs that describe available shared surfaces.
7. Add a Changeset in the same change when the package is meant to be published.

## Consumer Checklist

When a consumer adopts a published shared package:

1. Add the package from npm, not a sibling `file:` path, unless you are intentionally doing short-lived local migration work.
2. Update the consumer README or setup notes if the package changes the repo setup story.
3. Update `docs/consumer-standard.md` if the new package changes the shared repo contract.

## Changeset Rule

Add a Changeset whenever a change affects a published package unless the user explicitly says not to.

Do not add a Changeset for:

- docs-only changes
- workflow-only changes
- internal repo tooling that does not affect a published package

## Release Behavior

This repo's release workflow is package-agnostic:

- verify the repo
- version packages if Changesets exist
- commit and push version/changelog updates
- run `changeset publish`

That means a new shared package does not need its own bespoke release workflow.
