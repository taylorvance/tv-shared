import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineBaseConfig } from './base.mjs';

export function defineReactAppConfig({
  enableReactRefresh = true,
  ...baseOptions
} = {}) {
  return [
    ...defineBaseConfig(baseOptions),
    {
      files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
      plugins: {
        'react-hooks': reactHooks,
      },
      rules: {
        ...reactHooks.configs.flat.recommended.rules,
      },
    },
    enableReactRefresh
      ? {
          files: ['**/*.{jsx,tsx}'],
          plugins: {
            'react-refresh': reactRefresh,
          },
          rules: {
            'react-refresh/only-export-components': [
              'warn',
              { allowConstantExport: true },
            ],
          },
        }
      : undefined,
  ].filter(Boolean);
}

export default defineReactAppConfig;
