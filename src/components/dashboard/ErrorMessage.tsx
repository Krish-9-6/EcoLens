'use client'

import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react'
import { Alert, AlertDescription } from '<ecolens>/components/ui/alert'
import { Button } from '<ecolens>/components/ui/button'
import { cn } from '<ecolens>/lib/utils'

interface ErrorMessageProps {
  type?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Enhanced Error Message Component
 * Requirements: 4.2, 4.3, 4.4, 4.5
 * 
 * Provides user-friendly error messages with contextual styling
 * and optional actions for better error recovery
 */
export function ErrorMessage({
  type = 'error',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      case 'success':
        return 'default'
      default:
        return 'destructive'
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      default:
        return 'border-red-200 bg-red-50 text-red-800'
    }
  }

  return (
    <Alert 
      variant={getVariant()} 
      className={cn(
        'relative',
        type !== 'error' && getColorClasses(),
        className
      )}
    >
      {getIcon()}
      <div className="flex-1">
        {title && (
          <div className="font-medium mb-1">{title}</div>
        )}
        <AlertDescription className={title ? 'text-sm' : undefined}>
          {message}
        </AlertDescription>
        
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={cn(
                'h-8 text-xs',
                type === 'error' && 'border-red-300 text-red-700 hover:bg-red-100',
                type === 'warning' && 'border-yellow-300 text-yellow-700 hover:bg-yellow-100',
                type === 'info' && 'border-blue-300 text-blue-700 hover:bg-blue-100',
                type === 'success' && 'border-green-300 text-green-700 hover:bg-green-100'
              )}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Alert>
  )
}

/**
 * Utility function to get user-friendly error messages
 */
export function getUserFriendlyErrorMessage(error: unknown): { title: string; message: string; type: 'error' | 'warning' | 'info' } {
  const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error'
  const lowerMessage = errorMessage.toLowerCase()

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch failed')) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
      type: 'error'
    }
  }

  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return {
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to continue.',
      type: 'warning'
    }
  }

  // Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return {
      title: 'Invalid Input',
      message: 'Please check your input and try again. Make sure all required fields are filled correctly.',
      type: 'warning'
    }
  }

  // Permission errors
  if (lowerMessage.includes('permission') || lowerMessage.includes('access denied') || lowerMessage.includes('forbidden')) {
    return {
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action. Please contact your administrator if you believe this is an error.',
      type: 'warning'
    }
  }

  // Not found errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return {
      title: 'Not Found',
      message: 'The requested resource could not be found. It may have been moved or deleted.',
      type: 'info'
    }
  }

  // Server errors
  if (lowerMessage.includes('server error') || lowerMessage.includes('500') || lowerMessage.includes('internal server')) {
    return {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
      type: 'error'
    }
  }

  // Database constraint errors
  if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
    return {
      title: 'Duplicate Entry',
      message: 'An item with this information already exists. Please use a different name or check existing entries.',
      type: 'warning'
    }
  }

  // Timeout errors
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      type: 'error'
    }
  }

  // Default error
  return {
    title: 'Something Went Wrong',
    message: errorMessage || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    type: 'error'
  }
}