import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "<ecolens>/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Veritas
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Transparent Supply Chain Transparency Through Blockchain Verification
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Discover the complete journey of products from raw materials to your hands. 
            Every step verified and recorded on the blockchain for complete transparency.
          </p>
          
          {/* Main CTA Button */}
          <div className="mb-16">
            <Link
              href="/dpp/123e4567-e89b-12d3-a456-426614174000"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 View Digital Product Passport Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-xl">🔍 Supply Chain Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track every step of your product&#39;s journey from raw materials to final assembly
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-xl">✅ Verified Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Blockchain-verified certifications and compliance documents for every supplier
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-xl">🗺️ Interactive Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Visualize supplier locations and supply chain geography with interactive maps
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Ready to Explore?
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Test the Digital Product Passport feature with our demo product
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dpp/123e4567-e89b-12d3-a456-426614174000"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200"
            >
              📱 View Demo DPP
            </Link>
            <Link
              href="/dpp/987fcdeb-51a2-43d1-9f12-123456789abc"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200"
            >
              🧪 Test Product
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2024 Veritas - Building Trust Through Transparency</p>
      </footer>
    </div>
  );
}
