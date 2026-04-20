import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export function defineReactAppConfig(options = {}) {
  const {
    extraIgnores = [],
  } = options;

  return tseslint.config(
    {
      ignores: ['dist/**', ...extraIgnores],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: ['src/**/*.{ts,tsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
        },
      },
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        ...reactHooks.configs.flat.recommended.rules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'no-undef': 'off',
      },
    },
  );
}

export default defineReactAppConfig;
