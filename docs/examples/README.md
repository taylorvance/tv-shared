# Example Consumer Wrappers

These files are copyable starting points for consumer repos.

Recommended convention:
- keep consumer-facing workflow names simple: `ci.yml`, `deploy.yml`
- keep shared implementation logic in `tv-shared`
- only override inputs that differ per repo

The examples assume the consumer repo already exposes:
- `npm run lint`
- `npm run test` or a CI-safe equivalent
- `npm run build`
