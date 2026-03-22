# Changesets

This repo uses Changesets for package versioning and release automation.

Typical local flow:

```bash
npm run changeset
npm run version-packages
npm run verify
```

The GitHub release workflow handles the normal main-branch automation:
- create or update a release PR when changesets are present
- publish `@tv-shared/ui` when the release PR lands and `NPM_TOKEN` is available
