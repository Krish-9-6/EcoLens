'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '<ecolens>/components/ui/button'
import Link from 'next/link'

interface ErrorDisplayProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info'
}

export function ErrorDisplay({ title, message, type = 'error' }: ErrorDisplayProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          {title && (
            <div className="font-medium text-red-800 mb-1">{title}</div>
          )}
          <div className="text-sm text-red-700">{message}</div>
          <div className="mt-3 space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-100"
              onClick={handleRefresh}
            >
              Refresh Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-100"
              asChild
            >
              <Link href="/dashboard/products">
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

