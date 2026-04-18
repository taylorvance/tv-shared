# Temporary Consumer Adoption Todo

Status: working note

This is a temporary checklist for aligning actual consumer repos with the current `tv-shared` direction.

## Highest Priority

### `tvprograms`

- Add `test` and `verify` scripts so the repo matches the shared consumer contract.
- Replace the inline header SVG mark with `TvProgramsMark` or the shared raw asset subpath.
- Replace the repo-local Pages workflow with `taylorvance/tv-shared/.github/workflows/deploy-pages.yml`.
- Add a CI wrapper that calls `taylorvance/tv-shared/.github/workflows/verify.yml`.
- Consider adding `BrandBadge` in the footer if the site should consistently link back to the portfolio hub.

### `mcts-web`

- Remove `@taylorvance/tv-shared-ui` and switch `BrandBadge` imports to `@taylorvance/tv-shared-runtime`.
- Update `@taylorvance/tv-shared-runtime` from `^0.5.0` after the next release.
- Replace `src/utils/persistence.ts` with `createProjectStorage()` so app state and session keys share the same namespacing contract as other consumers.
- Decide whether the repo should keep the standalone `deploy` / `predeploy` scripts now that GitHub Pages deploys through the shared workflow.
- Decide whether this repo should migrate off `@taylorvance/tv-shared-config` in favor of copied tooling baselines, or whether that config package is still officially supported.

### `wordlink`

- Remove `@taylorvance/tv-shared-ui` and switch `BrandBadge` imports to `@taylorvance/tv-shared-runtime`.
- Add `@taylorvance/tv-shared-runtime` as a direct dependency instead of relying on the older UI package.
- Consider moving `src/lib/theme.ts` to `createProjectStorage()` for theme preference namespacing if shared-origin collisions matter locally.
- Decide whether this repo should migrate off `@taylorvance/tv-shared-config` in favor of copied tooling baselines, or whether that config package is still officially supported.

## Real Additional Consumers

### `bog`

- Remove `@taylorvance/tv-shared-ui` and switch `BrandBadge` imports to `@taylorvance/tv-shared-runtime`.
- Update `@taylorvance/tv-shared-runtime` from `^0.4.0` after the next release.
- Keep using shared Pages and CI workflows; those are already aligned.
- Decide whether this repo should migrate off `@taylorvance/tv-shared-config` in favor of copied tooling baselines.

### `traingame`

- Remove `@taylorvance/tv-shared-ui` and switch `BrandBadge` imports to `@taylorvance/tv-shared-runtime`.
- Update `@taylorvance/tv-shared-runtime` from `^0.4.0` after the next release.
- Keep using shared Pages and CI workflows; those are already aligned.
- Decide whether this repo should migrate off `@taylorvance/tv-shared-config` in favor of copied tooling baselines.

### `dice`

- Use as the reference consumer for current hook/workflow standards.
- Update to the latest runtime patch after release, but no structural adoption work looks urgent.

## Conditional Or Lower Priority

### `timers`

- Not a strong `BrandBadge` or Pages-workflow target right now.
- `createProjectStorage()` could help if browser persistence starts spreading beyond the current auth/session keys, but the current keys are already app-specific and the repo is a larger workspace with different deployment needs.
- If you want `timers` to adopt shared CI later, the workflow layer will need first-class workspace support rather than only the current single-lockfile npm-app shape.

### `yajilin`

- Could adopt the consumer script contract (`dev`, `lint`, `test`, `build`, `verify`) if it becomes an actively deployed portfolio app.
- Current shared workflows are npm-oriented, while `yajilin` is set up with `pnpm`, so workflow reuse is not drop-in yet.
- If you want broader adoption here, extend the workflow layer to support package-manager selection first.

## Shared Repo Follow-Ups

- Decide the fate of `@taylorvance/tv-shared-ui`. Right now it is still the path of least resistance for `BrandBadge` in four active repos, which undercuts the runtime package as the source of truth.
- Decide the fate of `@taylorvance/tv-shared-config`. The docs say “copy tooling baselines,” but several active repos still depend on the published config package.
- Expand the permanent adoption plan docs to include `bog`, `traingame`, and `dice`, since they are already real consumers.
- Consider whether the shared workflow layer should grow beyond npm so repos like `yajilin` are either clearly in scope or clearly out of scope.

## Idealog Notes

- `konami-code` is already effectively delivered by `tv-shared` through `useKeySequence` and `useKonami`; this should stay closed unless more real sequence-driven consumers appear.
- Future game ideas with saved selections or hidden debug sequences would be good candidates for the current hotkey/runtime layer, but not for expanding the API yet without a second concrete consumer.
