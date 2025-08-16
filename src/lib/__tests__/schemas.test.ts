import { describe, it, expect } from 'vitest'
import { 
  ProductSchema, 
  SupplierSchema, 
  UUIDSchema, 
  OptionalUUIDSchema,
  ProductParamsSchema,
  SupplierParamsSchema,
  ProductSupplierSchema
} from '../schemas'

describe('ProductSchema', () => {
  it('should validate valid product data', () => {
    const validProduct = {
      name: 'Test Product'
    }
    
    const result = ProductSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('should reject product name shorter than 3 characters', () => {
    const invalidProduct = {
      name: 'ab'
    }
    
    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Product name must be at least 3 characters')
    }
  })

  it('should reject empty or whitespace-only product names', () => {
    const invalidProduct = {
      name: '   '
    }
    
    const result = ProductSchema.safeParse(invalidProduct)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Product name cannot be empty or only whitespace')
    }
  })

  it('should trim whitespace from product names', () => {
    const productWithWhitespace = {
      name: '  Test Product  '
    }
    
    const result = ProductSchema.safeParse(productWithWhitespace)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Product')
    }
  })
})

describe('SupplierSchema', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000'
  const parentUUID = '987fcdeb-51a2-43d1-b123-456789abcdef'

  it('should validate valid Tier 1 supplier (no parent)', () => {
    const validSupplier = {
      name: 'Test Supplier',
      tier: 1,
      location: 'New York',
      productId: validUUID,
      parentSupplierId: null
    }
    
    const result = SupplierSchema.safeParse(validSupplier)
    expect(result.success).toBe(true)
  })

  it('should validate valid Tier 2 supplier (with parent)', () => {
    const validSupplier = {
      name: 'Test Supplier',
      tier: 2,
      location: 'New York',
      productId: validUUID,
      parentSupplierId: parentUUID
    }
    
    const result = SupplierSchema.safeParse(validSupplier)
    expect(result.success).toBe(true)
  })

  it('should reject Tier 1 supplier with parent', () => {
    const invalidSupplier = {
      name: 'Test Supplier',
      tier: 1,
      location: 'New York',
      productId: validUUID,
      parentSupplierId: parentUUID
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tier 1 suppliers cannot have a parent. Tier 2 and 3 suppliers must have a parent supplier.')
    }
  })

  it('should reject Tier 2 supplier without parent', () => {
    const invalidSupplier = {
      name: 'Test Supplier',
      tier: 2,
      location: 'New York',
      productId: validUUID,
      parentSupplierId: null
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tier 1 suppliers cannot have a parent. Tier 2 and 3 suppliers must have a parent supplier.')
    }
  })

  it('should reject invalid tier values', () => {
    const invalidSupplier = {
      name: 'Test Supplier',
      tier: 4,
      location: 'New York',
      productId: validUUID,
      parentSupplierId: null
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tier must be 1, 2, or 3')
    }
  })

  it('should reject invalid UUID formats', () => {
    const invalidSupplier = {
      name: 'Test Supplier',
      tier: 1,
      location: 'New York',
      productId: 'invalid-uuid',
      parentSupplierId: null
    }
    
    const result = SupplierSchema.safeParse(invalidSupplier)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Product ID must be a valid UUID')
    }
  })

  it('should coerce string tier to number', () => {
    const supplierWithStringTier = {
      name: 'Test Supplier',
      tier: '2',
      location: 'New York',
      productId: validUUID,
      parentSupplierId: parentUUID
    }
    
    const result = SupplierSchema.safeParse(supplierWithStringTier)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tier).toBe(2)
      expect(typeof result.data.tier).toBe('number')
    }
  })
})

describe('UUIDSchema', () => {
  it('should validate valid UUID', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000'
    const result = UUIDSchema.safeParse(validUUID)
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUID', () => {
    const invalidUUID = 'not-a-uuid'
    const result = UUIDSchema.safeParse(invalidUUID)
    expect(result.success).toBe(false)
  })
})

describe('OptionalUUIDSchema', () => {
  it('should validate valid UUID', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000'
    const result = OptionalUUIDSchema.safeParse(validUUID)
    expect(result.success).toBe(true)
  })

  it('should accept null values', () => {
    const result = OptionalUUIDSchema.safeParse(null)
    expect(result.success).toBe(true)
  })

  it('should accept undefined values', () => {
    const result = OptionalUUIDSchema.safeParse(undefined)
    expect(result.success).toBe(true)
  })
})

describe('ProductParamsSchema', () => {
  it('should validate valid product params', () => {
    const validParams = {
      productId: '123e4567-e89b-12d3-a456-426614174000'
    }
    
    const result = ProductParamsSchema.safeParse(validParams)
    expect(result.success).toBe(true)
  })

  it('should reject invalid product params', () => {
    const invalidParams = {
      productId: 'invalid-uuid'
    }
    
    const result = ProductParamsSchema.safeParse(invalidParams)
    expect(result.success).toBe(false)
  })
})

describe('ProductSupplierSchema', () => {
  it('should validate valid product-supplier relationship', () => {
    const validRelation = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      supplierId: '987fcdeb-51a2-43d1-b123-456789abcdef'
    }
    
    const result = ProductSupplierSchema.safeParse(validRelation)
    expect(result.success).toBe(true)
  })

  it('should reject invalid UUIDs in relationship', () => {
    const invalidRelation = {
      productId: 'invalid-uuid',
      supplierId: '987fcdeb-51a2-43d1-b123-456789abcdef'
    }
    
    const result = ProductSupplierSchema.safeParse(invalidRelation)
    expect(result.success).toBe(false)
  })
})