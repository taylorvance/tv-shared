import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const DEFAULT_IGNORES = ['dist/**', 'coverage/**', 'node_modules/**'];

function buildGlobals({
  includeBrowserGlobals = true,
  includeNodeGlobals = true,
  extraGlobals = {},
} = {}) {
  return {
    ...(includeBrowserGlobals ? globals.browser : {}),
    ...(includeNodeGlobals ? globals.node : {}),
    ...extraGlobals,
  };
}

export function defineBaseConfig({
  ignores = [],
  includeBrowserGlobals = true,
  includeNodeGlobals = true,
  extraGlobals = {},
  scriptFiles = ['scripts/**/*.{js,mjs,cjs,ts,mts,cts}'],
} = {}) {
  const sharedGlobals = buildGlobals({
    includeBrowserGlobals,
    includeNodeGlobals,
    extraGlobals,
  });

  return tseslint
    .config(
      {
        ignores: [...DEFAULT_IGNORES, ...ignores],
      },
      js.configs.recommended,
      ...tseslint.configs.recommended,
      {
        files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
          globals: sharedGlobals,
        },
        rules: {
          'no-undef': 'off',
        },
      },
      scriptFiles.length > 0
        ? {
            files: scriptFiles,
            languageOptions: {
              ecmaVersion: 'latest',
              sourceType: 'module',
              globals: buildGlobals({
                includeBrowserGlobals: false,
                includeNodeGlobals: true,
              }),
            },
          }
        : undefined,
    )
    .filter(Boolean);
}

export default defineBaseConfig;
