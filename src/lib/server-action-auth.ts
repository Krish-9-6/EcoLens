import { createAuthenticatedServerClient } from './supabase'
import { getCurrentUser, getCurrentUserBrandId } from './auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import type { FormState } from './types'

/**
 * Higher-order function that wraps server actions with authentication
 * Automatically provides authenticated supabase client and brand_id
 */
export function withAuth<T extends unknown[], R>(
  action: (
    supabase: SupabaseClient<Database>,
    brandId: string,
    ...args: T
  ) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // Get authenticated user and brand_id
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const brandId = await getCurrentUserBrandId()
    if (!brandId) {
      throw new Error('Brand association required')
    }

    // Create authenticated supabase client
    const supabase = await createAuthenticatedServerClient()

    // Call the wrapped action with auth context
    return action(supabase, brandId, ...args)
  }
}

/**
 * Higher-order function that wraps form server actions with authentication
 * Handles FormState return type and error formatting
 */
export function withFormAuth<T extends unknown[]>(
  action: (
    supabase: SupabaseClient<Database>,
    brandId: string,
    ...args: T
  ) => Promise<FormState>
) {
  return async (...args: T): Promise<FormState> => {
    try {
      // Get authenticated user and brand_id
      const user = await getCurrentUser()
      if (!user) {
        return {
          message: 'Authentication required. Please sign in.',
        }
      }

      const brandId = await getCurrentUserBrandId()
      if (!brandId) {
        return {
          message: 'Brand association required. Please complete your profile setup.',
        }
      }

      // Create authenticated supabase client
      const supabase = await createAuthenticatedServerClient()

      // Call the wrapped action with auth context
      return await action(supabase, brandId, ...args)
    } catch (error) {
      console.error('Server action error:', error)
      return {
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      }
    }
  }
}

/**
 * Utility function to validate that a resource belongs to the current user's brand
 * Use this in server actions to prevent cross-brand data access
 */
export async function validateBrandOwnership(
  supabase: SupabaseClient<Database>,
  userBrandId: string,
  table: 'products' | 'suppliers',
  resourceId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('brand_id')
      .eq('id', resourceId as string) // Type assertion for resourceId
      .single()

    if (error || !data) {
      return false
    }

    return (data as { brand_id: string }).brand_id === userBrandId
  } catch (error) {
    console.error('Error validating brand ownership:', error)
    return false
  }
}

/**
 * Utility function to ensure a user can only access their own brand's data
 * Throws an error if validation fails
 */
export async function requireBrandOwnership(
  supabase: SupabaseClient<Database>,
  userBrandId: string,
  table: 'products' | 'suppliers',
  resourceId: string
): Promise<void> {
  const isValid = await validateBrandOwnership(supabase, userBrandId, table, resourceId)
  
  if (!isValid) {
    throw new Error('Access denied: Resource not found or belongs to another brand')
  }
}