import { DppErrorHandler } from '../error-handling'

describe('DppErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createError', () => {
    it('should create a DppError with all properties', () => {
      const error = DppErrorHandler.createError(
        'Test error',
        'TEST_CODE',
        400,
        { userId: '123' }
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.status).toBe(400)
      expect(error.context).toEqual({ userId: '123' })
    })

    it('should create a DppError with minimal properties', () => {
      const error = DppErrorHandler.createError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.code).toBeUndefined()
      expect(error.status).toBeUndefined()
      expect(error.context).toBeUndefined()
    })
  })

  describe('logError', () => {
    it('should log error with structured data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = DppErrorHandler.createError('Test error', 'TEST_CODE', 500)

      DppErrorHandler.logError(error, { additionalInfo: 'test' })

      expect(consoleSpy).toHaveBeenCalledWith(
        'DPP Error:',
        expect.objectContaining({
          message: 'Test error',
          code: 'TEST_CODE',
          status: 500,
          context: { additionalInfo: 'test' },
          timestamp: expect.any(String)
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      expect(DppErrorHandler.isRetryableError({ code: 'NETWORK_ERROR' })).toBe(true)
      expect(DppErrorHandler.isRetryableError({ code: 'TIMEOUT' })).toBe(true)
      expect(DppErrorHandler.isRetryableError({ name: 'NetworkError' })).toBe(true)
    })

    it('should return true for server errors', () => {
      expect(DppErrorHandler.isRetryableError({ status: 500 })).toBe(true)
      expect(DppErrorHandler.isRetryableError({ status: 502 })).toBe(true)
      expect(DppErrorHandler.isRetryableError({ status: 503 })).toBe(true)
    })

    it('should return false for client errors', () => {
      expect(DppErrorHandler.isRetryableError({ status: 400 })).toBe(false)
      expect(DppErrorHandler.isRetryableError({ status: 404 })).toBe(false)
      expect(DppErrorHandler.isRetryableError({ code: 'PGRST116' })).toBe(false)
      expect(DppErrorHandler.isRetryableError({ code: 'PGRST301' })).toBe(false)
    })

    it('should return false for unknown errors by default', () => {
      expect(DppErrorHandler.isRetryableError({ unknownError: true })).toBe(false)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return specific messages for known error codes', () => {
      expect(DppErrorHandler.getUserFriendlyMessage({ code: 'PGRST116' }))
        .toBe('The requested product could not be found.')
      
      expect(DppErrorHandler.getUserFriendlyMessage({ code: 'NETWORK_ERROR' }))
        .toContain('Unable to connect to our servers')
      
      expect(DppErrorHandler.getUserFriendlyMessage({ code: 'TIMEOUT' }))
        .toContain('took too long to complete')
    })

    it('should return messages based on status codes', () => {
      expect(DppErrorHandler.getUserFriendlyMessage({ status: 500 }))
        .toContain('servers are experiencing issues')
      
      expect(DppErrorHandler.getUserFriendlyMessage({ status: 404 }))
        .toContain('resource was not found')
      
      expect(DppErrorHandler.getUserFriendlyMessage({ status: 400 }))
        .toContain('issue with your request')
    })

    it('should return generic message for unknown errors', () => {
      expect(DppErrorHandler.getUserFriendlyMessage({}))
        .toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('withErrorHandling', () => {
    it('should return result on success', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      
      const result = await DppErrorHandler.withErrorHandling(mockFn)
      
      expect(result).toBe('success')
    })

    it('should log and re-throw errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))
      
      await expect(DppErrorHandler.withErrorHandling(mockFn, { context: 'test' }))
        .rejects.toThrow('Test error')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'DPP Error:',
        expect.objectContaining({
          message: 'Test error',
          context: { context: 'test' }
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle non-Error objects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockFn = vi.fn().mockRejectedValue('string error')
      
      await expect(DppErrorHandler.withErrorHandling(mockFn))
        .rejects.toThrow('Unknown error occurred')
      
      consoleSpy.mockRestore()
    })
  })
})