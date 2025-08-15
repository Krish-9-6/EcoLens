import { LoadingSpinner } from './LoadingSpinner'
import { cn } from '<ecolens>/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullHeight?: boolean
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md', 
  className,
  fullHeight = false 
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8',
        fullHeight && 'min-h-96',
        className
      )}
    >
      <LoadingSpinner size={size} />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}