/**
 * Supabase Edge Function: anchor-certificate
 * File: supabase/functions/anchor-certificate/index.ts
 * 
 * Purpose: Acts as a trusted "notary" service for the Veritas fashion transparency
 * platform. This function creates deterministic hashes of certificate data and
 * atomically records verification events in the tamper-proof ledger.
 * 
 * Security: Uses admin Supabase client to bypass RLS for atomic operations
 * while maintaining data integrity through the anchor_and_verify function.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { SHA256 } from 'https://esm.sh/crypto-js@4.2.0'

/**
 * CORS headers for cross-origin requests
 * Essential for Next.js frontend communication
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
}

/**
 * Interface for the expected request body structure
 */
interface AnchorCertificateRequest {
  certificateData: Record<string, any>
  certificateId: string
}

/**
 * Interface for the success response structure
 */
interface AnchorCertificateResponse {
  success: boolean
  dataHash: string
  certificateId: string
  message: string
  timestamp: string
}

/**
 * Interface for error response structure
 */
interface ErrorResponse {
  success: false
  error: string
  code: string
  timestamp: string
}

/**
 * Creates a deterministic, stable string representation of a JSON object
 * by recursively sorting all keys. This ensures consistent hashing regardless
 * of the original key order in the JSON object.
 * 
 * @param obj - The JSON object to stabilize
 * @returns Deterministic string representation
 */
function createStableJsonString(obj: any): string {
  if (obj === null || obj === undefined) {
    return String(obj)
  }
  
  if (typeof obj !== 'object') {
    return String(obj)
  }
  
  if (Array.isArray(obj)) {
    // For arrays, maintain order but stabilize nested objects
    return '[' + obj.map(item => createStableJsonString(item)).join(',') + ']'
  }
  
  // For objects, sort keys alphabetically for deterministic output
  const sortedKeys = Object.keys(obj).sort()
  const stabilizedPairs = sortedKeys.map(key => {
    const stabilizedValue = createStableJsonString(obj[key])
    return `"${key}":${stabilizedValue}`
  })
  
  return '{' + stabilizedPairs.join(',') + '}'
}

/**
 * Validates the request body structure and content
 * 
 * @param body - The parsed request body
 * @returns Validation result with error message if invalid
 */
function validateRequestBody(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' }
  }
  
  if (!body.certificateData) {
    return { isValid: false, error: 'certificateData is required' }
  }
  
  if (typeof body.certificateData !== 'object' || body.certificateData === null) {
    return { isValid: false, error: 'certificateData must be a valid JSON object' }
  }
  
  if (!body.certificateId) {
    return { isValid: false, error: 'certificateId is required' }
  }
  
  if (typeof body.certificateId !== 'string' || body.certificateId.trim().length === 0) {
    return { isValid: false, error: 'certificateId must be a non-empty string' }
  }
  
  // Validate UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(body.certificateId.trim())) {
    return { isValid: false, error: 'certificateId must be a valid UUID format' }
  }
  
  return { isValid: true }
}

/**
 * Creates an error response with consistent structure
 * 
 * @param error - Error message
 * @param code - Error code for categorization
 * @param status - HTTP status code
 * @returns Response object
 */
function createErrorResponse(error: string, code: string, status: number): Response {
  const errorResponse: ErrorResponse = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  }
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    }
  )
}

/**
 * Main Edge Function handler
 */
serve(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      })
    }
    
    // Only allow POST requests for certificate anchoring
    if (req.method !== 'POST') {
      return createErrorResponse(
        `Method ${req.method} not allowed. Only POST requests are supported.`,
        'METHOD_NOT_ALLOWED',
        405
      )
    }
    
    // Parse and validate request body
    let requestBody: AnchorCertificateRequest
    try {
      requestBody = await req.json()
    } catch (parseError) {
      return createErrorResponse(
        'Invalid JSON in request body',
        'INVALID_JSON',
        400
      )
    }
    
    // Validate request structure
    const validation = validateRequestBody(requestBody)
    if (!validation.isValid) {
      return createErrorResponse(
        validation.error!,
        'VALIDATION_ERROR',
        400
      )
    }
    
    const { certificateData, certificateId } = requestBody
    
    // Create deterministic string representation for consistent hashing
    const stableJsonString = createStableJsonString(certificateData)
    
    // Generate SHA-256 hash of the stable string
    const dataHash = SHA256(stableJsonString).toString()
    const prefixedHash = `sha256:${dataHash}`
    
    console.log(`Processing certificate ${certificateId} with hash ${prefixedHash}`)
    
    // Initialize admin Supabase client to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables')
      return createErrorResponse(
        'Server configuration error',
        'CONFIG_ERROR',
        500
      )
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Call the atomic anchor_and_verify function
    console.log(`Calling anchor_and_verify for certificate ${certificateId}`)
    
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      'anchor_and_verify',
      {
        p_cert_id: certificateId,
        p_data_hash: prefixedHash
      }
    )
    
    if (rpcError) {
      console.error('RPC Error:', rpcError)
      
      // Handle specific database errors with user-friendly messages
      let errorMessage = 'Failed to anchor certificate'
      let errorCode = 'ANCHOR_ERROR'
      
      if (rpcError.message.includes('does not exist')) {
        errorMessage = 'Certificate not found or access denied'
        errorCode = 'CERTIFICATE_NOT_FOUND'
      } else if (rpcError.message.includes('already verified')) {
        errorMessage = 'Certificate has already been verified'
        errorCode = 'ALREADY_VERIFIED'
      } else if (rpcError.message.includes('cannot be null')) {
        errorMessage = 'Invalid certificate data provided'
        errorCode = 'INVALID_DATA'
      }
      
      return createErrorResponse(errorMessage, errorCode, 400)
    }
    
    console.log(`Successfully anchored certificate ${certificateId}`)
    
    // Return success response
    const successResponse: AnchorCertificateResponse = {
      success: true,
      dataHash: prefixedHash,
      certificateId: certificateId.trim(),
      message: 'Certificate successfully anchored and verified',
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(successResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
    
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in anchor-certificate function:', error)
    
    return createErrorResponse(
      'An unexpected error occurred while processing the request',
      'INTERNAL_ERROR',
      500
    )
  }
})

/* 
 * Deployment Notes:
 * 
 * 1. Deploy this function using: supabase functions deploy anchor-certificate
 * 
 * 2. Ensure environment variables are set:
 *    - SUPABASE_URL: Your project URL
 *    - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 * 
 * 3. Test the function:
 *    curl -X POST \
 *      'https://your-project.supabase.co/functions/v1/anchor-certificate' \
 *      -H 'Authorization: Bearer YOUR_ANON_KEY' \
 *      -H 'Content-Type: application/json' \
 *      -d '{
 *        "certificateId": "550e8400-e29b-41d4-a716-446655440000",
 *        "certificateData": {
 *          "brand": "EcoFashion",
 *          "product": "Organic Cotton T-Shirt",
 *          "sustainability_score": 95
 *        }
 *      }'
 * 
 * 4. Function URL will be:
 *    https://your-project-id.supabase.co/functions/v1/anchor-certificate
 */