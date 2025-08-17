import { createClient as createJsClient } from '@supabase/supabase-js' // For unauthenticated access
import { createServerClient, type CookieOptions } from '@supabase/ssr' // For authenticated access
import { cookies } from 'next/headers'
import type { Database } from './types'
import { env } from './env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Creates an unauthenticated Supabase client for server-side operations.
 * This is suitable for public data fetching where no user session is required.
 */
const createUnauthenticatedServerClient = () => {
  return createJsClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

/**
 * Default export for server-side usage (public/unauthenticated).
 * Used for fetching public data like DPPs in `src/lib/data.ts`.
 */
export const supabase = createUnauthenticatedServerClient()


/**
 * Creates an authenticated Supabase client for server-side operations (Server Components, Route Handlers, Server Actions).
 * This function reads and writes cookies and is essential for user-specific data access.
 */
export const createAuthenticatedServerClient = async () => {
  const cookieStore = await cookies()

  // Use the createServerClient from @supabase/ssr which is designed for server environments
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // The get method is used to read cookies from the request.
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // The set method is used to set cookies in the response.
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // This error is expected when calling set from a Server Component.
          // It can be safely ignored if you have middleware refreshing sessions.
        }
      },
      // The remove method is used to delete cookies from the response.
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // This error is expected when calling remove from a Server Component.
          // It can be safely ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}