'use client'

import { lazy, Suspense } from 'react'
import type { SupplierWithCertificates } from '<ecolens>/lib/types'

// Lazy load the map component to reduce initial bundle size
const SupplyChainMap = lazy(() => 
  import('./SupplyChainMap').then(module => ({ default: module.SupplyChainMap }))
)

interface SupplyChainMapLazyProps {
  suppliers: SupplierWithCertificates[]
}

// Loading component for the map
function MapLoadingFallback() {
  return (
    <div 
      className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse"
      role="status"
      aria-label="Loading map"
    >
      <div className="text-gray-500 text-sm">Loading interactive map...</div>
    </div>
  )
}

export function SupplyChainMapLazy({ suppliers }: SupplyChainMapLazyProps) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <SupplyChainMap suppliers={suppliers} />
    </Suspense>
  )
}