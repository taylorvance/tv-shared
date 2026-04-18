# Adoption Plan

## Goal

Make `tv-shared` the source of truth for:
- reusable runtime primitives
- reusable GitHub workflows
- consumer quality standards

## Near-term plan

1. Keep shared APIs small and real.
   Start with `BrandBadge`, `TvProgramsMark`, shared logo assets, and reusable workflows.

2. Normalize consumer scripts.
   Every consumer should converge on `clean`, `lint`, `test`, `build`, and `verify`.

3. Replace per-repo CI and deploy YAML with `workflow_call` wrappers.
   Consumers should keep thin repo-local workflow files that call `tv-shared`.

4. Add local hooks only after script conventions are stable.
   Hooks should call `verify` rather than duplicating command lists.

## Legacy package direction

`@taylorvance/tv-shared-runtime` is now the intended runtime replacement for the old `@taylorvance/tv-shared-ui` badge/logo surface.

That does **not** have to mean immediate breakage or removal. The practical meaning is:
- stop adding new consumers to `@taylorvance/tv-shared-ui`
- migrate existing `BrandBadge` usage to `@taylorvance/tv-shared-runtime`
- keep the old package stable until consumers are moved
- treat it as the moved-from path

`@taylorvance/tv-shared-config` is frozen for now, not fully deprecated. The current preferred direction is:
- new repos should copy and adapt baselines from `tooling/<stack>/`
- existing consumers may keep using `@taylorvance/tv-shared-config` until they are migrated
- no new work is planned in the config package right now
- the shared-config approach can be revisited later if the copy-and-adapt model proves too messy

## Current consumer targets

### `tvprograms`

Refactor targets:
- replace inline header mark with `TvProgramsMark`, `TvProgramsWordmark`, or the shared raw asset
- replace the repo-local deploy workflow with `deploy-pages.yml`
- add CI via `verify.yml`
- add `test` and `verify` scripts so the repo matches the shared consumer contract

### `mcts-web`

Refactor targets:
- replace `@taylorvance/tv-shared-ui` imports with `@taylorvance/tv-shared-runtime`
- replace `src/utils/persistence.ts` with `createProjectStorage()` and the newer state helpers where appropriate
- keep the shared CI and deploy workflow wrappers
- migrate off `@taylorvance/tv-shared-config` when you want the repo on the current tooling-dir model

### `wordlink`

Refactor targets:
- replace `@taylorvance/tv-shared-ui` imports with `@taylorvance/tv-shared-runtime`
- consider moving theme persistence onto `createProjectStorage()` and `useThemePreference()`
- keep the shared workflow wrappers
- migrate off `@taylorvance/tv-shared-config` when you want the repo on the current tooling-dir model

### `bog`

Refactor targets:
- replace `@taylorvance/tv-shared-ui` imports with `@taylorvance/tv-shared-runtime`
- keep the shared workflow wrappers
- update to the newer runtime helpers after release if the repo starts using persisted state or shortcuts

### `traingame`

Refactor targets:
- replace `@taylorvance/tv-shared-ui` imports with `@taylorvance/tv-shared-runtime`
- consider the snapshot/share helpers for replayable seeds or copied runs
- keep the shared workflow wrappers

### `dice`

Role:
- use as the reference consumer for the current workflow and runtime contract
- update to the latest runtime patch after release, but no structural migration looks urgent today

### Lower-priority or conditional repos

`timers`:
- not a strong badge or Pages-workflow target today
- could benefit from storage/state helpers later, but the repo’s workspace shape means workflow reuse needs broader workspace support first

`yajilin`:
- a candidate for the shared consumer script contract if it becomes an actively deployed portfolio app
- blocked on package-manager/workflow support because the current shared workflow layer is npm-oriented

## Migration principle

Prefer thin consumer wrappers over direct copy-paste:
- consumer repos keep only repo-specific triggers and inputs
- `tv-shared` owns the actual workflow logic
- consumer repos own their local hooks because Git hooks are inherently repo-local

## Exit criteria

This standard is established once:
- all primary consumer apps call shared CI and deploy workflows where applicable
- duplicated `BrandBadge` implementations are removed or replaced with runtime imports
- the TV mark stops being maintained in multiple forms without an explicit reason
- each consumer has a stable `verify` script that local hooks and CI can both call
