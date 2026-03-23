# `@taylorvance/tv-shared-config`

Shared ESLint, Prettier, and TypeScript config presets for Taylor Vance portfolio projects.

## Exports

- `@taylorvance/tv-shared-config/eslint/base`
- `@taylorvance/tv-shared-config/eslint/react-app`
- `@taylorvance/tv-shared-config/prettier`
- `@taylorvance/tv-shared-config/tsconfig/react-app.json`
- `@taylorvance/tv-shared-config/tsconfig/vite-node.json`

## ESLint

Use the React preset for Vite + React + TypeScript consumers:

```js
import defineReactAppConfig from '@taylorvance/tv-shared-config/eslint/react-app'

export default defineReactAppConfig()
```

With consumer-specific ignores:

```js
import defineReactAppConfig from '@taylorvance/tv-shared-config/eslint/react-app'

export default defineReactAppConfig({
  ignores: ['public/generated/**'],
})
```

Use the base preset for non-React tooling packages:

```js
import defineBaseConfig from '@taylorvance/tv-shared-config/eslint/base'

export default defineBaseConfig({
  includeBrowserGlobals: false,
})
```

## Prettier

Use the shared Prettier baseline:

```js
import prettierConfig from '@taylorvance/tv-shared-config/prettier'

export default prettierConfig
```

## TypeScript

Use the React app base for Vite source code:

```json
{
  "extends": "@taylorvance/tv-shared-config/tsconfig/react-app.json",
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Use the Node-side base for Vite config and scripts:

```json
{
  "extends": "@taylorvance/tv-shared-config/tsconfig/vite-node.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
```

## Notes

- The package standardizes the broad baseline only.
- Consumers should keep repo-specific rules, path aliases, test globals, generated-file ignores, and niche compiler flags local.
