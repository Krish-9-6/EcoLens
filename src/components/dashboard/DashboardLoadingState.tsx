import { LoadingSpinner } from '<ecolens>/components/ui/LoadingSpinner'
import { Card, CardContent } from '<ecolens>/components/ui/card'
import { Skeleton } from '<ecolens>/components/ui/skeleton'
import { cn } from '<ecolens>/lib/utils'

interface DashboardLoadingStateProps {
  type?: 'page' | 'table' | 'form' | 'card' | 'inline'
  message?: string
  className?: string
  showSkeleton?: boolean
}

/**
 * Dashboard-specific Loading State Component
 * Requirements: 4.3, 4.4, 4.5
 * 
 * Provides consistent loading states across dashboard components
 * with skeleton loading for better perceived performance
 */
export function DashboardLoadingState({ 
  type = 'page',
  message,
  className,
  showSkeleton = false
}: DashboardLoadingStateProps) {
  
  if (type === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <LoadingSpinner size="sm" />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    )
  }

  if (type === 'form') {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="md" />
          <p className="text-sm text-muted-foreground">
            {message || 'Processing...'}
          </p>
        </div>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="md" />
            <p className="text-sm text-muted-foreground">
              {message || 'Loading...'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'table' && showSkeleton) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'page' && showSkeleton) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  // Default loading state
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 py-12',
      type === 'page' && 'min-h-96',
      className
    )}>
      <LoadingSpinner size={type === 'page' ? 'lg' : 'md'} />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          {message || 'Loading...'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Please wait while we fetch your data
        </p>
      </div>
    </div>
  )
}