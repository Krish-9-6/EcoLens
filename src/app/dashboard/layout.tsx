import { requireAuth } from '<ecolens>/lib/auth'
import { DashboardErrorBoundary } from '<ecolens>/components/dashboard/DashboardErrorBoundary'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Brand Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Dashboard navigation will be implemented in future tasks
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardErrorBoundary 
          context="dashboard-layout"
          showHomeButton={true}
          showBackButton={false}
        >
          {children}
        </DashboardErrorBoundary>
      </main>
    </div>
  )
}