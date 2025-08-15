/**
 * Error handling utilities for the DPP system
 */

export interface DppError extends Error {
  code?: string
  status?: number
  context?: Record<string, any>
}

export class DppErrorHandler {
  /**
   * Creates a standardized DPP error
   */
  static createError(
    message: string,
    code?: string,
    status?: number,
    context?: Record<string, any>
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
  static logError(error: DppError, additionalContext?: Record<string, any>) {
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
  static isRetryableError(error: any): boolean {
    // Network errors
    if (error?.code === 'NETWORK_ERROR') return true
    if (error?.code === 'TIMEOUT') return true
    if (error?.name === 'NetworkError') return true
    
    // Server errors (5xx)
    if (error?.status >= 500 && error?.status < 600) return true
    
    // Specific database errors that might be temporary
    if (error?.code === 'PGRST000') return true // Generic PostgREST error
    if (error?.code === 'PGRST001') return true // Connection error
    
    // Don't retry client errors or specific database errors
    if (error?.status >= 400 && error?.status < 500) return false
    if (error?.code === 'PGRST116') return false // Not found
    if (error?.code === 'PGRST301') return false // Permission denied
    
    return false
  }

  /**
   * Gets a user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    if (error?.code === 'PGRST116') {
      return 'The requested product could not be found.'
    }
    
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      return 'Unable to connect to our servers. Please check your internet connection.'
    }
    
    if (error?.code === 'TIMEOUT') {
      return 'The request took too long to complete. Please try again.'
    }
    
    if (error?.status >= 500) {
      return 'Our servers are experiencing issues. Please try again in a moment.'
    }
    
    if (error?.status === 404) {
      return 'The requested resource was not found.'
    }
    
    if (error?.status >= 400 && error?.status < 500) {
      return 'There was an issue with your request. Please try again.'
    }
    
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Wraps async functions with error handling
   */
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
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
  const handleError = (error: Error, errorInfo?: any) => {
    const dppError = error as DppError
    DppErrorHandler.logError(dppError, { errorInfo })
  }

  const createErrorHandler = (componentName: string) => {
    return (error: Error, errorInfo?: any) => {
      handleError(error, { component: componentName, ...errorInfo })
    }
  }

  return { handleError, createErrorHandler }
}