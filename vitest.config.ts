import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/i18n/**/*.test.ts'],
    environment: 'node',
  },
})
