import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    testTimeout: 60000,
  },
  resolve: {
    alias: {
      '<ecolens>': path.resolve(__dirname, './src'),
    },
  },
})