import { BadgeCheck, Copy } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Props interface for VerifiedBadge component
 */
interface VerifiedBadgeProps {
  /** The verification hash */
  hash: string
  /** Timestamp of verification (string or Date object) */
  timestamp: string | Date
  /** Optional className for custom styling */
  className?: string
  /** Show full hash instead of truncated version */
  showFullHash?: boolean
  /** Custom date format locale */
  locale?: string
  /** Make the badge compact (smaller size) */
  compact?: boolean
}

/**
 * VerifiedBadge Component
 * 
 * A display component that shows verification status with a visually
 * distinct badge containing verification details. Features interactive
 * hash copying and formatted timestamps.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export function VerifiedBadge({
  hash,
  timestamp,
  className = '',
  showFullHash = false,
  locale = 'en-US',
  compact = false
}: VerifiedBadgeProps) {
  /**
   * Formats the timestamp for display
   * Supports both string and Date inputs
   */
  const formatTimestamp = (ts: string | Date): string => {
    try {
      const date = typeof ts === 'string' ? new Date(ts) : ts
      
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }

      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date)
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return 'Invalid date'
    }
  }

  /**
   * Truncates hash for display while keeping it readable
   */
  const displayHash = showFullHash 
    ? hash 
    : `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`

  /**
   * Handles copying hash to clipboard
   */
  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      toast.success('Hash copied to clipboard', {
        duration: 2000
      })
    } catch (error) {
      toast.error('Failed to copy hash')
    }
  }

  /**
   * Validates hash format (basic check for sha256: prefix)
   */
  const isValidHash = hash && hash.startsWith('sha256:')

  if (!isValidHash) {
    console.warn('VerifiedBadge: Invalid hash format provided')
  }

  const badgeSize = compact ? 'text-xs' : 'text-sm'
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4'
  const padding = compact ? 'p-2' : 'p-3'

  return (
    <div
      className={`
        inline-flex flex-col 
        bg-green-50 border-2 border-green-200 
        rounded-lg ${padding}
        shadow-sm hover:shadow-md 
        transition-all duration-200
        dark:bg-green-950 dark:border-green-800
        ${className}
      `}
    >
      {/* Header with icon and verified text */}
      <div className="flex items-center gap-2 mb-2">
        <BadgeCheck 
          className={`${iconSize} text-green-600 dark:text-green-400`}
          aria-label="Verified"
        />
        <span 
          className={`
            font-semibold text-green-800 dark:text-green-200
            ${badgeSize}
          `}
        >
          Verified on {formatTimestamp(timestamp)}
        </span>
      </div>

      {/* Hash display with copy functionality */}
      <div className="flex items-center gap-2 group">
        <span 
          className={`
            font-mono ${badgeSize} 
            text-green-700 dark:text-green-300
            bg-green-100 dark:bg-green-900
            px-2 py-1 rounded border
            border-green-300 dark:border-green-700
            select-all
          `}
          title={showFullHash ? hash : `Full hash: ${hash}`}
        >
          {displayHash}
        </span>
        
        <button
          onClick={handleCopyHash}
          className={`
            ${iconSize} text-green-600 dark:text-green-400
            hover:text-green-800 dark:hover:text-green-200
            opacity-0 group-hover:opacity-100
            transition-all duration-200
            p-1 hover:bg-green-200 dark:hover:bg-green-800
            rounded
          `}
          title="Copy hash to clipboard"
          aria-label="Copy verification hash"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>

      {/* Optional additional info for non-compact mode */}
      {!compact && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          Cryptographically verified and immutably recorded
        </div>
      )}
    </div>
  )
}
