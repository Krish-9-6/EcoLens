'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { User, createClient } from '@supabase/supabase-js'

import { ProductSchema, SupplierSchema } from '<ecolens>/lib/schemas'
import { withFormAuth } from '<ecolens>/lib/server-action-auth'
import type { FormState } from '<ecolens>/lib/types'

/**
 * Server Action: Create a new product.
 * This action is protected and requires the user to be authenticated and have a brand_id.
 */
export const createProduct = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const validatedData = ProductSchema.parse({
        name: formData.get('name'),
        description: formData.get('description'),
      })

      // 2. Get the user's brand_id from their app_metadata
      const brandId = user.app_metadata?.brand_id;

      if (!brandId) {
        return { message: 'Error: Could not find your brand association. Please log in again.' }
      }

      // 3. Insert the new product into the database
      const { error } = await supabase.from('products').insert({
        ...validatedData,
        brand_id: brandId,
      })

      if (error) {
        console.error('Database error creating product:', error)
        return { message: `Database Error: ${error.message}` }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          errors: error.flatten().fieldErrors,
          message: 'Validation Error: Please check the fields.',
        }
      }
      console.error('Unexpected error in createProduct:', error)
      return { message: 'An unexpected error occurred.' }
    }

    // 4. Revalidate and redirect
    revalidatePath('/dashboard/products')
    redirect('/dashboard/products')
  }
)

/**
 * Server Action: Add a new supplier to a product's supply chain.
 * This action is protected and requires authentication.
 */
export const addSupplier = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const validatedData = SupplierSchema.parse({
        name: formData.get('name'),
        tier: Number(formData.get('tier')),
        location: formData.get('location'),
        product_id: formData.get('product_id'),
        parent_supplier_id: formData.get('parent_supplier_id') || null,
      })
      
      // 2. Insert the new supplier
      const { error } = await supabase.from('suppliers').insert(validatedData)

      if (error) {
        console.error('Database error adding supplier:', error)
        return { message: `Database Error: ${error.message}` }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          errors: error.flatten().fieldErrors,
          message: 'Validation Error: Please check the fields.',
        }
      }
      console.error('Unexpected error in addSupplier:', error)
      return { message: 'An unexpected error occurred.' }
    }

    // 3. Revalidate and redirect
    const productId = formData.get('product_id') as string
    revalidatePath(`/dashboard/products/${productId}`)
    redirect(`/dashboard/products/${productId}`)
  }
)

/**
 * Server Action: Create a new brand and link it to the user's app_metadata.
 * This now uses a Supabase Admin Client for the entire operation to bypass RLS issues.
 */
export const setupBrand = withFormAuth(
  // The 'supabase' client from the wrapper is no longer needed here, but we keep the signature consistent.
  async (_, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const brandName = formData.get('name') as string;
      if (!brandName || brandName.trim().length < 2) {
        return {
          errors: { name: ['Brand name must be at least 2 characters'] },
          message: 'Please enter a valid brand name.',
        }
      }

      // 2. Create a Supabase Admin Client. This will bypass all RLS policies.
      // Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } } // Important for server-side use
      );

      // 3. Create the new brand using the Admin Client
      const { data: newBrand, error: brandError } = await supabaseAdmin
        .from('brands')
        .insert({ name: brandName.trim() })
        .select()
        .single();

      if (brandError) {
        console.error('Database error creating brand:', brandError);
        if (brandError.code === '23505') { // unique_violation
          return { message: 'A brand with this name already exists.' }
        }
        return { message: 'Failed to create brand due to a database permission error.' }
      }

      // 4. Update the user's app_metadata with the new brand_id using the Admin Client
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { app_metadata: { ...user.app_metadata, brand_id: newBrand.id } }
      )

      if (updateUserError) {
        console.error('Error updating user metadata:', updateUserError);
        return { message: 'Failed to link brand to your profile. Please contact support.' }
      }

    } catch (error) {
      console.error('Unexpected error in setupBrand:', error);
      return { message: 'An unexpected error occurred. Please try again.' }
    }

    // 5. Revalidate and redirect on success
    revalidatePath('/dashboard', 'layout');
    redirect('/dashboard');
  }
);

/**
 * Next.js Server Actions for Veritas Platform
 * File: app/actions.ts
 * 
 * Purpose: Provides server-side actions for certificate verification that bridge
 * the frontend React components to the Supabase Edge Functions securely.
 * 
 * Security: Uses Supabase client with user cookies for authentication
 * and proper authorization checks.
 */



import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Interface for certificate verification request
 */
interface CertificateData {
  [key: string]: any
}

/**
 * Interface for successful verification response
 */
interface VerificationSuccess {
  success: true
  hash: string
  certificateId: string
  message: string
  timestamp: string
}

/**
 * Interface for failed verification response
 */
interface VerificationError {
  success: false
  error: string
  code?: string
  details?: string
}

/**
 * Union type for all possible verification responses
 */
type VerificationResult = VerificationSuccess | VerificationError

/**
 * Interface for Edge Function response structure
 */
interface EdgeFunctionResponse {
  success: boolean
  dataHash?: string
  certificateId?: string
  message?: string
  timestamp?: string
  error?: string
  code?: string
}

/**
 * Validates certificate ID format (UUID)
 * 
 * @param certificateId - The certificate ID to validate
 * @returns True if valid UUID format
 */
function isValidUUID(certificateId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(certificateId)
}

/**
 * Validates certificate data structure
 * 
 * @param certificateData - The certificate data to validate
 * @returns Validation result with error message if invalid
 */
function validateCertificateData(certificateData: any): { isValid: boolean; error?: string } {
  if (!certificateData) {
    return { isValid: false, error: 'Certificate data is required' }
  }
  
  if (typeof certificateData !== 'object' || certificateData === null) {
    return { isValid: false, error: 'Certificate data must be a valid object' }
  }
  
  if (Array.isArray(certificateData)) {
    return { isValid: false, error: 'Certificate data cannot be an array' }
  }
  
  // Check if object has at least one property
  if (Object.keys(certificateData).length === 0) {
    return { isValid: false, error: 'Certificate data cannot be empty' }
  }
  
  return { isValid: true }
}

/**
 * Server Action: Verify Certificate
 * 
 * This function serves as a secure bridge between the React frontend and the
 * Supabase Edge Function. It handles authentication, validation, and error
 * management while maintaining type safety.
 * 
 * @param certificateId - UUID of the certificate to verify
 * @param certificateData - Certificate data object to be hashed and verified
 * @returns Promise<VerificationResult> - Success/failure result with details
 * 
 * @example
 * ```typescript
 * const result = await verifyCertificate(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   {
 *     brand: 'EcoFashion',
 *     product: 'Organic Cotton T-Shirt',
 *     sustainability_score: 95,
 *     certifications: ['GOTS', 'Fair Trade']
 *   }
 * )
 * 
 * if (result.success) {
 *   console.log('Certificate verified with hash:', result.hash)
 * } else {
 *   console.error('Verification failed:', result.error)
 * }
 * ```
 */
export async function verifyCertificate(
  certificateId: string,
  certificateData: CertificateData
): Promise<VerificationResult> {
  try {
    // Input validation
    if (!certificateId || typeof certificateId !== 'string') {
      return {
        success: false,
        error: 'Certificate ID is required and must be a string',
        code: 'INVALID_CERTIFICATE_ID'
      }
    }
    
    // Validate UUID format
    if (!isValidUUID(certificateId.trim())) {
      return {
        success: false,
        error: 'Certificate ID must be a valid UUID format',
        code: 'INVALID_UUID_FORMAT'
      }
    }
    
    // Validate certificate data
    const dataValidation = validateCertificateData(certificateData)
    if (!dataValidation.isValid) {
      return {
        success: false,
        error: dataValidation.error!,
        code: 'INVALID_CERTIFICATE_DATA'
      }
    }
    
    console.log(`[Server Action] Starting verification for certificate: ${certificateId}`)
    
    // Initialize Supabase client with user session
    const cookieStore = cookies()
    const supabase = createServerActionClient({ 
      cookies: () => cookieStore 
    })
    
    // Verify user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('[Server Action] Auth error:', authError)
      return {
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
        details: authError.message
      }
    }
    
    if (!session) {
      return {
        success: false,
        error: 'User must be authenticated to verify certificates',
        code: 'UNAUTHORIZED'
      }
    }
    
    console.log(`[Server Action] User authenticated: ${session.user.id}`)
    
    // Prepare payload for Edge Function
    const payload = {
      certificateId: certificateId.trim(),
      certificateData: certificateData
    }
    
    console.log('[Server Action] Invoking anchor-certificate Edge Function')
    
    // Invoke the Edge Function
    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'anchor-certificate',
      {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
    
    // Handle Edge Function invocation errors
    if (functionError) {
      console.error('[Server Action] Edge Function invocation error:', functionError)
      return {
        success: false,
        error: 'Failed to invoke certificate verification service',
        code: 'FUNCTION_INVOCATION_ERROR',
        details: functionError.message
      }
    }
    
    // Parse Edge Function response
    const response = functionData as EdgeFunctionResponse
    
    console.log('[Server Action] Edge Function response:', response)
    
    // Handle Edge Function business logic errors
    if (!response || !response.success) {
      const errorMessage = response?.error || 'Unknown error occurred during verification'
      const errorCode = response?.code || 'VERIFICATION_ERROR'
      
      return {
        success: false,
        error: errorMessage,
        code: errorCode
      }
    }
    
    // Validate successful response structure
    if (!response.dataHash || !response.certificateId) {
      return {
        success: false,
        error: 'Invalid response from verification service',
        code: 'INVALID_RESPONSE'
      }
    }
    
    console.log(`[Server Action] Certificate verified successfully with hash: ${response.dataHash}`)
    
    // Revalidate relevant pages to update UI
    // This ensures the dashboard shows the updated verification status
    revalidatePath(`/dashboard/products/${certificateId}`)
    revalidatePath('/dashboard/certificates')
    revalidatePath('/dashboard')
    
    // Return success response
    return {
      success: true,
      hash: response.dataHash,
      certificateId: response.certificateId,
      message: response.message || 'Certificate verified successfully',
      timestamp: response.timestamp || new Date().toISOString()
    }
    
  } catch (error) {
    // Handle unexpected errors
    console.error('[Server Action] Unexpected error in verifyCertificate:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during verification'
    
    return {
      success: false,
      error: errorMessage,
      code: 'UNEXPECTED_ERROR'
    }
  }
}

/**
 * Server Action: Batch Verify Certificates
 * 
 * Verifies multiple certificates in sequence. This is useful for bulk operations
 * while maintaining individual error handling for each certificate.
 * 
 * @param certificates - Array of certificate objects to verify
 * @returns Promise<VerificationResult[]> - Array of results for each certificate
 */
export async function batchVerifyCertificates(
  certificates: Array<{ id: string; data: CertificateData }>
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []
  
  for (const cert of certificates) {
    try {
      const result = await verifyCertificate(cert.id, cert.data)
      results.push(result)
      
      // Add small delay between requests to avoid overwhelming the system
      if (certificates.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Batch verification error',
        code: 'BATCH_ERROR'
      })
    }
  }
  
  // Revalidate dashboard pages after batch operation
  revalidatePath('/dashboard/certificates')
  revalidatePath('/dashboard')
  
  return results
}

/**
 * Server Action: Get Certificate Verification Status
 * 
 * Checks if a certificate has been verified without triggering verification.
 * This is useful for UI components that need to show verification status.
 * 
 * @param certificateId - UUID of the certificate to check
 * @returns Promise<{ verified: boolean; verifiedAt?: string; error?: string }>
 */
export async function getCertificateStatus(certificateId: string) {
  try {
    if (!isValidUUID(certificateId)) {
      return { verified: false, error: 'Invalid certificate ID format' }
    }
    
    const cookieStore = cookies()
    const supabase = createServerActionClient({ 
      cookies: () => cookieStore 
    })
    
    const { data, error } = await supabase
      .from('certificates')
      .select('verified_at')
      .eq('id', certificateId)
      .single()
    
    if (error) {
      return { verified: false, error: error.message }
    }
    
    return {
      verified: !!data.verified_at,
      verifiedAt: data.verified_at
    }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/* 
 * Usage Examples:
 * 
 * 1. Basic certificate verification:
 * ```typescript
 * const result = await verifyCertificate(certificateId, certificateData)
 * if (result.success) {
 *   toast.success(`Certificate verified! Hash: ${result.hash}`)
 * } else {
 *   toast.error(result.error)
 * }
 * ```
 * 
 * 2. Batch verification:
 * ```typescript
 * const certificates = [
 *   { id: 'uuid1', data: { ... } },
 *   { id: 'uuid2', data: { ... } }
 * ]
 * const results = await batchVerifyCertificates(certificates)
 * const successful = results.filter(r => r.success).length
 * ```
 * 
 * 3. Check status:
 * ```typescript
 * const status = await getCertificateStatus(certificateId)
 * if (status.verified) {
 *   console.log(`Verified at: ${status.verifiedAt}`)
 * }
 * ```
 */