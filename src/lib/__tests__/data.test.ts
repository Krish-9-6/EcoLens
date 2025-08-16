import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDppData, isValidUuid } from '../data'
import type { DppData } from '../types'

// Mock the Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
}

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

// Mock the supabase module
vi.mock('../supabase', () => ({
  createServerClient: () => mockSupabaseClient,
}))

describe('fetchDppData', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Setup default mock chain
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      single: mockSingle,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const validProductId = '123e4567-e89b-12d3-a456-426614174000'
  const invalidProductId = 'invalid-uuid'

  const mockProductData = {
    id: validProductId,
    name: 'Test Product',
    image_url: 'https://example.com/image.jpg',
    brand_id: '456e7890-e89b-12d3-a456-426614174001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    brands: {
      id: '456e7890-e89b-12d3-a456-426614174001',
      name: 'Test Brand',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  }

  const mockSuppliersData = [
    {
      suppliers: {
        id: '789e0123-e89b-12d3-a456-426614174002',
        name: 'Test Supplier 1',
        tier: 3 as const,
        location: 'Test Location 1',
        latitude: 40.7128,
        longitude: -74.0060,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: [
          {
            id: 'cert-1',
            name: 'Test Certificate 1',
            type: 'Sustainability',
            issued_date: '2024-01-01',
            verified_at: '2024-01-02T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            ledger: [
              {
                id: 'ledger-1',
                data_hash: 'abc123hash',
                timestamp: '2024-01-02T00:00:00Z',
                created_at: '2024-01-02T00:00:00Z',
              },
            ],
          },
        ],
      },
    },
    {
      suppliers: {
        id: '789e0123-e89b-12d3-a456-426614174003',
        name: 'Test Supplier 2',
        tier: 1 as const,
        location: 'Test Location 2',
        latitude: null,
        longitude: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        certificates: [],
      },
    },
  ]

  it('should return null for invalid UUID format', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = await fetchDppData(invalidProductId)
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Invalid product ID format:', invalidProductId)
    expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('should return null when product is not found', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock product not found error
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Product not found:', validProductId)
    
    consoleSpy.mockRestore()
  })

  it('should return null and log error when database error occurs', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock database error
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST500', message: 'Database error' },
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching DPP data:', expect.objectContaining({
      productId: validProductId,
      error: 'Database error',
    }))
    
    consoleSpy.mockRestore()
  })

  it('should successfully fetch and transform DPP data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock successful product fetch
    mockSingle.mockResolvedValueOnce({
      data: mockProductData,
      error: null,
    })

    // Mock successful suppliers fetch
    const mockSuppliersSelect = vi.fn()
    const mockSuppliersEq = vi.fn()
    
    mockSupabaseClient.from
      .mockReturnValueOnce({
        select: mockSelect,
      })
      .mockReturnValueOnce({
        select: mockSuppliersSelect,
      })
    
    mockSuppliersSelect.mockReturnValue({
      eq: mockSuppliersEq,
    })
    
    mockSuppliersEq.mockResolvedValue({
      data: mockSuppliersData,
      error: null,
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).not.toBeNull()
    expect(result).toEqual({
      product: {
        ...mockProductData,
        brand: mockProductData.brands,
      },
      suppliers: [
        {
          ...mockSuppliersData[0].suppliers,
          certificates: [
            {
              ...mockSuppliersData[0].suppliers.certificates[0],
              ledger_entry: mockSuppliersData[0].suppliers.certificates[0].ledger[0],
            },
          ],
        },
        {
          ...mockSuppliersData[1].suppliers,
          certificates: [],
        },
      ],
    } as DppData)

    // Verify suppliers are sorted by tier (3 -> 1)
    expect(result!.suppliers[0].tier).toBe(3)
    expect(result!.suppliers[1].tier).toBe(1)
    
    expect(consoleSpy).toHaveBeenCalledWith(`Successfully fetched DPP data for product: ${validProductId}`)
    
    consoleSpy.mockRestore()
  })

  it('should handle suppliers with no certificates', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock successful product fetch
    mockSingle.mockResolvedValueOnce({
      data: mockProductData,
      error: null,
    })

    // Mock suppliers with no certificates
    const mockSuppliersWithNoCerts = [
      {
        suppliers: {
          ...mockSuppliersData[0].suppliers,
          certificates: null, // Test null certificates
        },
      },
    ]

    const mockSuppliersSelect = vi.fn()
    const mockSuppliersEq = vi.fn()
    
    mockSupabaseClient.from
      .mockReturnValueOnce({
        select: mockSelect,
      })
      .mockReturnValueOnce({
        select: mockSuppliersSelect,
      })
    
    mockSuppliersSelect.mockReturnValue({
      eq: mockSuppliersEq,
    })
    
    mockSuppliersEq.mockResolvedValue({
      data: mockSuppliersWithNoCerts,
      error: null,
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).not.toBeNull()
    expect(result!.suppliers[0].certificates).toEqual([])
    
    consoleSpy.mockRestore()
  })

  it('should handle certificates with no ledger entries', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock successful product fetch
    mockSingle.mockResolvedValueOnce({
      data: mockProductData,
      error: null,
    })

    // Mock suppliers with certificates but no ledger entries
    const mockSuppliersWithNoLedger = [
      {
        suppliers: {
          ...mockSuppliersData[0].suppliers,
          certificates: [
            {
              ...mockSuppliersData[0].suppliers.certificates[0],
              ledger: null, // No ledger entry
            },
          ],
        },
      },
    ]

    const mockSuppliersSelect = vi.fn()
    const mockSuppliersEq = vi.fn()
    
    mockSupabaseClient.from
      .mockReturnValueOnce({
        select: mockSelect,
      })
      .mockReturnValueOnce({
        select: mockSuppliersSelect,
      })
    
    mockSuppliersSelect.mockReturnValue({
      eq: mockSuppliersEq,
    })
    
    mockSuppliersEq.mockResolvedValue({
      data: mockSuppliersWithNoLedger,
      error: null,
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).not.toBeNull()
    expect(result!.suppliers[0].certificates[0].ledger_entry).toBeUndefined()
    
    consoleSpy.mockRestore()
  })

  it('should handle suppliers fetch error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock successful product fetch
    mockSingle.mockResolvedValueOnce({
      data: mockProductData,
      error: null,
    })

    // Mock suppliers fetch error
    const mockSuppliersSelect = vi.fn()
    const mockSuppliersEq = vi.fn()
    
    mockSupabaseClient.from
      .mockReturnValueOnce({
        select: mockSelect,
      })
      .mockReturnValueOnce({
        select: mockSuppliersSelect,
      })
    
    mockSuppliersSelect.mockReturnValue({
      eq: mockSuppliersEq,
    })
    
    mockSuppliersEq.mockResolvedValue({
      data: null,
      error: { message: 'Suppliers fetch error' },
    })

    const result = await fetchDppData(validProductId)
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching suppliers:', { message: 'Suppliers fetch error' })
    
    consoleSpy.mockRestore()
  })
})

describe('isValidUuid', () => {
  it('should return true for valid UUID', () => {
    const validUuids = [
      '123e4567-e89b-12d3-a456-426614174000',
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
    ]

    validUuids.forEach(uuid => {
      expect(isValidUuid(uuid)).toBe(true)
    })
  })

  it('should return false for invalid UUID', () => {
    const invalidUuids = [
      'invalid-uuid',
      '123e4567-e89b-12d3-a456',
      '123e4567-e89b-12d3-a456-426614174000-extra',
      '',
      '123e4567_e89b_12d3_a456_426614174000',
      'ggge4567-e89b-12d3-a456-426614174000',
    ]

    invalidUuids.forEach(uuid => {
      expect(isValidUuid(uuid)).toBe(false)
    })
  })
})