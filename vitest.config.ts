import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true, // Без этого "types": ["vitest/globals"] не будет работать в рантайме
    environment: 'jsdom',
    setupFiles: ['@vitest/web-worker', './src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
    extensions: [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ]
  },
})
