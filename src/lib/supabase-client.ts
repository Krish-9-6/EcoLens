import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { env } from './env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client for client components (browser-side auth)
export const createClientClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    cookies: {
      getAll() {
        return document.cookie
          .split(';')
          .map(cookie => cookie.trim().split('='))
          .reduce((acc, [name, value]) => {
            if (name && value) {
              acc.push({ name, value })
            }
            return acc
          }, [] as { name: string; value: string }[])
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: { path?: string; maxAge?: number; httpOnly?: boolean; secure?: boolean; sameSite?: string } }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieString = `${name}=${value}; path=${options?.path || '/'}; ${
            options?.maxAge ? `max-age=${options.maxAge};` : ''
          } ${options?.httpOnly ? 'HttpOnly;' : ''} ${
            options?.secure ? 'Secure;' : ''
          } ${options?.sameSite ? `SameSite=${options.sameSite};` : ''}`
          document.cookie = cookieString
        })
      },
    },
  } as Parameters<typeof createBrowserClient>[2]) // Type assertion needed for cookies configuration
}