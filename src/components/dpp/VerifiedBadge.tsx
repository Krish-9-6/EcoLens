import { BadgeCheck } from "lucide-react";
import { Badge } from "<ecolens>/components/ui/badge";

interface VerifiedBadgeProps {
  timestamp: string;
  hash: string;
}

export function VerifiedBadge({ timestamp, hash }: VerifiedBadgeProps) {
  // Format the timestamp to a readable date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Truncate hash for display (show first 8 and last 8 characters)
  const truncateHash = (hashString: string) => {
    if (hashString.length <= 16) return hashString;
    return `${hashString.slice(0, 8)}...${hashString.slice(-8)}`;
  };

  return (
    <div className="space-y-2" role="status" aria-label="Certificate verification details">
      <Badge 
        variant="success" 
        className="inline-flex items-center gap-1"
        aria-label="Certificate status: verified"
      >
        <BadgeCheck className="w-3 h-3" aria-hidden="true" />
        Verified
      </Badge>
      <dl className="text-xs text-muted-foreground space-y-1">
        <div>
          <dt className="font-medium inline">Verified:</dt>
          <dd className="inline ml-1">
            <time dateTime={timestamp}>
              {formatDate(timestamp)}
            </time>
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="font-medium">Hash:</dt>
          <dd>
            <code 
              className="font-mono text-xs bg-muted px-1 py-0.5 rounded"
              title={`Full hash: ${hash}`}
              aria-label={`Verification hash: ${truncateHash(hash)}`}
            >
              {truncateHash(hash)}
            </code>
          </dd>
        </div>
      </dl>
    </div>
  );
}