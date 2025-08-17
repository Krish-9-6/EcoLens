import { createClient } from '@supabase/supabase-js'
import type { Database, Product, ProductWithSuppliers, SupplierWithHierarchy, Supplier, DppData, ProductQueryResult, DashboardAnalytics } from './types'

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
        sku,
        description,
        care_instructions,
        end_of_life_options,
        material_composition,
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
        sku,
        description,
        care_instructions,
        end_of_life_options,
        material_composition,
        created_at,
        updated_at
      `)
      .eq('id', productId)
      .eq('brand_id', brandId)
      .single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        console.log('Product not found or access denied:', productId)
        return null
      }
      console.error('Product query error:', productError)
      throw productError
    }

    if (!productData) {
      console.log('No product data returned for:', productId)
      return null
    }

    // Fetch brand information separately to avoid join issues
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('id, name, created_at, updated_at')
      .eq('id', productData.brand_id)
      .single()

    if (brandError) {
      console.error('Error fetching brand data:', brandError)
      throw brandError
    }

    if (!brandData) {
      console.error('Brand not found for product:', productId)
      throw new Error('Brand not found')
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
      // Don't throw error for suppliers - product can exist without suppliers
      console.warn('Continuing without suppliers due to error')
    }

    // Transform suppliers data and build hierarchy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suppliers = (suppliersData || []).map((item: any) => item.suppliers as Supplier).filter(Boolean)
    
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
      brand: brandData,
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
 * Fetches all products for a specific brand with supplier counts (dashboard context)
 * @param brandId - The UUID of the brand to fetch products for
 * @returns Promise<Array<Product & { supplierCount: number }>> - Array of products with supplier counts
 */
export async function fetchBrandProducts(brandId: string): Promise<Array<Product & { supplierCount: number }>> {
  // Validate brandId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(brandId)) {
    console.error('Invalid brand ID format:', brandId)
    return []
  }

  try {
    const supabase = createServerClient()

    // Fetch products with supplier counts for the specific brand
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_suppliers!inner (
          supplier_id
        )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Error fetching brand products:', productsError)
      throw productsError
    }

    // Transform the data to include supplier counts
    const productsWithSupplierCounts = (products || []).map(product => ({
      ...product,
      supplierCount: product.product_suppliers?.length || 0
    }))

    console.log(`Successfully fetched ${productsWithSupplierCounts.length} products with supplier counts for brand: ${brandId}`)
    return productsWithSupplierCounts

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

/**
 * Fetches comprehensive dashboard analytics for a brand
 * @param brandId - The UUID of the brand to fetch analytics for
 * @returns Promise<DashboardAnalytics> - Complete dashboard analytics data
 */
export async function fetchDashboardAnalytics(brandId: string): Promise<DashboardAnalytics> {
  // Validate brandId format (basic UUID validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(brandId)) {
    console.error('Invalid brand ID format:', brandId)
    throw new Error('Invalid brand ID format')
  }

  try {
    const supabase = createServerClient()

    // Fetch all data in parallel for maximum efficiency
    const [productCountResult, supplierCountResult, recentProductsResult, tierDistributionResult] = await Promise.all([
      // Product count
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId),
      
      // Supplier count
      supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId),
      
      // Recent products (5 most recent)
      supabase
        .from('products')
        .select('id, name')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Supplier tier distribution
      supabase
        .from('suppliers')
        .select('tier')
        .eq('brand_id', brandId)
    ])

    // Handle errors
    if (productCountResult.error) throw productCountResult.error
    if (supplierCountResult.error) throw supplierCountResult.error
    if (recentProductsResult.error) throw recentProductsResult.error
    if (tierDistributionResult.error) throw tierDistributionResult.error

    // Process tier distribution data
    const tierCounts = tierDistributionResult.data?.reduce((acc, supplier) => {
      acc[supplier.tier] = (acc[supplier.tier] || 0) + 1
      return acc
    }, {} as Record<number, number>) || {}

    // Convert to array format for chart component
    const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
      tier: parseInt(tier),
      count
    })).sort((a, b) => a.tier - b.tier)

    const analytics: DashboardAnalytics = {
      productCount: productCountResult.count || 0,
      supplierCount: supplierCountResult.count || 0,
      recentProducts: recentProductsResult.data || [],
      tierDistribution
    }

    console.log(`Successfully fetched dashboard analytics for brand: ${brandId}`)
    return analytics

  } catch (error) {
    console.error('Error fetching dashboard analytics:', {
      brandId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    throw error
  }
}

