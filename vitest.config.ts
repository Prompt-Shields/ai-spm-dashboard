import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'lib/pii/**/*.test.ts',
      'lib/i18n/**/*.test.ts',
      'lib/agent-discovery/**/*.test.ts',
      'lib/agent-control/**/*.test.ts',
      'lib/*.test.ts',
    ],
    environment: 'node',
  },
})
