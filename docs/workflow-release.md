# Workflow Release Policy

Reusable GitHub Actions workflows are released with repo-level git tags, separate from npm package releases.

Consumers should normally reference the floating major tag:

```yml
uses: taylorvance/tv-shared/.github/workflows/verify.yml@v1
```

Use an immutable `vX.Y.Z` tag or commit SHA only when a consumer needs frozen workflow behavior.

## Current v1 Compatibility

`v1.1.0` adds compatible npm/pnpm package-manager support:

- package-manager detection is on by default
- `pnpm-lock.yaml` selects pnpm
- `package-lock.json` or `npm-shrinkwrap.json` selects npm
- omitted `install-command` runs `npm ci` for npm or `pnpm install --frozen-lockfile` for pnpm
- existing npm consumers can keep their current inputs, including `install-command: npm ci`
- `package-manager`, `install-command`, and `pnpm-version` are available as overrides

## Versioning

Use semantic versioning for reusable workflow behavior:

- Patch: compatible bug fixes, safer validation, documentation-only corrections.
- Minor: new optional inputs, new supported package-manager paths, compatible action upgrades.
- Major: removed inputs, changed default commands, changed required permissions, changed artifact conventions, or any change expected to break an existing consumer.

Never move a floating major tag, such as `v1`, across a breaking change. Create the next major tag instead.

## Releasing

Workflow release tags are not managed by Changesets. Changesets owns npm package versions; workflow releases own reusable workflow refs.

Dry-run the workflow release plan:

```sh
npm run release:workflows -- v1.1.0
```

Create local release tags after verification:

```sh
npm run release:workflows -- v1.1.0 --execute
```

Create and push the tags:

```sh
npm run release:workflows -- v1.1.0 --execute --push
```

The script creates an immutable annotated tag, such as `v1.1.0`, and updates the matching floating major tag, such as `v1`.
