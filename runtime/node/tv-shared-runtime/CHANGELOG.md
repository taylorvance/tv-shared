# @taylorvance/tv-shared-runtime

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
