/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: unknown) => boolean
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryCondition: (error: unknown) => {
    if (!error || typeof error !== 'object') return true
    
    const err = error as Record<string, unknown>
    
    // Retry on network errors, timeouts, and 5xx server errors
    if (err.code === 'NETWORK_ERROR') return true
    if (err.code === 'TIMEOUT') return true
    if (typeof err.status === 'number' && err.status >= 500 && err.status < 600) return true
    
    // Don't retry on client errors (4xx) or specific database errors
    if (typeof err.status === 'number' && err.status >= 400 && err.status < 500) return false
    if (err.code === 'PGRST116') return false // Not found
    if (err.code === 'PGRST301') return false // Permission denied
    
    // Default to retry for unknown errors
    return true
  }
}

/**
 * Executes a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: unknown
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry if this is the last attempt
      if (attempt === config.maxAttempts) {
        break
      }
      
      // Don't retry if the error condition says not to
      if (!config.retryCondition(error)) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      )
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // All attempts failed, throw the last error
  throw lastError
}

/**
 * Creates a retry wrapper for a specific function
 */
export function createRetryWrapper<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options)
  }) as T
}