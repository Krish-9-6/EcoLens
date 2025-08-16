import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchDppData } from '<ecolens>/lib/data'
import { ProductHeader } from '<ecolens>/components/dpp/ProductHeader'
import { JourneyTimeline } from '<ecolens>/components/dpp/JourneyTimeline'
import { SupplyChainMap } from '<ecolens>/components/dpp/SupplyChainMap'
import { CertificateGallery } from '<ecolens>/components/dpp/CertificateGallery'
import { StickySubheader } from '<ecolens>/components/dpp/StickySubheader'
import { SummaryRow } from '<ecolens>/components/dpp/SummaryRow'
import { createClient } from '<ecolens>/lib/supabase/server' // Ensure this path is correct for your project
import { redirect } from 'next/navigation'

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Supabase environment variables are not configured. Please set up your environment variables:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono">
            <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</p>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Copy the env.template file to .env.local and fill in your Supabase credentials.
          </p>
        </div>
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <StickySubheader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Skip to content link for screen readers */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
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

        {/* Summary Row */}
        <SummaryRow
          className=""
          totalSuppliers={totalSuppliers}
          tiersPresent={tiersPresent}
          verifiedCount={verifiedCount}
          totalCertificates={totalCertificates}
          lastUpdatedISO={product.updated_at}
        />

        {/* Supply Chain Information Grid */}
        <section 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          aria-labelledby="supply-chain-heading"
        >
          <h2 id="supply-chain-heading" className="sr-only">
            Supply Chain Information
          </h2>
          
          {/* Journey Timeline */}
          <div className="w-full" id="journey">
            <JourneyTimeline suppliers={suppliers} />
          </div>

          {/* Supply Chain Map */}
          <section className="w-full" aria-labelledby="map-heading" id="map">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 id="map-heading" className="text-xl font-semibold text-gray-900">
                  Supply Chain Map
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Geographic locations of suppliers in the supply chain
                </p>
              </div>
              <div className="p-6">
                <SupplyChainMap suppliers={suppliers} />
              </div>
            </div>
          </section>
        </section>

        {/* Certificates Section */}
        <section id="certificates">
          <CertificateGallery suppliers={suppliers} />
        </section>

        {/* QR anchor target reserved for future QR component */}
        <div id="qr" />
      </div>
    </main>
  )
}