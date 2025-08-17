'use client'

import React, { ErrorInfo } from 'react'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface DppErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function DppErrorBoundary({ children, componentName, fallback, onError }: DppErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error with additional context for DPP components
    console.error(`DPP Component Error in ${componentName || 'Unknown'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }
  }

  const defaultFallback = (
    <div className="bg-white border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {componentName ? `${componentName} Error` : 'Component Error'}
          </h3>
          <p className="text-red-700 mb-4">
            This section of the digital passport couldn&apos;t load properly. 
            The rest of the page should still work normally.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={fallback || defaultFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}