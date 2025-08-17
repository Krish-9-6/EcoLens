import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

interface ProductNotFoundProps {
  productId: string
  onRetry?: () => void
}

export function ProductNotFound({ productId, onRetry }: ProductNotFoundProps) {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17H9m6 0a3 3 0 01-3 3H9a3 3 0 01-3-3m6 0V9a3 3 0 00-3-3H9a3 3 0 00-3 3v8.001z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          
          <p className="text-gray-600 mb-2">
            We couldn&apos;t find a digital passport for this product.
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Product ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{productId}</code>
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-4">This could happen if:</p>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>The product ID is incorrect or has been mistyped</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>The product hasn&apos;t been registered in our system yet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>The QR code may be damaged or outdated</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Need help? Contact the brand or retailer where you purchased this product.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}