# Tooling

This directory is the source-of-truth home for reusable tooling assets that are not shared through GitHub's workflow mechanism.

Current structure:

- `node/`: Node and TypeScript tooling assets and examples

Use delivery mechanisms that match the tool:

- GitHub Actions workflows belong in `.github/workflows/`
- runtime app code belongs in a published package
- tool config can be copied, wrapped by a package, or both
