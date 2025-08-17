import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DppData } from '../types'

// Mock the entire data module
const mockFetchDppData = vi.fn()
vi.mock('../data', () => ({
  fetchDppData: mockFetchDppData,
}))

describe('DPP Compatibility with Updated Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Schema Compatibility', () => {
    it('should handle suppliers table with new brand_id column', async () => {
      const mockDppData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Product',
          image_url: 'https://example.com/image.jpg',
          brand_id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Test Supplier',
            tier: 1,
            location: 'Test Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174001', // New column
            parent_supplier_id: null, // New column
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockDppData)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.product.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result?.suppliers).toHaveLength(1)
      expect(result?.suppliers[0].brand_id).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(result?.suppliers[0].parent_supplier_id).toBeNull()
    })

    it('should handle supplier hierarchy with parent_supplier_id', async () => {
      const mockDppData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Product',
          image_url: null,
          brand_id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Tier 1 Supplier',
            tier: 1,
            location: 'Vietnam',
            latitude: 21.0285,
            longitude: 105.8542,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: null, // Tier 1 has no parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Tier 2 Supplier',
            tier: 2,
            location: 'Bangladesh',
            latitude: 23.6850,
            longitude: 90.3563,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174002', // Tier 2 has Tier 1 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Tier 3 Supplier',
            tier: 3,
            location: 'India',
            latitude: 20.5937,
            longitude: 78.9629,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174003', // Tier 3 has Tier 2 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockDppData)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.suppliers).toHaveLength(3)
      
      // Verify hierarchy structure
      const tier1 = result?.suppliers.find(s => s.tier === 1)
      const tier2 = result?.suppliers.find(s => s.tier === 2)
      const tier3 = result?.suppliers.find(s => s.tier === 3)

      expect(tier1?.parent_supplier_id).toBeNull()
      expect(tier2?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174002')
      expect(tier3?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174003')
    })

    it('should maintain backward compatibility with existing DPP data structure', async () => {
      const mockProductData = {
        id: 'product-123',
        name: 'Legacy Product',
        image_url: 'https://example.com/legacy.jpg',
        brand_id: 'brand-456',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: 'brand-456',
          name: 'Legacy Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      const mockSuppliersData = [
        {
          suppliers: {
            id: 'supplier-1',
            name: 'Legacy Supplier',
            tier: 1,
            location: 'Legacy Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: 'brand-456',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: 'cert-1',
                name: 'Legacy Certificate',
                type: 'Sustainability',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger: [
                  {
                    id: 'ledger-1',
                    data_hash: 'abc123',
                    timestamp: '2024-01-02T00:00:00Z',
                    created_at: '2024-01-02T00:00:00Z',
                  }
                ]
              }
            ]
          }
        }
      ]

      // Mock the queries
      mockSingle.mockResolvedValueOnce({
        data: mockProductData,
        error: null
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      const result = await fetchDppData('product-123')

      // Verify the result matches expected DppData structure
      expect(result).toBeDefined()
      expect(result).toMatchObject({
        product: {
          id: 'product-123',
          name: 'Legacy Product',
          image_url: 'https://example.com/legacy.jpg',
          brand_id: 'brand-456',
          brand: {
            id: 'brand-456',
            name: 'Legacy Brand'
          }
        },
        suppliers: [
          {
            id: 'supplier-1',
            name: 'Legacy Supplier',
            tier: 1,
            location: 'Legacy Location',
            certificates: [
              {
                id: 'cert-1',
                supplier_id: 'supplier-1', // Should be added by transformation
                name: 'Legacy Certificate',
                type: 'Sustainability',
                verified_at: '2024-01-02T00:00:00Z',
                ledger_entry: {
                  id: 'ledger-1',
                  certificate_id: 'cert-1',
                  data_hash: 'abc123'
                }
              }
            ]
          }
        ]
      })
    })
  })

  describe('Public RLS Policy Compatibility', () => {
    it('should work with public read access policies', async () => {
      // This test verifies that the DPP data fetching works with public RLS policies
      // The actual RLS testing would be done at the database level
      
      const mockProductData = {
        id: 'public-product',
        name: 'Public Product',
        image_url: null,
        brand_id: 'brand-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: 'brand-123',
          name: 'Public Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      // Mock successful public access
      mockSingle.mockResolvedValueOnce({
        data: mockProductData,
        error: null
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const result = await fetchDppData('public-product')

      expect(result).toBeDefined()
      expect(result?.product.id).toBe('public-product')
      
      // Verify that the query was made without authentication context
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('product_suppliers')
    })

    it('should handle RLS policy errors gracefully', async () => {
      // Mock RLS policy denial
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'No rows returned'
        }
      })

      const result = await fetchDppData('restricted-product')

      expect(result).toBeNull()
    })
  })

  describe('Error Handling with New Schema', () => {
    it('should handle missing brand_id gracefully', async () => {
      const mockProductData = {
        id: 'product-123',
        name: 'Test Product',
        image_url: null,
        brand_id: null, // Missing brand_id
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: null
      }

      mockSingle.mockResolvedValueOnce({
        data: mockProductData,
        error: null
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const result = await fetchDppData('product-123')

      // Should still return data but with null brand
      expect(result).toBeDefined()
      expect(result?.product.brand_id).toBeNull()
    })

    it('should handle suppliers with invalid parent_supplier_id', async () => {
      const mockProductData = {
        id: 'product-123',
        name: 'Test Product',
        image_url: null,
        brand_id: 'brand-456',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: 'brand-456',
          name: 'Test Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      const mockSuppliersData = [
        {
          suppliers: {
            id: 'supplier-1',
            name: 'Test Supplier',
            tier: 2,
            location: 'Test Location',
            latitude: null,
            longitude: null,
            brand_id: 'brand-456',
            parent_supplier_id: 'non-existent-parent', // Invalid parent reference
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        }
      ]

      mockSingle.mockResolvedValueOnce({
        data: mockProductData,
        error: null
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      const result = await fetchDppData('product-123')

      // Should still return data with the invalid parent reference
      expect(result).toBeDefined()
      expect(result?.suppliers[0].parent_supplier_id).toBe('non-existent-parent')
    })
  })

  describe('Type Safety with Updated Schema', () => {
    it('should maintain type safety with new columns', async () => {
      const mockProductData = {
        id: 'product-123',
        name: 'Typed Product',
        image_url: 'https://example.com/typed.jpg',
        brand_id: 'brand-456',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: 'brand-456',
          name: 'Typed Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      const mockSuppliersData = [
        {
          suppliers: {
            id: 'supplier-1',
            name: 'Typed Supplier',
            tier: 1 as const,
            location: 'Typed Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: 'brand-456',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        }
      ]

      mockSingle.mockResolvedValueOnce({
        data: mockProductData,
        error: null
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      const result = await fetchDppData('product-123')

      // TypeScript should infer correct types
      expect(result).toBeDefined()
      if (result) {
        // These should all be type-safe
        expect(typeof result.product.id).toBe('string')
        expect(typeof result.product.brand_id).toBe('string')
        expect(typeof result.suppliers[0].tier).toBe('number')
        expect(typeof result.suppliers[0].brand_id).toBe('string')
        expect(result.suppliers[0].parent_supplier_id).toBeNull()
      }
    })
  })
})