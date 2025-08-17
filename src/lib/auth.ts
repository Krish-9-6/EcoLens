import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './types'

/**
 * Get the current authenticated user from server context.
 * Returns null if no user is authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get the current authenticated user or redirect to login.
 * Use this in protected server components that require authentication.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

/**
* Get the brand_id for the current authenticated user.
* Returns null if user is not authenticated or has no profile.
*/
export async function getCurrentUserBrandId(): Promise<string | null> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Query the profiles table for the user's brand_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single()
    
    return profile?.brand_id || null
  } catch (error) {
    console.error('Error in getCurrentUserBrandId:', error)
    return null
  }
}

/**
 * Get the brand_id for the current user or redirect if not available.
 * Use this in protected routes requiring both auth and brand association.
 */
export async function requireAuthWithBrandId(): Promise<string> {
  await requireAuth() // Ensures user is logged in
  const brandId = await getCurrentUserBrandId()
  
  if (!brandId) {
    redirect('/auth/setup-brand')
  }
  
  return brandId
}

/**
 * Get the complete profile for the current authenticated user.
 * Returns null if user is not authenticated or has no profile.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return profile
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return null
  }
}