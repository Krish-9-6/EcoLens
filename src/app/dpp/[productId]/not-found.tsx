import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '<ecolens>/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Product Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The Digital Product Passport you&apos;re looking for could not be found.
          </p>
          <p className="text-sm text-gray-500">
            This could be because the product ID is invalid, the product has been removed, or there was an error loading the data.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
