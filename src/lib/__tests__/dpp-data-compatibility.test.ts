import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DppData } from '../types'

// Mock Supabase client with proper query structure
const mockSupabaseClient = {
  from: vi.fn(),
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

// Mock the Supabase client creation
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('DPP Data Fetching Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Database Query Compatibility', () => {
    it('should handle product queries with updated schema', async () => {
      // Mock product data with new schema structure
      const mockProductData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        image_url: 'https://example.com/test.jpg',
        brand_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      // Mock suppliers data with new columns
      const mockSuppliersData = [
        {
          suppliers: {
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
        }
      ]

      // Set up mock chain for products query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProductData,
              error: null
            })
          })
        })
      })

      // Set up mock chain for suppliers query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      // Import and test the function
      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.product.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result?.suppliers).toHaveLength(1)
      expect(result?.suppliers[0].brand_id).toBe('123e4567-e89b-12d3-a456-426614174001')
      expect(result?.suppliers[0].parent_supplier_id).toBeNull()

      // Verify the correct queries were made
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('product_suppliers')
    })

    it('should handle supplier hierarchy queries correctly', async () => {
      const mockProductData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Hierarchy Test Product',
        image_url: null,
        brand_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      // Mock hierarchical supplier data
      const mockSuppliersData = [
        {
          suppliers: {
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
          }
        },
        {
          suppliers: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Tier 2 Supplier',
            tier: 2,
            location: 'Bangladesh',
            latitude: 23.6850,
            longitude: 90.3563,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174002', // Has Tier 1 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        },
        {
          suppliers: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Tier 3 Supplier',
            tier: 3,
            location: 'India',
            latitude: 20.5937,
            longitude: 78.9629,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: '123e4567-e89b-12d3-a456-426614174003', // Has Tier 2 parent
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        }
      ]

      // Set up mocks
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProductData,
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.suppliers).toHaveLength(3)

      // Verify hierarchy is correctly processed
      const tier1 = result?.suppliers.find(s => s.tier === 1)
      const tier2 = result?.suppliers.find(s => s.tier === 2)
      const tier3 = result?.suppliers.find(s => s.tier === 3)

      expect(tier1?.parent_supplier_id).toBeNull()
      expect(tier2?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174002')
      expect(tier3?.parent_supplier_id).toBe('123e4567-e89b-12d3-a456-426614174003')

      // Verify suppliers are sorted by tier (descending: 3 -> 2 -> 1)
      expect(result?.suppliers[0].tier).toBe(3)
      expect(result?.suppliers[1].tier).toBe(2)
      expect(result?.suppliers[2].tier).toBe(1)
    })

    it('should handle certificates with ledger entries correctly', async () => {
      const mockProductData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Certificate Test Product',
        image_url: null,
        brand_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      const mockSuppliersData = [
        {
          suppliers: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Certified Supplier',
            tier: 1,
            location: 'Test Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: [
              {
                id: '123e4567-e89b-12d3-a456-426614174003',
                name: 'Test Certificate',
                type: 'Sustainability',
                issued_date: '2024-01-01',
                verified_at: '2024-01-02T00:00:00Z',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                ledger: [
                  {
                    id: '123e4567-e89b-12d3-a456-426614174004',
                    data_hash: 'abc123def456',
                    timestamp: '2024-01-02T00:00:00Z',
                    created_at: '2024-01-02T00:00:00Z',
                  }
                ]
              }
            ]
          }
        }
      ]

      // Set up mocks
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProductData,
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockSuppliersData,
            error: null
          })
        })
      })

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.suppliers[0].certificates).toHaveLength(1)
      
      const certificate = result?.suppliers[0].certificates[0]
      expect(certificate?.id).toBe('123e4567-e89b-12d3-a456-426614174003')
      expect(certificate?.supplier_id).toBe('123e4567-e89b-12d3-a456-426614174002')
      expect(certificate?.ledger_entry).toBeDefined()
      expect(certificate?.ledger_entry?.data_hash).toBe('abc123def456')
      expect(certificate?.ledger_entry?.certificate_id).toBe('123e4567-e89b-12d3-a456-426614174003')
    })
  })

  describe('Error Handling with Updated Schema', () => {
    it('should handle product not found gracefully', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows returned' }
            })
          })
        })
      })

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST301', message: 'Database error' }
            })
          })
        })
      })

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeNull()
    })

    it('should handle invalid UUID format', async () => {
      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('invalid-uuid')

      expect(result).toBeNull()
    })

    it('should handle missing environment variables', async () => {
      // Temporarily remove environment variables
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const { fetchDppData } = await import('../data')
      
      // Should return null for missing environment variables (graceful error handling)
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')
      expect(result).toBeNull()
    })
  })

  describe('Public Access Compatibility', () => {
    it('should work with public RLS policies', async () => {
      // Mock data that would be accessible via public RLS policies
      const mockPublicProductData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Public Product',
        image_url: 'https://example.com/public.jpg',
        brand_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Public Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      const mockPublicSuppliersData = [
        {
          suppliers: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Public Supplier',
            tier: 1,
            location: 'Public Location',
            latitude: 40.7128,
            longitude: -74.0060,
            brand_id: '123e4567-e89b-12d3-a456-426614174001',
            parent_supplier_id: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            certificates: []
          }
        }
      ]

      // Set up mocks for public access
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockPublicProductData,
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockPublicSuppliersData,
            error: null
          })
        })
      })

      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBeDefined()
      expect(result?.product.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(result?.suppliers).toHaveLength(1)
      
      // Verify that the Supabase client was created without authentication
      // (this would be handled by the public RLS policies)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('product_suppliers')
    })
  })

  describe('Performance with Updated Schema', () => {
    it('should handle large datasets efficiently', async () => {
      const mockProductData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Performance Test Product',
        image_url: null,
        brand_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        brands: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Performance Brand',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }
      }

      // Create a large dataset of suppliers
      const mockLargeSuppliersData = Array.from({ length: 100 }, (_, index) => ({
        suppliers: {
          id: `123e4567-e89b-12d3-a456-42661417${String(index).padStart(4, '0')}`,
          name: `Supplier ${index}`,
          tier: ((index % 3) + 1) as 1 | 2 | 3,
          location: `Location ${index}`,
          latitude: 40.7128 + (index * 0.01),
          longitude: -74.0060 + (index * 0.01),
          brand_id: '123e4567-e89b-12d3-a456-426614174001',
          parent_supplier_id: index > 0 ? `123e4567-e89b-12d3-a456-42661417${String(index - 1).padStart(4, '0')}` : null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          certificates: []
        }
      }))

      // Set up mocks
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProductData,
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockLargeSuppliersData,
            error: null
          })
        })
      })

      const startTime = performance.now()
      const { fetchDppData } = await import('../data')
      const result = await fetchDppData('123e4567-e89b-12d3-a456-426614174000')
      const endTime = performance.now()

      expect(result).toBeDefined()
      expect(result?.suppliers).toHaveLength(100)
      
      // Should process large datasets efficiently (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      
      // Verify sorting still works with large datasets
      const sortedTiers = result?.suppliers.map(s => s.tier)
      const expectedSortedTiers = [...(sortedTiers || [])].sort((a, b) => b - a)
      expect(sortedTiers).toEqual(expectedSortedTiers)
    })
  })
})