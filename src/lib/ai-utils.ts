/**
 * AI Model Configuration and Utilities
 * Manages Gemini model endpoints and fallback logic
 */

export interface GeminiModel {
  name: string
  endpoint: string
  description: string
}

/**
 * Gemini models in order of preference (fallback chain)
 * Each model will be tried in sequence until one succeeds
 */
export const GEMINI_MODELS: GeminiModel[] = [
  {
    name: 'Gemini 2.5 Pro',
    endpoint: 'gemini-2.0-flash-exp',
    description: 'Latest experimental model with enhanced capabilities'
  },
  {
    name: 'Gemini 2.5 Flash',
    endpoint: 'gemini-2.0-flash',
    description: 'Fast and efficient model for quick responses'
  },
  {
    name: 'Gemini 2.0 Pro',
    endpoint: 'gemini-2.0-pro',
    description: 'Reliable and stable model for complex tasks'
  },
  {
    name: 'Gemini 2.0 Flash',
    endpoint: 'gemini-1.5-flash',
    description: 'Fast model with good performance'
  }
]

/**
 * Get the API endpoint URL for a specific model
 */
export function getModelEndpoint(model: GeminiModel, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model.endpoint}:generateContent?key=${apiKey}`
}

/**
 * Log model attempt for debugging and monitoring
 */
export function logModelAttempt(model: GeminiModel, success: boolean, error?: string): void {
  const status = success ? 'SUCCESS' : 'FAILED'
  const errorInfo = error ? ` - ${error}` : ''
  console.log(`[AI Model] ${model.name}: ${status}${errorInfo}`)
}

/**
 * Get a user-friendly error message based on the failure
 */
export function getErrorMessage(modelName?: string): string {
  if (modelName) {
    return `AI content generation failed with ${modelName}. Please try again later or enter content manually.`
  }
  return 'AI content generation is currently unavailable. Please try again later or enter content manually.'
}

/**
 * Validate that the API key is configured
 */
export function validateApiKey(apiKey?: string): { valid: boolean; error?: string } {
  if (!apiKey) {
    return { 
      valid: false, 
      error: 'Gemini API key not configured. Please contact your administrator.' 
    }
  }
  return { valid: true }
}

