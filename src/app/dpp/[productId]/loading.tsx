import { DppSkeleton } from '<ecolens>/components/dpp/DppSkeleton'

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header skeleton */}
        <section id="product" className="w-full">
          <div className="grid grid-cols-[96px_1fr] gap-6 items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </section>

        {/* Summary row skeleton */}
        <section id="summary" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border bg-white p-3">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </section>

        {/* Journey skeleton */}
        <section id="journey">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map skeleton */}
        <section id="map">
          <div className="h-96 w-full rounded-lg border bg-white p-6">
            <div className="h-full w-full rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Certificates skeleton */}
        <section id="certificates">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 space-y-3">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}