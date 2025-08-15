import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { env } from './env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for server components (no auth needed for public DPP pages)
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Client for client components (if needed for interactive features)
export const createClientClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Default export for server-side usage
export const supabase = createServerClient()