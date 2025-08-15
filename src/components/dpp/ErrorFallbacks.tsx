import { AlertTriangle, RefreshCw, Wifi, Database, MapPin } from 'lucide-react'

interface ErrorFallbackProps {
  onRetry?: () => void
  className?: string
}

export function NetworkErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-orange-50 border border-orange-200 rounded-lg ${className}`}>
      <Wifi className="w-12 h-12 text-orange-500 mb-4" />
      <h3 className="text-lg font-semibold text-orange-900 mb-2">
        Connection Problem
      </h3>
      <p className="text-orange-700 text-center mb-4 max-w-md">
        We're having trouble connecting to our servers. Please check your internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

export function DatabaseErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <Database className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Data Unavailable
      </h3>
      <p className="text-red-700 text-center mb-4 max-w-md">
        We're experiencing technical difficulties accessing the product data. Please try again in a moment.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  )
}

export function MapErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <MapPin className="w-12 h-12 text-blue-500 mb-4" />
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Map Unavailable
      </h3>
      <p className="text-blue-700 text-center mb-4 max-w-md">
        The interactive map couldn't load. You can still view supplier locations in the timeline above.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Map
        </button>
      )}
    </div>
  )
}

export function GenericErrorFallback({ onRetry, className }: ErrorFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <AlertTriangle className="w-12 h-12 text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-700 text-center mb-4 max-w-md">
        An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}