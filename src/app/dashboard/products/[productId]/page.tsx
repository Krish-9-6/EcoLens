import { notFound } from 'next/navigation'
import { requireAuthWithBrandId } from '<ecolens>/lib/auth'
import { fetchProductWithSuppliers } from '<ecolens>/lib/data'
import { ProductParamsSchema } from '<ecolens>/lib/schemas'
import { buildSupplierHierarchy } from '<ecolens>/lib/hierarchy'
import { SupplierTierColumn } from '<ecolens>/components/dashboard/SupplierTierColumn'
import { SupplierHierarchyTree } from '<ecolens>/components/dashboard/SupplierHierarchyTree'
import { SupplierHierarchyStats } from '<ecolens>/components/dashboard/SupplierHierarchyStats'
import { DashboardErrorBoundary } from '<ecolens>/components/dashboard/DashboardErrorBoundary'
import { NavigationBreadcrumb } from '<ecolens>/components/dashboard/NavigationBreadcrumb'
import { getServerSideErrorMessage } from '<ecolens>/lib/error-handling'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Badge } from '<ecolens>/components/ui/badge'
import { Button } from '<ecolens>/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '<ecolens>/components/ui/tabs'
import { ArrowLeft, Package, BarChart3, Network } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ProductDetailPageProps {
  params: Promise<{
    productId: string
  }>
}

/**
 * Product Detail Page - Supply chain management interface
 * Requirements: 2.1, 2.2, 2.3, 6.3, 6.4, 4.2, 4.3, 4.4, 4.5
 * 
 * Enhanced with comprehensive error handling and user-friendly error messages
 * Server Component that displays product details and associated suppliers
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params
  
  // Validate productId parameter
  const validatedParams = ProductParamsSchema.safeParse(resolvedParams)
  if (!validatedParams.success) {
    notFound()
  }

  const { productId } = validatedParams.data

  // Ensure user is authenticated and get their brand_id
  const brandId = await requireAuthWithBrandId()
  
  // Fetch product with all associated suppliers
  const productWithSuppliers = await fetchProductWithSuppliers(productId, brandId)
  
  if (!productWithSuppliers) {
    // Product not found - this should trigger the not-found page
    notFound()
  }

    // Build enhanced supplier hierarchy for visualization
    const supplierHierarchy = buildSupplierHierarchy(productWithSuppliers.suppliers)
    
    // Organize suppliers by tier for display (backward compatibility)
    const suppliersByTier = {
      1: supplierHierarchy.tiers[1].suppliers,
      2: supplierHierarchy.tiers[2].suppliers,
      3: supplierHierarchy.tiers[3].suppliers
    }

    return (
      <DashboardErrorBoundary 
        context="product-detail-page"
        showHomeButton={true}
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Navigation Breadcrumb */}
          <NavigationBreadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Products', href: '/dashboard/products' },
              { label: productWithSuppliers.name, current: true }
            ]}
          />
          
          {/* Navigation Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/products">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>

          {/* Product Information Card */}
          <DashboardErrorBoundary context="product-info-card">
            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-md shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Package className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">{productWithSuppliers.name}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Brand: {productWithSuppliers.brand.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {productWithSuppliers.suppliers.length} Supplier{productWithSuppliers.suppliers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                  <div>
                    <span className="font-medium text-white">Created:</span>{' '}
                    {formatDistanceToNow(new Date(productWithSuppliers.created_at), { addSuffix: true })}
                  </div>
                  <div>
                    <span className="font-medium text-white">Last Updated:</span>{' '}
                    {formatDistanceToNow(new Date(productWithSuppliers.updated_at), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardErrorBoundary>

          {/* Supply Chain Management Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Supply Chain Management</h2>
              <p className="text-slate-300">
                Manage your product&apos;s multi-tier supply chain relationships with enhanced hierarchy visualization
              </p>
            </div>

            {/* Hierarchy Statistics */}
            {productWithSuppliers.suppliers.length > 0 && (
              <DashboardErrorBoundary context="supplier-hierarchy-stats">
                <SupplierHierarchyStats hierarchy={supplierHierarchy} />
              </DashboardErrorBoundary>
            )}

            {/* Supply Chain Views */}
            <DashboardErrorBoundary context="supply-chain-views">
              <Tabs defaultValue="tiers" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tiers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Tier View</span>
                    <span className="sm:hidden">Tiers</span>
                  </TabsTrigger>
                  <TabsTrigger value="hierarchy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Network className="h-4 w-4" />
                    <span className="hidden sm:inline">Hierarchy Tree</span>
                    <span className="sm:hidden">Tree</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tier-based View */}
                <TabsContent value="tiers" className="space-y-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Tier 1 Suppliers */}
                    <DashboardErrorBoundary context="tier-1-suppliers">
                      <SupplierTierColumn
                        tier={1}
                        title="Tier 1 Suppliers"
                        description="Direct suppliers to your brand"
                        suppliers={suppliersByTier[1]}
                        productId={productId}
                        canAddSupplier={true}
                        parentSupplierId={null}
                      />
                    </DashboardErrorBoundary>

                    {/* Tier 2 Suppliers */}
                    <DashboardErrorBoundary context="tier-2-suppliers">
                      <SupplierTierColumn
                        tier={2}
                        title="Tier 2 Suppliers"
                        description="Suppliers to your Tier 1 suppliers"
                        suppliers={suppliersByTier[2]}
                        productId={productId}
                        canAddSupplier={suppliersByTier[1].length > 0}
                        parentSupplierId={null}
                        tier1Suppliers={suppliersByTier[1]}
                      />
                    </DashboardErrorBoundary>

                    {/* Tier 3 Suppliers */}
                    <DashboardErrorBoundary context="tier-3-suppliers">
                      <SupplierTierColumn
                        tier={3}
                        title="Tier 3 Suppliers"
                        description="Suppliers to your Tier 2 suppliers"
                        suppliers={suppliersByTier[3]}
                        productId={productId}
                        canAddSupplier={suppliersByTier[2].length > 0}
                        parentSupplierId={null}
                        tier2Suppliers={suppliersByTier[2]}
                      />
                    </DashboardErrorBoundary>
                  </div>
                </TabsContent>

                {/* Hierarchy Tree View */}
                <TabsContent value="hierarchy" className="space-y-4">
                  <DashboardErrorBoundary context="supplier-hierarchy-tree">
                    <SupplierHierarchyTree 
                      hierarchy={supplierHierarchy}
                      productId={productId}
                    />
                  </DashboardErrorBoundary>
                </TabsContent>
              </Tabs>
            </DashboardErrorBoundary>

            {/* Empty State for No Suppliers */}
            {productWithSuppliers.suppliers.length === 0 && (
              <Card className="border-dashed border-slate-600 bg-slate-900/50 backdrop-blur-md shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="mx-auto h-12 w-12 text-slate-400">
                    <Package className="h-full w-full" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">No suppliers yet</h3>
                  <p className="mt-2 text-center text-sm text-slate-300">
                    Start building your supply chain by adding your first Tier 1 supplier.
                    <br />
                    This will enable you to map the complete journey of your product.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardErrorBoundary>
    )
}