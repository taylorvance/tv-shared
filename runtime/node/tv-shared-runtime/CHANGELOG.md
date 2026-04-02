# @taylorvance/tv-shared-runtime

## 0.6.0

### Minor Changes

- e79599e: Add a generic `useKeySequence` hook for hidden multi-key sequences.

## 0.5.0

### Minor Changes

- 95ba031: Add shared hotkey hooks with optional element scoping and a built-in Konami listener.

## 0.4.0

### Minor Changes

- bde6dc2: Add shared project-scoped browser storage utilities with safe localStorage access, namespace inspection/reset helpers, a dev inspector UI, and namespace JSON import/export tools.

## 0.3.0

### Minor Changes

- 8da67a8: Establish the new runtime and tooling architecture by publishing the shared React/browser package from `runtime/node/tv-shared-runtime`, renaming the runtime package to `@taylorvance/tv-shared-runtime`, and aligning repo docs and workflows to the new layout.

## 0.2.0

### Minor Changes

- f77e8aa: Remove raw asset URL helpers from the package root export and expose them from the explicit `./assets` subpath. Add an explicit `./BrandBadge` subpath export for consumers that want a component-only entry.

## 0.1.4

### Patch Changes

- ffc3622: Fix the default TV Programs mark size so `BrandBadge` stays usable in unstyled mode.

## 0.1.3

### Patch Changes

- 15f28a5: Fix package export metadata so Vite-based consumers can resolve the package correctly during development.

## 0.1.2

### Patch Changes

- 34a849a: Add repository metadata required for npm trusted publishing provenance.

## 0.1.1

### Patch Changes

- 0739a46: Fix the shared TV Programs mark rendering and make brand badge icons inherit text color for dark mode.
