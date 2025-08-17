// Environment variable validation for Supabase configuration

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Validate and export environment variables
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_URL', 
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
} as const

// Validate Supabase URL format
if (!env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') || 
    !env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
}

// Basic validation for anon key (should be a JWT)
if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format (should be a JWT)')
}