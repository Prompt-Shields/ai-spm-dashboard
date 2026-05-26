import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/pii/**/*.test.ts'],
    environment: 'node',
  },
})
