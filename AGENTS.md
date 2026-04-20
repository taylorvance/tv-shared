# AGENTS.md

## Repo purpose
This repo owns shared web runtime code, shared dev-time conventions, and reusable GitHub workflow logic for Taylor Vance portfolio projects.

It is not an app. It is a dependency source for sibling repos such as:
- `../tvprograms`
- `../mcts-web`
- `../wordlink`

## Working rules
- Inspect the consumer repos before changing shared APIs.
- Favor extraction of small, stable primitives over broad abstractions.
- Keep shared UI framework-light and CSS-agnostic.
- Prefer props and composition over app-specific styling assumptions.
- Do not move app-specific business logic here unless at least two projects already share it.
- Prefer reusable workflows with `workflow_call` for CI/CD pipelines.
- Prefer official GitHub Pages actions over third-party deploy actions unless a concrete gap exists.

## Initial priorities
1. Keep one shared web package for reusable app code.
2. Keep one shared dev package for reusable Node-side repo conventions.
3. Keep reusable GitHub Pages and verify workflows in `.github/workflows`.
4. Document consumer usage in the README whenever shared APIs change.

## Extraction guidance
- Treat `mcts-web` and `wordlink` as the first concrete consumers.
- The duplicated `BrandBadge` is the first extraction target.
- The shared badge should work in both Tailwind-based and plain-CSS apps.
- Avoid locking the package to one visual treatment; provide sensible defaults and allow consumer overrides.

## Publishing guidance
- Assume the shared packages may be published independently from the apps.
- Keep package boundaries clean so versioning and semver are straightforward.
- Do not make consumer repos depend on `tvprograms` directly for shared assets or components.
- When a change affects a published package such as `@taylorvance/tv-shared-web` or `@taylorvance/tv-shared-dev`, create a Changeset in the same change unless the user explicitly says not to.
- Do not create Changesets for docs-only, workflow-only, or internal tooling changes that do not affect the published package.

## Session startup checklist
1. Inspect the current state of `../tvprograms`, `../mcts-web`, and `../wordlink`.
2. Confirm what is duplicated versus only similar.
3. Extract only the pieces with real shared value.
4. Keep README examples current with the actual exported API.
