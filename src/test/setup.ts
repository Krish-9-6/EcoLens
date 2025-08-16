import '@testing-library/jest-dom'

// Mock environment variables for tests
const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    NODE_ENV: 'test'
  }
})

afterEach(() => {
  process.env = originalEnv
})

// Helper function for tests that need to modify NODE_ENV
export const mockNodeEnv = (env: string) => {
  const original = process.env.NODE_ENV
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: env,
    writable: true,
    configurable: true
  })
  return () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: original,
      writable: true,
      configurable: true
    })
  }
}