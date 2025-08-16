import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchDppData } from '<ecolens>/lib/data'
import { ProductHeader } from '<ecolens>/components/dpp/ProductHeader'
import { JourneyTimeline } from '<ecolens>/components/dpp/JourneyTimeline'
import { SupplyChainMapLazy } from '<ecolens>/components/dpp/SupplyChainMapLazy'
import { CertificateGallery } from '<ecolens>/components/dpp/CertificateGallery'
import { StickySubheader } from '<ecolens>/components/dpp/StickySubheader'
import { SummaryRow } from '<ecolens>/components/dpp/SummaryRow'
import { DppErrorBoundary } from '<ecolens>/components/dpp/DppErrorBoundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Badge } from '<ecolens>/components/ui/badge'
import { MapPin, Shield, Clock, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '<ecolens>/lib/supabase/server'

interface DppPageProps {
  params: Promise<{
    productId: string
  }>
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: DppPageProps): Promise<Metadata> {
  const { productId } = await params
  const data = await fetchDppData(productId)
  
  if (!data) {
    return {
      title: 'Product Not Found - Digital Product Passport',
      description: 'The requested product could not be found.',
    }
  }

  const { product } = data
  const title = `${product.name} - ${product.brand.name} | Digital Product Passport`
  const description = `Discover the complete supply chain journey of ${product.name} by ${product.brand.name}. View certifications, supplier information, and verification status.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 1200,
          height: 630,
          alt: `${product.name} product image`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function DppPage({ params }: DppPageProps) {
  const { productId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }
  
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-gradient-natural flex items-center justify-center p-4">
        <Card className="max-w-2xl text-center shadow-elegant-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-heading font-bold text-destructive">⚠️ Configuration Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Supabase environment variables are not configured. Please set up your environment variables:
            </p>
            <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono">
              <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy the env.template file to .env.local and fill in your Supabase credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Fetch DPP data for the product
  const data = await fetchDppData(productId)
  
  // Handle case where product is not found or data fetch fails
  if (!data) {
    notFound()
  }

  const { product, suppliers } = data

  // Precompute summary stats
  const totalSuppliers = suppliers.length
  const tiersSet = new Set<(1|2|3)>(suppliers.map(s => s.tier as 1|2|3))
  const tiersPresent = Array.from(tiersSet)
  const allCerts = suppliers.flatMap(s => s.certificates)
  const verifiedCount = allCerts.filter(c => !!c.verified_at).length
  const totalCertificates = allCerts.length

  return (
    <DppErrorBoundary>
      <main className="min-h-screen bg-gradient-natural">
        <StickySubheader />
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Skip to content link for screen readers */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50 font-heading font-semibold shadow-elegant"
          >
            Skip to main content
          </a>

          {/* Product Header Section */}
          <header className="w-full" id="product">
            <div id="main-content" />
            <ProductHeader 
              productName={product.name}
              brandName={product.brand.name}
              imageUrl={product.image_url || undefined}
              verifiedCount={verifiedCount}
              totalCertificates={totalCertificates}
            />
          </header>

          {/* Enhanced Summary Row with Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-heading">Suppliers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading font-bold text-foreground">{totalSuppliers}</p>
                <p className="text-sm text-muted-foreground mt-1">Total supply chain partners</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-heading">Tiers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading font-bold text-foreground">{tiersPresent.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Supply chain levels</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-heading">Verified</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-heading font-bold text-foreground">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Blockchain verified</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-elegant hover:shadow-elegant-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-heading">Updated</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-heading font-semibold text-foreground">
                  {new Date(product.updated_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Last verification</p>
              </CardContent>
            </Card>
          </section>

          {/* Supply Chain Information Grid */}
          <section 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            aria-labelledby="supply-chain-heading"
          >
            <h2 id="supply-chain-heading" className="sr-only">
              Supply Chain Information
            </h2>
            
            {/* Journey Timeline */}
            <div className="w-full" id="journey">
              <Card className="border-border shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">Supply Chain Journey</CardTitle>
                  <CardDescription>
                    Follow the complete journey from raw materials to finished product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JourneyTimeline suppliers={suppliers} />
                </CardContent>
              </Card>
            </div>

            {/* Supply Chain Map */}
            <section className="w-full" aria-labelledby="map-heading" id="map">
              <Card className="border-border shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">Supply Chain Map</CardTitle>
                  <CardDescription>
                    Geographic locations of suppliers in the supply chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupplyChainMapLazy suppliers={suppliers} />
                </CardContent>
              </Card>
            </section>
          </section>

          {/* Proof of Provenance Section */}
          <section id="certificates" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-heading font-bold text-foreground">Proof of Provenance</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every certificate and verification is immutably recorded on the blockchain, providing 
                irrefutable proof of your product&apos;s journey and authenticity.
              </p>
              <div className="flex justify-center">
                <Badge variant="verified" className="text-sm">
                  {verifiedCount} of {totalCertificates} Certificates Verified
                </Badge>
              </div>
            </div>
            <CertificateGallery suppliers={suppliers} />
          </section>

          {/* QR anchor target reserved for future QR component */}
          <div id="qr" />
        </div>
      </main>
    </DppErrorBoundary>
  )
}
