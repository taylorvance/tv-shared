# Temporary Consumer Adoption Todo

Status: active working note

This is the short list to finish after the package/layout migration:

## Publish And Cleanup

- Publish `@taylorvance/tv-shared-web`.
- Publish `@taylorvance/tv-shared-dev`.
- Deprecate `@taylorvance/tv-shared-runtime`.
- Deprecate `@taylorvance/tv-shared-ui`.
- Deprecate `@taylorvance/tv-shared-config`.

## Consumer Follow-Up

- Verify every migrated consumer against the published package names, not just local source edits.
- Remove any remaining legacy-package references from READMEs and setup notes.
- Decide whether `tvprograms` should adopt shared web primitives immediately or only when its duplicated logo surface changes next.
