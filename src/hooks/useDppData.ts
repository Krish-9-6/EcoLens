'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DppData } from '<ecolens>/lib/types'
import type { RetryOptions } from '<ecolens>/lib/retry'

interface UseDppDataOptions {
  retryOptions?: RetryOptions
  autoFetch?: boolean
}

interface UseDppDataResult {
  data: DppData | null
  loading: boolean
  error: Error | null
  retry: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Client-side hook for fetching DPP data with loading states and retry logic
 * Note: This is for client-side usage. Server components should use fetchDppData directly.
 */
export function useDppData(
  productId: string,
  options: UseDppDataOptions = {}
): UseDppDataResult {
  const { autoFetch = true } = options
  
  const [data, setData] = useState<DppData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!productId) return

    setLoading(true)
    setError(null)

    try {
      // Call the API route instead of direct database access
      const response = await fetch(`/api/dpp/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setData(null)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      console.error('Error fetching DPP data:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  const retry = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (autoFetch && productId) {
      fetchData()
    }
  }, [fetchData, autoFetch, productId])

  return {
    data,
    loading,
    error,
    retry,
    refetch
  }
}