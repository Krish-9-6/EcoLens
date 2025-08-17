import { createClient } from './supabase/client'
import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from './types'

/**
 * React hook for managing authentication state on the client side
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    signOut: async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    },
  }
}

/**
 * React hook for getting the current user's profile including brand information
 */
export function useUserProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          setError(error.message)
          setProfile(null)
        } else {
          setProfile(data as Profile)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchProfile()
    }
  }, [user, authLoading])

  return {
    profile,
    loading: authLoading || loading,
    error,
    refetch: () => {
      if (user) {
        setLoading(true)
        setError(null)
        // Re-trigger the effect
        setProfile(null)
      }
    },
  }
}

/**
 * Client-side function to sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Client-side function to sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient()
  
  console.log('Creating Supabase client for signup...')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Attempting signup for email:', email)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  console.log('Supabase signup response:', { data, error })

  if (error) {
    console.error('Supabase signup error:', error)
    throw error
  }

  console.log('Signup successful, returning data:', data)
  return data
}

/**
 * Client-side function to reset password
 */
export async function resetPassword(email: string) {
  const supabase = createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}

/**
 * Client-side function to update password
 */
export async function updatePassword(password: string) {
  const supabase = createClient()
  
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw error
  }
}