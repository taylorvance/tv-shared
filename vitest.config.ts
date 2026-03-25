import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: [
      'runtime/**/*.test.{ts,tsx}',
      'fixtures/**/*.test.{ts,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
