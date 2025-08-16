import { describe, it, expect } from 'vitest'
import { ProductSchema, SupplierSchema } from '../schemas'
import type { FormState } from '../types'

describe('Schema Integration with FormState', () => {
  it('should format validation errors compatible with FormState', () => {
    const invalidProduct = {
      name: 'ab' // Too short
    }
    
    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      // Simulate how Server Actions would format errors for FormState
      const formState: FormState = {
        errors: result.error.flatten().fieldErrors,
        message: 'Validation failed. Please check your inputs.'
      }
      
      expect(formState.errors?.name).toBeDefined()
      expect(formState.errors?.name?.[0]).toBe('Product name must be at least 3 characters')
      expect(formState.message).toBe('Validation failed. Please check your inputs.')
    }
  })

  it('should handle multiple validation errors in SupplierSchema', () => {
    const invalidSupplier = {
      name: 'ab', // Too short
      tier: 4, // Invalid tier
      location: 'a', // Too short
      productId: 'invalid-uuid', // Invalid UUID
      parentSupplierId: null
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const formState: FormState = {
        errors: result.error.flatten().fieldErrors,
        message: 'Multiple validation errors occurred.'
      }
      
      // Check that multiple field errors are captured
      expect(formState.errors?.name).toBeDefined()
      expect(formState.errors?.tier).toBeDefined()
      expect(formState.errors?.location).toBeDefined()
      expect(formState.errors?.productId).toBeDefined()
      
      // Verify specific error messages
      expect(formState.errors?.name?.[0]).toBe('Supplier name must be at least 3 characters')
      expect(formState.errors?.tier?.[0]).toBe('Tier must be 1, 2, or 3')
      expect(formState.errors?.location?.[0]).toBe('Location must be at least 2 characters')
      expect(formState.errors?.productId?.[0]).toBe('Product ID must be a valid UUID')
    }
  })

  it('should handle successful validation with no errors', () => {
    const validProduct = {
      name: 'Valid Product Name'
    }
    
    const result = ProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
    
    if (result.success) {
      const formState: FormState = {
        errors: undefined,
        message: null
      }
      
      expect(formState.errors).toBeUndefined()
      expect(formState.message).toBeNull()
    }
  })

  it('should handle tier hierarchy validation errors correctly', () => {
    const invalidSupplier = {
      name: 'Test Supplier',
      tier: 2, // Tier 2 requires parent
      location: 'New York',
      productId: '123e4567-e89b-12d3-a456-426614174000',
      parentSupplierId: null // Missing required parent
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    
    if (!result.success) {
      const formState: FormState = {
        errors: result.error.flatten().fieldErrors,
        message: 'Supplier hierarchy validation failed.'
      }
      
      // The hierarchy error should be attached to parentSupplierId field
      expect(formState.errors?.parentSupplierId).toBeDefined()
      expect(formState.errors?.parentSupplierId?.[0]).toBe(
        'Tier 1 suppliers cannot have a parent. Tier 2 and 3 suppliers must have a parent supplier.'
      )
    }
  })
})