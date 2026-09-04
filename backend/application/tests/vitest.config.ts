import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Allows using describe/it without importing (optional)
    environment: 'node',
    fileParallelism: false,
    testTimeout: 60000, // 60s Global timeout for container operations
    hookTimeout: 120000, // 120s specifically for beforeAll hooks
  },
});
