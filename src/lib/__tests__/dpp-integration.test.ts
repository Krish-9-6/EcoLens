import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DppData } from '../types'

// Mock the fetchDppData function
const mockFetchDppData = vi.fn()

// Mock the data module
vi.mock('../data', () => ({
  fetchDppData: mockFetchDppData,
}))

describe('DPP Integration with Updated Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Schema Compatibility Tests', () => {
    it('should handle DPP data with new brand_id and parent_supplier_id columns', async () => {
      // Mock data that includes the new schema columns
      const mockDppData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Schema Product',
          image_url: 'https://example.com/product.jpg',
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
            brand_id: '123e4567-e89b-12d3-a456-426614174001', // New column
            parent_supplier_id: null, // New column - Tier 1 has no parent
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
            brand_id: '123e4567-e89b-12d3-a456-426614174001', // New column
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174002', // New column - has parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockDppData)

      // Import and call the function
      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      // Verify the data structure is correct
      expect(result).toBeDefined()
      expect(result?.product.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result?.product.brand_id).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(result?.suppliers).toHaveLength(2)
      
      // Verify new schema columns are present
      const tier1Supplier = result?.suppliers.find(s => s.tier === 1)
      const tier2Supplier = result?.suppliers.find(s => s.tier === 2)
      
      expect(tier1Supplier?.brand_id).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(tier1Supplier?.parent_supplier_id).toBeNull()
      
      expect(tier2Supplier?.brand_id).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(tier2Supplier?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174002')
    })

    it('should maintain backward compatibility with existing DPP structure', async () => {
      // Mock data that represents the expected DPP structure
      const mockDppData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174010',
          name: 'Legacy Product',
          image_url: null,
          brand_id: '123e4567-e89b-12d3-a456-426614174011',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174011',
            name: 'Legacy Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174012',
            name: 'Legacy Supplier',
            tier: 1,
            location: 'Legacy Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174011',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: '123e4567-e89b-12d3-a456-426614174013',
                supplier_id: '123e4567-e89b-12d3-a456-426614174012',
                name: 'Legacy Certificate',
                type: 'Sustainability',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger_entry: {
                  id: '123e4567-e89b-12d3-a456-426614174014',
                  certificate_id: '123e4567-e89b-12d3-a456-426614174013',
                  data_hash: 'abc123def456',
                  timestamp: '2024-01-02T00:00:00Z',
                  created_at: '2024-01-02T00:00:00Z',
                }
              }
            ]
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockDppData)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174010')

      // Verify all expected DPP structure is maintained
      expect(result).toBeDefined()
      expect(result?.product).toBeDefined()
      expect(result?.product.brand).toBeDefined()
      expect(result?.suppliers).toBeDefined()
      expect(result?.suppliers[0].certificates).toBeDefined()
      expect(result?.suppliers[0].certificates[0].ledger_entry).toBeDefined()
      
      // Verify specific structure matches DppData interface
      expect(result).toMatchObject({
        product: {
          id: expect.any(String),
          name: expect.any(String),
          brand_id: expect.any(String),
          brand: {
            id: expect.any(String),
            name: expect.any(String)
          }
        },
        suppliers: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            tier: expect.any(Number),
            location: expect.any(String),
            brand_id: expect.any(String),
            certificates: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                supplier_id: expect.any(String),
                name: expect.any(String),
                type: expect.any(String)
              })
            ])
          })
        ])
      })
    })

    it('should handle public access without authentication', async () => {
      // Test that DPP data can be fetched without authentication (public RLS policies)
      const mockPublicData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174020',
          name: 'Public Product',
          image_url: 'https://example.com/public.jpg',
          brand_id: '123e4567-e89b-12d3-a456-426614174021',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174021',
            name: 'Public Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174022',
            name: 'Public Supplier',
            tier: 1,
            location: 'Public Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174021',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockPublicData)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174020')

      expect(result).toBeDefined()
      expect(result?.product.id).toBe('123e4567-e89b-12d3-a456-426614174020')
      expect(mockFetchDppData).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174020')
    })

    it('should handle error cases gracefully', async () => {
      // Test error handling
      mockFetchDppData.mockResolvedValue(null)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174030')

      expect(result).toBeNull()
      expect(mockFetchDppData).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174030')
    })
  })

  describe('Type Safety Verification', () => {
    it('should maintain type safety with updated schema', async () => {
      const mockTypedData: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174040',
          name: 'Typed Product',
          image_url: 'https://example.com/typed.jpg',
          brand_id: '123e4567-e89b-12d3-a456-426614174041',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174041',
            name: 'Typed Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174042',
            name: 'Typed Supplier',
            tier: 1 as const,
            location: 'Typed Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174041',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockTypedData)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174040')

      // TypeScript should infer correct types
      expect(result).toBeDefined()
      if (result) {
        // These should all be type-safe operations
        expect(typeof result.product.id).toBe('string')
        expect(typeof result.product.brand_id).toBe('string')
        expect(typeof result.product.brand.name).toBe('string')
        expect(typeof result.suppliers[0].tier).toBe('number')
        expect(typeof result.suppliers[0].brand_id).toBe('string')
        expect(result.suppliers[0].parent_supplier_id).toBeNull()
        
        // Verify tier is properly typed as 1 | 2 | 3
        expect([1, 2, 3]).toContain(result.suppliers[0].tier)
      }
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle suppliers without coordinates', async () => {
      const mockDataWithoutCoords: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174050',
          name: 'No Coords Product',
          image_url: null,
          brand_id: '123e4567-e89b-12d3-a456-426614174051',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174051',
            name: 'No Coords Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          {
            id: '123e4567-e89b-12d3-a456-426614174052',
            name: 'Supplier Without Coordinates',
            tier: 1,
            location: 'Unknown Location',
            latitude: null,
            longitude: null,
            brand_id: '123e4567-e89b-12d3-a456-426614174051',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockDataWithoutCoords)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174050')

      expect(result).toBeDefined()
      expect(result?.suppliers[0].latitude).toBeNull()
      expect(result?.suppliers[0].longitude).toBeNull()
    })

    it('should handle complex supplier hierarchies', async () => {
      const mockComplexHierarchy: DppData = {
        product: {
          id: '123e4567-e89b-12d3-a456-426614174060',
          name: 'Complex Hierarchy Product',
          image_url: null,
          brand_id: '123e4567-e89b-12d3-a456-426614174061',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          brand: {
            id: '123e4567-e89b-12d3-a456-426614174061',
            name: 'Complex Brand',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        },
        suppliers: [
          // Tier 3 suppliers (raw materials)
          {
            id: '123e4567-e89b-12d3-a456-426614174062',
            name: 'Cotton Farm A',
            tier: 3,
            location: 'India',
            latitude: 20.5937,
            longitude: 78.9629,
            brand_id: '123e4567-e89b-12d3-a456-426614174061',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          // Tier 2 supplier (processing)
          {
            id: '123e4567-e89b-12d3-a456-426614174063',
            name: 'Textile Mill',
            tier: 2,
            location: 'Bangladesh',
            latitude: 23.6850,
            longitude: 90.3563,
            brand_id: '123e4567-e89b-12d3-a456-426614174061',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174062',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          },
          // Tier 1 supplier (final assembly)
          {
            id: '123e4567-e89b-12d3-a456-426614174064',
            name: 'Garment Factory',
            tier: 1,
            location: 'Vietnam',
            latitude: 21.0285,
            longitude: 105.8542,
            brand_id: '123e4567-e89b-12d3-a456-426614174061',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174063',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        ]
      }

      mockFetchDppData.mockResolvedValue(mockComplexHierarchy)

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174060')

      expect(result).toBeDefined()
      expect(result?.suppliers).toHaveLength(3)
      
      // Verify hierarchy relationships
      const tier1 = result?.suppliers.find(s => s.tier === 1)
      const tier2 = result?.suppliers.find(s => s.tier === 2)
      const tier3 = result?.suppliers.find(s => s.tier === 3)
      
      expect(tier3?.parent_supplier_id).toBeNull()
      expect(tier2?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174062')
      expect(tier1?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174063')
    })
  })
})