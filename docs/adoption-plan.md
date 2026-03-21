# Adoption Plan

## Goal

Make `tv-shared` the source of truth for:
- reusable UI primitives
- reusable GitHub workflows
- consumer quality standards

## Near-term plan

1. Keep shared APIs small and real.
   Start with `BrandBadge`, `TvProgramsMark`, shared logo assets, and reusable workflows.

2. Normalize consumer scripts.
   Every consumer should converge on `lint`, `test`, `build`, and `verify`.

3. Replace per-repo CI and deploy YAML with `workflow_call` wrappers.
   Consumers should keep thin repo-local workflow files that call `tv-shared`.

4. Add local hooks only after script conventions are stable.
   Hooks should call `verify` rather than duplicating command lists.

## Current consumer targets

### `tvprograms`

Refactor targets:
- replace inline header mark with `TvProgramsMark` or the shared raw asset
- replace repo-local deploy workflow with `pages-deploy.yml`
- add CI workflow using `ci-verify.yml`
- add a `verify` script

### `mcts-web`

Refactor targets:
- replace local `BrandBadge` with `@tv-shared/ui`
- replace custom CI YAML with `ci-verify.yml`
- replace third-party Pages deploy action with `pages-deploy.yml`
- consider adding `verify` as the canonical local gate

### `wordlink`

Refactor targets:
- replace local `BrandBadge` with `@tv-shared/ui`
- replace repo-local deploy YAML with `pages-deploy.yml`
- add CI workflow using `ci-verify.yml`
- add `verify` and local hook setup once command conventions are settled

## Migration principle

Prefer thin consumer wrappers over direct copy-paste:
- consumer repos keep only repo-specific triggers and inputs
- `tv-shared` owns the actual workflow logic
- consumer repos own their local hooks because Git hooks are inherently repo-local

## Exit criteria

This standard is established once:
- all three current consumers call shared CI and deploy workflows
- duplicated `BrandBadge` implementations are removed
- the TV mark stops being maintained in multiple forms without an explicit reason
- each consumer has a stable `verify` script that local hooks and CI can both call
