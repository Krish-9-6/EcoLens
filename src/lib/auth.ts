import { createAuthenticatedServerClient } from './supabase'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './types'

/**
 * Get the current authenticated user from server context
 * Returns null if no user is authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createAuthenticatedServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

/**
 * Get the current authenticated user or redirect to login
 * Use this in protected routes that require authentication
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

/**
 * Get the brand_id for the current authenticated user
 * Returns null if user is not authenticated or has no profile
 */
export async function getCurrentUserBrandId(): Promise<string | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    const supabase = await createAuthenticatedServerClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return profile?.brand_id || null
  } catch (error) {
    console.error('Error in getCurrentUserBrandId:', error)
    return null
  }
}

/**
 * Get the brand_id for the current authenticated user or redirect to login
 * Use this in protected routes that require both authentication and brand association
 */
export async function requireAuthWithBrandId(): Promise<string> {
  await requireAuth()
  const brandId = await getCurrentUserBrandId()
  
  if (!brandId) {
    // User is authenticated but has no brand association
    // This could redirect to a setup page or show an error
    redirect('/auth/setup-brand')
  }
  
  return brandId
}

/**
 * Get the full user profile including brand information
 * Returns null if user is not authenticated or has no profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    
    const supabase = await createAuthenticatedServerClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return profile as Profile | null
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return null
  }
}

/**
 * Check if the current user has access to a specific brand
 * Used for additional security checks in server actions
 */
export async function verifyBrandAccess(brandId: string): Promise<boolean> {
  try {
    const userBrandId = await getCurrentUserBrandId()
    return userBrandId === brandId
  } catch (error) {
    console.error('Error in verifyBrandAccess:', error)
    return false
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createAuthenticatedServerClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}