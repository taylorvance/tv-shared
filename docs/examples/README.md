# Example Consumer Wrappers

These files are copyable starting points for consumer repos.
The examples use the floating major release tag `@v1` for compatible workflow updates. Use an immutable release tag or commit SHA only when a consumer needs frozen behavior. Do not use `@main` for reusable workflows.

Recommended convention:
- keep consumer-facing workflow names simple: `ci.yml`, `deploy.yml`
- keep shared implementation logic in `tv-shared`
- only override inputs that differ per repo

The examples assume the consumer repo already exposes:
- `npm run clean`
- `npm run lint`
- `npm run test` or a CI-safe equivalent
- `npm run build`
