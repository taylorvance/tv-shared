# Changesets

This repo uses Changesets for package versioning and release automation.

Typical local flow:

```bash
npm run changeset
npm run version-packages
npm run verify
```

The GitHub release workflow handles the normal main-branch automation:
- version the published runtime package when changesets are present
- publish from GitHub Actions using trusted publishing
