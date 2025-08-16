'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { SupplierWithCertificates } from '<ecolens>/lib/types'
import { MapErrorFallback } from './ErrorFallbacks'
import type { Icon, LatLngExpression, Map as LeafletMap } from 'leaflet'

// React Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })
// Marker clustering
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster').then((m) => m.default), { ssr: false })

interface SupplyChainMapProps {
  suppliers: SupplierWithCertificates[]
}

interface MapBounds { center: [number, number]; zoom: number }

interface CustomIcons {
  tier3Icon: Icon
  tier2Icon: Icon
  tier1Icon: Icon
}

const LIGHT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export function SupplyChainMap({ suppliers }: SupplyChainMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState<Error | null>(null)
  const [mapBounds, setMapBounds] = useState<MapBounds>({ center: [0, 0], zoom: 2 })
  const [markerIcon, setMarkerIcon] = useState<CustomIcons | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [usingDemoCoords, setUsingDemoCoords] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  const suppliersWithCoordinates = useMemo(
    () => {
      const suppliersWithCoords = suppliers.filter((s) => s.latitude !== null && s.longitude !== null && !isNaN(s.latitude) && !isNaN(s.longitude))
      
      // If no suppliers have coordinates, add demo coordinates for testing
      if (suppliersWithCoords.length === 0 && suppliers.length > 0) {
        setUsingDemoCoords(true)
        const demoCoordinates = [
          { lat: 40.7128, lng: -74.0060 }, // New York
          { lat: 51.5074, lng: -0.1278 },  // London
          { lat: 35.6762, lng: 139.6503 }, // Tokyo
          { lat: -33.8688, lng: 151.2093 }, // Sydney
          { lat: 55.7558, lng: 37.6176 },  // Moscow
        ]
        
        return suppliers.map((supplier, index) => ({
          ...supplier,
          latitude: demoCoordinates[index % demoCoordinates.length].lat,
          longitude: demoCoordinates[index % demoCoordinates.length].lng,
        }))
      }
      
      setUsingDemoCoords(false)
      return suppliersWithCoords
    },
    [suppliers]
  )

  useEffect(() => { setIsClient(true); setMapError(null) }, [])

  // Defer render until visible
  useEffect(() => {
    if (!containerRef.current) return
    
    const io = new IntersectionObserver((entries) => {
      const e = entries[0]
      if (e?.isIntersecting) {
        console.log('Map is now visible, setting isVisible to true')
        setIsVisible(true)
      }
    }, { 
      rootMargin: '200px',
      threshold: 0.1 
    })
    
    io.observe(containerRef.current)
    
    // Fallback: if IntersectionObserver doesn't trigger within 3 seconds, show the map anyway
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback: forcing map to be visible after 3 seconds')
      setIsVisible(true)
    }, 3000)
    
    return () => {
      io.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('SupplyChainMap state:', {
      isClient,
      isVisible,
      suppliersCount: suppliers.length,
      suppliersWithCoordinatesCount: suppliersWithCoordinates.length,
      usingDemoCoords,
      mapError: mapError?.message
    })
  }, [isClient, isVisible, suppliers.length, suppliersWithCoordinates.length, usingDemoCoords, mapError])

  // Icon
  useEffect(() => {
    if (!isClient) return
    let cancelled = false
    ;(async () => {
      const L = await import('leaflet')
      
      // Create custom markers for each tier
      const createCustomIcon = (tier: number) => {
        const colors = {
          3: { bg: '#10b981', border: '#059669' }, // green
          2: { bg: '#f59e0b', border: '#d97706' }, // orange
          1: { bg: '#ef4444', border: '#dc2626' }  // red
        }
        const color = colors[tier as keyof typeof colors] || colors[1]
        
        return new L.DivIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background: ${color.bg};
              border: 2px solid ${color.border};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              color: white;
              font-weight: bold;
              font-size: 10px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            ">
              ${tier}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        })
      }
      
      // Create tier-specific icons
      const tier3Icon = createCustomIcon(3)
      const tier2Icon = createCustomIcon(2)
      const tier1Icon = createCustomIcon(1)
      
      if (!cancelled) {
        setMarkerIcon({ tier3Icon, tier2Icon, tier1Icon })
      }
    })()
    return () => { cancelled = true }
  }, [isClient])

  // Bounds
  useEffect(() => {
    if (suppliersWithCoordinates.length === 0) return
    const next = calculateMapBounds(suppliersWithCoordinates)
    setMapBounds((prev) => {
      const sameCenter = prev.center[0] === next.center[0] && prev.center[1] === next.center[1]
      const sameZoom = prev.zoom === next.zoom
      return sameCenter && sameZoom ? prev : next
    })
  }, [suppliersWithCoordinates])

  // Sync with timeline hover
  useEffect(() => {
    const onHover = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { supplierId: string; enter: boolean }
      if (!mapRef.current || !detail) return
      const s = suppliersWithCoordinates.find((x) => x.id === detail.supplierId)
      if (!s) return
      if (detail.enter) {
        mapRef.current.setView([s.latitude!, s.longitude!] as LatLngExpression, Math.max(mapRef.current.getZoom(), 6), { animate: true })
      }
    }
    window.addEventListener('timeline-hover', onHover as EventListener)
    return () => window.removeEventListener('timeline-hover', onHover as EventListener)
  }, [suppliersWithCoordinates])

  const fitToSuppliers = () => {
    if (!mapRef.current || suppliersWithCoordinates.length === 0) return
    const next = calculateMapBounds(suppliersWithCoordinates)
    mapRef.current.setView(next.center as LatLngExpression, next.zoom, { animate: true })
  }

  if (mapError) return <MapErrorFallback onRetry={() => { setMapError(null); setIsClient(false); setTimeout(() => setIsClient(true), 100) }} className="w-full h-96" />
  if (!isClient) return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 grid place-items-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
    </div>
  )
  if (!isVisible) return (
    <div ref={containerRef} className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 grid place-items-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-4">Map will load when visible</p>
        <button 
          onClick={() => setIsVisible(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Load Map Now
        </button>
      </div>
    </div>
  )
  if (suppliersWithCoordinates.length === 0) return (
    <div ref={containerRef} className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 grid place-items-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No supplier locations available</p>
        <p className="text-sm text-gray-500 mt-1">Supplier coordinates will appear here when added</p>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm relative" role="application" aria-label="Interactive supply chain map showing supplier locations" data-testid="map-container">
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button 
          onClick={fitToSuppliers} 
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all shadow-sm"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Fit to suppliers
        </button>
        {usingDemoCoords && (
          <div className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Demo locations
          </div>
        )}
      </div>

      <MapContainer 
        center={mapBounds.center} 
        zoom={mapBounds.zoom} 
        style={{ height: '100%', width: '100%' }} 
        className="z-0" 
        ref={(map) => {
          if (map) mapRef.current = map
        }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          url={LIGHT_TILES} 
        />

        {markerIcon && (
          <MarkerClusterGroup 
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            removeOutsideVisibleBounds={true}
            animate={true}
            animateAddingMarkers={true}
          >
            {suppliersWithCoordinates.map((s) => {
              const icon = s.tier === 3 ? markerIcon.tier3Icon : 
                          s.tier === 2 ? markerIcon.tier2Icon : 
                          markerIcon.tier1Icon
              
              return (
                <Marker key={s.id} position={[s.latitude!, s.longitude!] as LatLngExpression} icon={icon}>
                  <Popup className="supplier-popup">
                    <div className="p-3 min-w-[220px]">
                      <div className="font-semibold text-gray-900 mb-2 text-base">{s.name}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          s.tier === 3 ? 'bg-green-100 text-green-800' :
                          s.tier === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Tier {s.tier}
                        </span>
                        <span className="text-sm text-gray-600">{s.location}</span>
                      </div>
                      <a
                        href={`#supplier-${s.id}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          const el = document.getElementById(`supplier-${s.id}`)
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        View in timeline
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
        <div className="text-sm font-medium text-gray-900 mb-2">Supply Chain Tiers</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Tier 3 - Raw Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Tier 2 - Manufacturing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Tier 1 - Final Assembly</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateMapBounds(suppliers: SupplierWithCertificates[]): { center: [number, number]; zoom: number } {
  if (suppliers.length === 0) return { center: [0, 0], zoom: 2 }
  const lats = suppliers.map((s) => s.latitude!).filter((lat) => lat !== null)
  const lngs = suppliers.map((s) => s.longitude!).filter((lng) => lng !== null)
  if (lats.length === 0 || lngs.length === 0) return { center: [0, 0], zoom: 2 }
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2
  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng
  const maxDiff = Math.max(latDiff, lngDiff)
  let zoom = 2
  if (maxDiff > 0) {
    zoom = Math.floor(Math.log2(360 / maxDiff))
    zoom = Math.max(1, Math.min(18, zoom))
  }
  return { center: [centerLat, centerLng], zoom }
}