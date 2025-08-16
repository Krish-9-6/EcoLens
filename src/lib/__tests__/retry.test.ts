import { withRetry, createRetryWrapper } from '../retry'

describe('Retry Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('withRetry', () => {
    it('should return result on first success', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockFn)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
        .mockResolvedValue('success')
      
      const promise = withRetry(mockFn, { maxAttempts: 2, baseDelay: 100 })
      
      // Fast-forward through the delay and wait for promise resolution
      await vi.advanceTimersByTimeAsync(100)
      
      const result = await promise
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    }, 10000)

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'PGRST116' }) // Not found
      
      await expect(withRetry(mockFn)).rejects.toEqual({ code: 'PGRST116' })
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should respect maxAttempts', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'NETWORK_ERROR' })
      
      const promise = withRetry(mockFn, { maxAttempts: 3, baseDelay: 100 })
      
      // Fast-forward through all delays
      await vi.advanceTimersByTimeAsync(100) // First retry
      await vi.advanceTimersByTimeAsync(200) // Second retry
      
      await expect(promise).rejects.toEqual({ code: 'NETWORK_ERROR' })
      expect(mockFn).toHaveBeenCalledTimes(3)
    }, 10000)

    it('should use exponential backoff', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'NETWORK_ERROR' })
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const promise = withRetry(mockFn, { 
        maxAttempts: 3, 
        baseDelay: 100, 
        backoffFactor: 2 
      })
      
      // Wait for first attempt to fail and check console output
      await vi.advanceTimersByTimeAsync(0) // Let first attempt fail
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('retrying in 100ms'),
        expect.any(Object)
      )
      
      // Advance to second retry
      await vi.advanceTimersByTimeAsync(100)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('retrying in 200ms'),
        expect.any(Object)
      )
      
      // Complete the test
      await vi.advanceTimersByTimeAsync(200)
      await expect(promise).rejects.toEqual({ code: 'NETWORK_ERROR' })
      
      consoleSpy.mockRestore()
    }, 10000)

    it('should respect maxDelay', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'NETWORK_ERROR' })
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const promise = withRetry(mockFn, { 
        maxAttempts: 3, 
        baseDelay: 1000, 
        backoffFactor: 10,
        maxDelay: 1500
      })
      
      // Wait for first failure and check delay is capped
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(1000) // First retry
      await vi.advanceTimersByTimeAsync(1500) // Second retry (capped at maxDelay)
      
      await expect(promise).rejects.toEqual({ code: 'NETWORK_ERROR' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('retrying in 1500ms'),
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
    }, 10000)

    it('should use custom retry condition', async () => {
      const mockFn = vi.fn().mockRejectedValue({ customError: true })
      
      const customRetryCondition = (error: any) => error.customError === true
      
      const promise = withRetry(mockFn, { 
        maxAttempts: 2, 
        baseDelay: 100,
        retryCondition: customRetryCondition
      })
      
      await vi.advanceTimersByTimeAsync(100)
      
      await expect(promise).rejects.toEqual({ customError: true })
      expect(mockFn).toHaveBeenCalledTimes(2)
    }, 10000)
  })

  describe('createRetryWrapper', () => {
    it('should create a wrapped function with retry logic', async () => {
      const originalFn = vi.fn().mockResolvedValue('success')
      const wrappedFn = createRetryWrapper(originalFn, { maxAttempts: 2 })
      
      const result = await wrappedFn('arg1', 'arg2')
      
      expect(result).toBe('success')
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should preserve function signature', async () => {
      const originalFn = vi.fn((a: string, b: number) => Promise.resolve(`${a}-${b}`))
      const wrappedFn = createRetryWrapper(originalFn)
      
      const result = await wrappedFn('test', 123)
      
      expect(result).toBe('test-123')
      expect(originalFn).toHaveBeenCalledWith('test', 123)
    })
  })
})