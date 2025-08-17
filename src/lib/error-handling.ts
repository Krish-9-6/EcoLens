/**
 * Error handling utilities for the DPP system
 */

export interface DppError extends Error {
  code?: string
  status?: number
  context?: Record<string, unknown>
}

export class DppErrorHandler {
  /**
   * Creates a standardized DPP error
   */
  static createError(
    message: string,
    code?: string,
    status?: number,
    context?: Record<string, unknown>
  ): DppError {
    const error = new Error(message) as DppError
    error.code = code
    error.status = status
    error.context = context
    return error
  }

  /**
   * Logs errors with structured data for monitoring
   */
  static logError(error: DppError, additionalContext?: Record<string, unknown>) {
    const errorData = {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
      context: { ...error.context, ...additionalContext },
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    console.error('DPP Error:', errorData)

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === 'production') {
      // sendToErrorMonitoring(errorData)
    }
  }

  /**
   * Determines if an error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    
    const err = error as Record<string, unknown>
    
    // Network errors
    if (err.code === 'NETWORK_ERROR') return true
    if (err.code === 'TIMEOUT') return true
    if (err.name === 'NetworkError') return true
    
    // Server errors (5xx)
    if (typeof err.status === 'number' && err.status >= 500 && err.status < 600) return true
    
    // Specific database errors that might be temporary
    if (err.code === 'PGRST000') return true // Generic PostgREST error
    if (err.code === 'PGRST001') return true // Connection error
    
    // Don't retry client errors or specific database errors
    if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) return false
    if (err.code === 'PGRST116') return false // Not found
    if (err.code === 'PGRST301') return false // Permission denied
    
    return false
  }

  /**
   * Gets a user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown): string {
    if (!error || typeof error !== 'object') {
      return 'An unexpected error occurred. Please try again.'
    }
    
    const err = error as Record<string, unknown>
    
    if (err.code === 'PGRST116') {
      return 'The requested product could not be found.'
    }
    
    if (err.code === 'NETWORK_ERROR' || err.name === 'NetworkError') {
      return 'Unable to connect to our servers. Please check your internet connection.'
    }
    
    if (err.code === 'TIMEOUT') {
      return 'The request took too long to complete. Please try again.'
    }
    
    if (typeof err.status === 'number' && err.status >= 500) {
      return 'Our servers are experiencing issues. Please try again in a moment.'
    }
    
    if (err.status === 404) {
      return 'The requested resource was not found.'
    }
    
    if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) {
      return 'There was an issue with your request. Please try again.'
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Wraps async functions with error handling
   */
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      const dppError = error instanceof Error 
        ? error as DppError
        : this.createError('Unknown error occurred', 'UNKNOWN_ERROR', 500, { originalError: error })
      
      this.logError(dppError, context)
      throw dppError
    }
  }
}

/**
 * Error boundary hook for React components
 */
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: unknown) => {
    const dppError = error as DppError
    DppErrorHandler.logError(dppError, { errorInfo })
  }

  const createErrorHandler = (componentName: string) => {
    return (error: Error, errorInfo?: unknown) => {
      const errorContext = errorInfo && typeof errorInfo === 'object' 
        ? { component: componentName, ...errorInfo as Record<string, unknown> }
        : { component: componentName }
      handleError(error, errorContext)
    }
  }

  return { handleError, createErrorHandler }
}

/**
 * Server-side error handling utilities
 * These functions can be safely called from Server Components
 */

/**
 * Get user-friendly error messages for server-side error handling
 */
export function getServerSideErrorMessage(error: unknown): { title: string; message: string; type: 'error' | 'warning' | 'info' } {
  const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error'
  const lowerMessage = errorMessage.toLowerCase()

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed')) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      type: 'error'
    }
  }

  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return {
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to continue.',
      type: 'warning'
    }
  }

  // Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return {
      title: 'Invalid Input',
      message: 'Please check your input and try again. Make sure all required fields are filled correctly.',
      type: 'warning'
    }
  }

  // Permission errors
  if (lowerMessage.includes('permission') || lowerMessage.includes('access denied') || lowerMessage.includes('forbidden')) {
    return {
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action. Please contact your administrator if you believe this is an error.',
      type: 'warning'
    }
  }

  // Not found errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('404') || lowerMessage.includes('next_http_error_fallback')) {
    return {
      title: 'Not Found',
      message: 'The requested resource could not be found. It may have been moved or deleted.',
      type: 'info'
    }
  }

  // Server errors
  if (lowerMessage.includes('server error') || lowerMessage.includes('500') || lowerMessage.includes('internal server')) {
    return {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
      type: 'error'
    }
  }

  // Database constraint errors
  if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
    return {
      title: 'Duplicate Entry',
      message: 'An item with this information already exists. Please use a different name or check existing entries.',
      type: 'warning'
    }
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      type: 'error'
    }
  }

  // Default error
  return {
    title: 'Something Went Wrong',
    message: errorMessage || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    type: 'error'
  }
}