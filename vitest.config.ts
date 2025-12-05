import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['lib/infra/**/*.ts', 'lib/ui/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@infra/': path.resolve(__dirname, 'lib/infra') + '/',
      '@ui/': path.resolve(__dirname, 'lib/ui/src') + '/',
    },
  },
});

