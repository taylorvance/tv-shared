# Roadmap

Status: active

This note tracks follow-up ideas that are worth keeping in-repo even when they are not active work yet.

Add new sections here as shared runtime, tooling, workflow, or consumer-alignment ideas accumulate.

## Runtime utility layer

Implemented now:
- `usePersistentState()` on top of `createProjectStorage()`
- `useUrlState()` for query-param and hash-param state
- `useDebugFlag()` for storage-backed flags with optional URL overrides
- `useShortcutRegistry()` plus `ShortcutPanel` for visible shortcut help while still allowing hidden bindings
- snapshot, clipboard/share, theme, and lightweight accessibility helpers
- `TvProgramsWordmark` as the next brand primitive after `BrandBadge` and `TvProgramsMark`

Still intentionally deferred:
- implicit storage migrations
- app-shell layout components
- broad UI-kit expansion
- higher-level state abstractions that only one consumer uses

## Storage

### Current scope

Implemented now:
- versioned project key generation through `createProjectStorage`
- safe string and JSON read/write helpers
- namespace-scoped `list()` and `clear()`
- namespace JSON import/export in the dev tooling layer
- opt-in dev inspector UI through `@taylorvance/tv-shared-runtime/storage-dev`

Intentionally not implemented in the core helper:
- app-state abstractions
- automatic schema migrations
- automatic rollback or down-migration behavior

### Import and export

Current direction:
- keep it in the dev tooling layer, not in the core storage helper
- prefer copy/paste JSON before file download/upload flows
- export one namespace at a time
- allow explicit merge or replace imports into the currently selected namespace

Export shape:

```json
{
  "projectKey": "mcts-web",
  "version": 1,
  "entries": [
    {
      "keyParts": ["app"],
      "relativeKey": "app",
      "rawValue": "{\"selectedGame\":\"Onitama\"}"
    }
  ]
}
```

Reasons to prefer raw string values:
- preserves exact stored contents
- avoids breaking on mixed JSON and non-JSON values
- keeps import/export lossless
- lets the inspector continue to act as a low-level debug tool

Guardrails:
- validate `projectKey`, `version`, and `entries`
- keep the target namespace explicit
- do not silently rewrite between versions

### Migrations

Deferred for now.

If we add them later, prefer a separate migration runner owned by the consumer app rather than implicit behavior inside `createProjectStorage`.

Recommended direction:
- support upward migrations first
- store migration state explicitly
- keep each step idempotent
- avoid automatic down migrations in production code

### Dev inspector quality-of-life

Potential additions:
- parse-and-preview JSON when the raw value is valid JSON
- copy one key in addition to full-namespace export
- duplicate one namespace into another version for local testing
- filter keys by prefix text

## Notes

Keep the shared storage layer split in two:
- core runtime: namespacing, safe IO, enumeration, and clear operations
- dev tooling: inspection, editing, copy/paste, and experiments

That split keeps consumer production bundles small and avoids pretending that app-specific persistence models are shared when they are not.

## Consumer adoption tooling

Implemented now:
- temporary adoption checklist in `docs/tmp-consumer-adoption-todo.md`
- `npm run doctor:consumers` for a read-only sibling-repo audit

Potential follow-up:
- include nested source-file scanning in the doctor if imports spread beyond top-level entry files
- add package-manager/workspace awareness before claiming broader workflow adoption support
