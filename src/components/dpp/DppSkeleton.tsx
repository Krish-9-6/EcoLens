import { cn } from '<ecolens>/lib/utils'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

export function DppSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Product Header Skeleton */}
        <section className="w-full">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton className="w-32 h-32 rounded-lg" />
              <div className="flex-1 space-y-4 text-center md:text-left">
                <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
                <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
              </div>
            </div>
          </div>
        </section>

        {/* Supply Chain Information Grid Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Journey Timeline Skeleton */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <div className="p-6 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      {i < 3 && <Skeleton className="w-0.5 h-16 mt-2" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supply Chain Map Skeleton */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <div className="p-6">
                <Skeleton className="w-full h-96 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Certificates Section Skeleton */}
        <section className="w-full">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}