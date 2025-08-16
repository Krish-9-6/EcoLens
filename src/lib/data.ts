import { createClient } from '@supabase/supabase-js'
import type { Database, Product, ProductWithSuppliers, SupplierWithHierarchy, Supplier, DppData, ProductQueryResult } from './types'

// Create Supabase client for server-side operations
const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables. 
    NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}`)
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

/**
 * Fetches comprehensive DPP data for a product using a single optimized query
 * @param productId - The UUID of the product to fetch
 * @returns Promise<DppData | null> - Complete DPP data or null if not found
 */
export async function fetchDppData(productId: string): Promise<DppData | null> {
  // Validate productId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(productId)) {
    console.error('Invalid product ID format:', productId)
    return null
  }

  try {
    const supabase = createServerClient()

    // Single optimized query with joins to fetch all related data
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        image_url,
        brand_id,
        created_at,
        updated_at,
        brands!inner (
          id,
          name,
          created_at,
          updated_at
        )
      `)
      .eq('id', productId)
      .single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        // No rows returned - product not found
        console.log('Product not found:', productId)
        return null
      }
      throw productError
    }

    if (!productData) {
      console.log('No product data returned for:', productId)
      return null
    }

    // Fetch suppliers and their certificates with ledger entries
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('product_suppliers')
      .select(`
        suppliers!inner (
          id,
          name,
          tier,
          location,
          latitude,
          longitude,
          created_at,
          updated_at,
          certificates (
            id,
            name,
            type,
            issued_date,
            verified_at,
            created_at,
            updated_at,
            ledger (
              id,
              data_hash,
              timestamp,
              created_at
            )
          )
        )
      `)
      .eq('product_id', productId)

    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError)
      throw suppliersError
    }

    // Transform the data into the expected DPP structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suppliers = (suppliersData || []).map((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supplier = (item as any).suppliers
      return {
        ...supplier,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        certificates: (supplier.certificates || []).map((cert: any) => ({
          id: cert.id,
          supplier_id: supplier.id,
          name: cert.name,
          type: cert.type,
          issued_date: cert.issued_date,
          verified_at: cert.verified_at,
          created_at: cert.created_at,
          updated_at: cert.updated_at,
          ledger_entry: cert.ledger && cert.ledger.length > 0 ? {
            id: cert.ledger[0].id,
            certificate_id: cert.id,
            data_hash: cert.ledger[0].data_hash,
            timestamp: cert.ledger[0].timestamp,
            created_at: cert.ledger[0].created_at
          } : undefined
        }))
      }
    })

    // Sort suppliers by tier (Tier 3 -> Tier 2 -> Tier 1)
    suppliers.sort((a, b) => b.tier - a.tier)

    const dppData: DppData = {
      product: {
        ...productData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        brand: (productData as any).brands
      },
      suppliers
    }

    console.log(`Successfully fetched DPP data for product: ${productId}`)
    return dppData

  } catch (error) {
    console.error('Error fetching DPP data:', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
      fullError: error
    })
    
    // Return null for graceful UI handling
    return null
  }
}

/**
 * Validates if a string is a valid UUID format
 * @param uuid - String to validate
 * @returns boolean - True if valid UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Fetches a single product with all associated suppliers for dashboard management
 * @param productId - The UUID of the product to fetch
 * @param brandId - The UUID of the brand (for security validation)
 * @returns Promise<ProductWithSuppliers | null> - Product with suppliers or null if not found
 */
export async function fetchProductWithSuppliers(productId: string, brandId: string): Promise<ProductWithSuppliers | null> {
  // Validate productId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(productId) || !uuidRegex.test(brandId)) {
    console.error('Invalid ID format:', { productId, brandId })
    return null
  }

  try {
    const supabase = createServerClient()

    // Fetch product with brand information
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        image_url,
        brand_id,
        created_at,
        updated_at,
        brands!inner (
          id,
          name,
          created_at,
          updated_at
        )
      `)
      .eq('id', productId)
      .eq('brand_id', brandId)
      .single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        console.log('Product not found or access denied:', productId)
        return null
      }
      throw productError
    }

    if (!productData) {
      console.log('No product data returned for:', productId)
      return null
    }

    // Fetch all suppliers associated with this product
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('product_suppliers')
      .select(`
        suppliers!inner (
          id,
          name,
          tier,
          location,
          latitude,
          longitude,
          brand_id,
          parent_supplier_id,
          created_at,
          updated_at
        )
      `)
      .eq('product_id', productId)

    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError)
      throw suppliersError
    }

    // Transform suppliers data and build hierarchy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suppliers = (suppliersData || []).map((item: any) => item.suppliers as Supplier)
    
    // Build supplier hierarchy with parent-child relationships
    const suppliersWithHierarchy: SupplierWithHierarchy[] = suppliers.map(supplier => {
      const parent = suppliers.find(s => s.id === supplier.parent_supplier_id) || null
      const children = suppliers.filter(s => s.parent_supplier_id === supplier.id)
      
      return {
        ...supplier,
        parent,
        children: children.length > 0 ? children : undefined
      }
    })

    // Sort suppliers by tier for consistent display
    suppliersWithHierarchy.sort((a, b) => a.tier - b.tier)

    const productWithSuppliers: ProductWithSuppliers = {
      ...productData,
      brand: (productData as ProductQueryResult).brands,
      suppliers: suppliersWithHierarchy
    }

    console.log(`Successfully fetched product with suppliers: ${productId}`)
    return productWithSuppliers

  } catch (error) {
    console.error('Error fetching product with suppliers:', {
      productId,
      brandId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return null
  }
}

/**
 * Fetches all products for a specific brand (dashboard context)
 * @param brandId - The UUID of the brand to fetch products for
 * @returns Promise<Product[]> - Array of products belonging to the brand
 */
export async function fetchBrandProducts(brandId: string): Promise<Product[]> {
  // Validate brandId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(brandId)) {
    console.error('Invalid brand ID format:', brandId)
    return []
  }

  try {
    const supabase = createServerClient()

    // Fetch products for the specific brand
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching brand products:', error)
      throw error
    }

    console.log(`Successfully fetched ${products?.length || 0} products for brand: ${brandId}`)
    return products || []

  } catch (error) {
    console.error('Error fetching brand products:', {
      brandId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // Return empty array for graceful UI handling
    return []
  }
}

