import { requireAuthWithBrandId } from '<ecolens>/lib/auth'
import { fetchBrandProducts } from '<ecolens>/lib/data'
import { ProductsTable } from '<ecolens>/components/dashboard/ProductsTable'
import { CreateProductDialog } from '<ecolens>/components/dashboard/CreateProductDialog'
import { DashboardErrorBoundary } from '<ecolens>/components/dashboard/DashboardErrorBoundary'
import { NavigationBreadcrumb } from '<ecolens>/components/dashboard/NavigationBreadcrumb'
import { ErrorMessage, getUserFriendlyErrorMessage } from '<ecolens>/components/dashboard/ErrorMessage'
import { Button } from '<ecolens>/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Plus, Package, TrendingUp, Shield } from 'lucide-react'

/**
 * Products Dashboard Page - Main listing of brand products
 * Requirements: 1.1, 6.1, 6.2, 6.5, 4.2, 4.3, 4.4, 4.5
 * 
 * Enhanced with comprehensive error handling and user-friendly error messages
 * Server Component that displays all products for the authenticated brand
 */
export default async function ProductsPage() {
  try {
    // Ensure user is authenticated and get their brand_id
    const brandId = await requireAuthWithBrandId()
    
    // Fetch products for the current brand
    const products = await fetchBrandProducts(brandId)

    return (
      <DashboardErrorBoundary 
        context="products-page"
        showHomeButton={false}
        showBackButton={false}
      >
        <div className="space-y-8">
          {/* Navigation Breadcrumb */}
          <NavigationBreadcrumb />
          
          {/* Page Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">Products</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Manage your brand&apos;s products and their supply chains with blockchain-verified transparency
                </p>
              </div>
              
              {/* Create Product Button */}
              <DashboardErrorBoundary context="create-product-dialog">
                <CreateProductDialog>
                  <Button size="lg" className="font-heading font-semibold shadow-elegant hover:shadow-elegant-md">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Product
                  </Button>
                </CreateProductDialog>
              </DashboardErrorBoundary>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-heading">Total Products</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-heading font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active products in your portfolio</p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-heading">Supply Chains</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-heading font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Mapped supply chains</p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-heading">Verification</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-heading font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground mt-1">Blockchain verified</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Products Table or Empty State */}
          <DashboardErrorBoundary context="products-table">
            {products.length > 0 ? (
              <Card className="border-border shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">Product Portfolio</CardTitle>
                  <CardDescription>
                    View and manage all your products and their supply chain mappings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsTable products={products} />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-border shadow-elegant">
                <CardContent className="p-16">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 text-muted-foreground mb-6">
                      <Package className="h-full w-full" />
                    </div>
                    <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">
                      No products yet
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                      Get started by creating your first product to begin mapping your supply chain with blockchain-verified transparency.
                    </p>
                    <div className="flex justify-center">
                      <CreateProductDialog>
                        <Button size="lg" className="font-heading font-semibold shadow-elegant hover:shadow-elegant-md">
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Product
                        </Button>
                      </CreateProductDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </DashboardErrorBoundary>
        </div>
      </DashboardErrorBoundary>
    )
  } catch (error) {
    console.error('Error in ProductsPage:', error)
    
    const { title, message, type } = getUserFriendlyErrorMessage(error)
    
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">Products</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Manage your brand&apos;s products and their supply chains with blockchain-verified transparency
              </p>
            </div>
          </div>
        </div>
        
        <ErrorMessage
          type={type}
          title={title}
          message={message}
          action={{
            label: 'Refresh Page',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }
}