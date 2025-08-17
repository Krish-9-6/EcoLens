'use client'

import { lazy, Suspense, useState, useEffect } from 'react'
import type { SupplierWithCertificates } from '<ecolens>/lib/types'
import { DppErrorBoundary } from './DppErrorBoundary'
import { MapPin, Globe } from 'lucide-react'

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
      className="w-full h-96 bg-muted rounded-lg flex items-center justify-center animate-pulse"
      role="status"
      aria-label="Loading map"
    >
      <div className="text-muted-foreground text-sm">Loading interactive map...</div>
    </div>
  )
}

// Simple fallback component that shows supplier locations in a list
function SimpleMapFallback({ suppliers }: { suppliers: SupplierWithCertificates[] }) {
  const suppliersWithCoords = suppliers.filter(s => s.latitude !== null && s.longitude !== null)
  
  if (suppliersWithCoords.length === 0) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No supplier locations available</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Supplier coordinates will appear here when added</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-muted rounded-lg border border-border overflow-hidden">
      <div className="p-4 bg-card border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">Supplier Locations</h3>
        <p className="text-sm text-muted-foreground">Showing {suppliersWithCoords.length} supplier locations</p>
      </div>
      <div className="p-4 overflow-y-auto h-full">
        <div className="space-y-3">
          {suppliersWithCoords.map((supplier) => (
            <div key={supplier.id} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  supplier.tier === 3 ? 'bg-green-500' :
                  supplier.tier === 2 ? 'bg-orange-500' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{supplier.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{supplier.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    Tier {supplier.tier}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {supplier.certificates.length} Cert{supplier.certificates.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error fallback for map loading failures
function MapErrorFallback() {
  return (
    <div 
      className="w-full h-96 bg-muted rounded-lg flex items-center justify-center"
      role="status"
      aria-label="Map loading error"
    >
      <div className="text-center">
        <div className="text-destructive text-sm mb-2">Failed to load map</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:text-primary/80 text-sm underline"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// Singleton to track map initialization
let mapInitialized = false
let mapError = false

export function SupplyChainMapLazy({ suppliers }: SupplyChainMapLazyProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useSimpleFallback, setUseSimpleFallback] = useState(false)

  useEffect(() => {
    // Reset error state on mount
    setHasError(false)
    setUseSimpleFallback(false)
    
    // If map has already been initialized and had an error, use simple fallback
    if (mapError) {
      setUseSimpleFallback(true)
      return
    }

    // Delay loading to prevent rapid re-initialization
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleError = (error: Error) => {
    console.error('Map initialization error:', error)
    mapError = true
    setHasError(true)
    setUseSimpleFallback(true)
  }

  const handleRetry = () => {
    mapError = false
    mapInitialized = false
    setHasError(false)
    setShouldLoad(false)
    setUseSimpleFallback(false)
    
    // Force a small delay before retrying
    setTimeout(() => {
      setShouldLoad(true)
    }, 200)
  }

  // Custom error fallback with retry functionality
  const CustomErrorFallback = () => (
    <div 
      className="w-full h-96 bg-muted rounded-lg flex items-center justify-center"
      role="status"
      aria-label="Map loading error"
    >
      <div className="text-center">
        <div className="text-destructive text-sm mb-2">Failed to load map</div>
        <button 
          onClick={handleRetry}
          className="text-primary hover:text-primary/80 text-sm underline"
        >
          Retry
        </button>
      </div>
    </div>
  )

  // If we should use the simple fallback, show it
  if (useSimpleFallback) {
    return <SimpleMapFallback suppliers={suppliers} />
  }

  if (hasError) {
    return <CustomErrorFallback />
  }

  if (!shouldLoad) {
    return <MapLoadingFallback />
  }

  return (
    <DppErrorBoundary 
      fallback={<CustomErrorFallback />}
      onError={handleError}
    >
      <Suspense fallback={<MapLoadingFallback />}>
        <SupplyChainMap suppliers={suppliers} />
      </Suspense>
    </DppErrorBoundary>
  )
}