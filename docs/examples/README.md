# Example Consumer Wrappers

These files are copyable starting points for consumer repos.
The examples use the floating major release tag `@v1` for compatible workflow updates. Use an immutable release tag or commit SHA only when a consumer needs frozen behavior. Do not use `@main` for reusable workflows.

Recommended convention:
- keep consumer-facing workflow names simple: `ci.yml`, `deploy.yml`
- keep shared implementation logic in `tv-shared`
- only set inputs that differ per repo

Package-manager behavior:
- `pnpm-lock.yaml` selects pnpm
- `package-lock.json` or `npm-shrinkwrap.json` selects npm
- default install is `npm ci` for npm and `pnpm install --frozen-lockfile` for pnpm

Do not set `package-manager` or `install-command` unless the repo needs custom behavior.
For pnpm consumers without a top-level `packageManager` field, set `pnpm-version` in the wrapper.

The examples assume the consumer repo already exposes:
- `npm run clean`
- `npm run lint`
- `npm run test` or a CI-safe equivalent
- `npm run build`

pnpm consumers can replace lint, test, and build commands with `pnpm` equivalents if preferred.
