'use client'

import { useEffect } from 'react'
import { trackWebVitals, analyzeBundleSize, trackPagePerformance, logPerformanceMetrics } from '<ecolens>/lib/performance'

interface PerformanceTrackerProps {
  productId: string
}

export function PerformanceTracker({ productId }: PerformanceTrackerProps) {
  useEffect(() => {
    // Track web vitals
    trackWebVitals()
    
    // Analyze bundle size in development
    analyzeBundleSize()
    
    // Track page performance
    const metrics = trackPagePerformance()
    if (metrics) {
      logPerformanceMetrics(metrics, `DPP Page - ${productId}`)
    }
  }, [productId])

  // This component doesn't render anything
  return null
}