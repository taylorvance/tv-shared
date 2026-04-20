# Roadmap

Status: active

This note tracks follow-up ideas worth keeping in-repo even when they are not active work.

## Web Package

Implemented now:

- brand primitives and raw asset exports
- project-scoped storage helpers
- persistent state, URL state, debug flags, hotkeys, shortcuts, snapshots, share, theme, and accessibility helpers

Still intentionally deferred:

- app shell or layout components
- broad UI-kit expansion
- state abstractions with only one consumer
- implicit storage migrations

## Dev Package

Implemented now:

- shared ESLint flat-config factory for React apps
- shared Prettier config
- shared TypeScript baselines for React apps and Vite-side Node config

Likely next additions:

- `doctor` command for repo audits
- `check` command for shared convention drift
- codemods for shared-package renames or API migrations
- init/adoption helpers for bootstrapping workflow wrappers and baseline config

Guardrails:

- keep it focused on consumer-repo development and verification
- do not move GitHub workflow YAML into the package
- do not turn it into a generic utilities bucket

## Workflow Layer

Implemented now:

- reusable CI verification workflow
- reusable GitHub Pages workflow
- Changesets-based release automation

Potential follow-up:

- package-manager selection beyond npm
- workspace-aware install/build wrappers for more complex consumer repos
