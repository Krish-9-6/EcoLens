'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '<ecolens>/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showHomeButton?: boolean
  showBackButton?: boolean
  context?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

/**
 * Dashboard-specific Error Boundary Component
 * Requirements: 4.2, 4.3, 4.4, 4.5
 * 
 * Provides comprehensive error handling for dashboard components with
 * user-friendly error messages and recovery options
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DashboardErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      context: this.props.context,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    })
    
    // Ensure error is properly set in state
    this.setState({
      hasError: true,
      error: error,
      errorId: this.state.errorId || `error-${Date.now()}`
    })
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error monitoring service
      // errorMonitoringService.captureException(error, {
      //   context: this.props.context,
      //   errorId: this.state.errorId,
      //   errorInfo
      // })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  getUserFriendlyMessage = (error: Error): { title: string; description: string; canRetry: boolean } => {
    const message = error.message.toLowerCase()
    
    // Network-related errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description: 'Unable to connect to our servers. Please check your internet connection and try again.',
        canRetry: true
      }
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return {
        title: 'Authentication Required',
        description: 'Your session may have expired. Please sign in again to continue.',
        canRetry: false
      }
    }
    
    // Data loading errors
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Content Not Found',
        description: 'The requested content could not be found. It may have been moved or deleted.',
        canRetry: false
      }
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('access denied')) {
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this content. Please contact your administrator.',
        canRetry: false
      }
    }
    
    // Form validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        title: 'Invalid Data',
        description: 'There was an issue with the data provided. Please check your inputs and try again.',
        canRetry: true
      }
    }
    
    // Server errors
    if (message.includes('server') || message.includes('500')) {
      return {
        title: 'Server Error',
        description: 'Our servers are experiencing issues. Please try again in a few moments.',
        canRetry: true
      }
    }
    
    // Default error
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Our team has been notified and is working to fix the issue.',
      canRetry: true
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { title, description, canRetry } = this.getUserFriendlyMessage(this.state.error!)

      // Dashboard-specific error UI
      return (
        <div className="flex items-center justify-center min-h-96 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error ID for support */}
              {this.state.errorId && (
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    Error ID: <code className="font-mono">{this.state.errorId}</code>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please include this ID when contacting support
                  </p>
                </div>
              )}

              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <div className="flex gap-2">
                  {this.props.showBackButton && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.history.back()}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                  )}
                  
                  {this.props.showHomeButton && (
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/dashboard/products">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}