import { requireAuth } from '../../lib/auth'
import { DashboardErrorBoundary } from '../../components/dashboard/DashboardErrorBoundary'
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNavigation } from '../../components/dashboard/dashboard-navigation'
import { PageTransition } from '../../components/ui/PageTransition'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated
  const user = await requireAuth()
  
  // Additional server-side check: ensure user has completed onboarding
  const supabase = await createClient()
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single()
    
    // If user has no brand_id, redirect to setup-brand
    if (!profile?.brand_id) {
      redirect('/auth/setup-brand')
    }
  } catch (error) {
    // If there's an error fetching the profile, redirect to setup-brand
    console.error('Error checking profile in dashboard layout:', error)
    redirect('/auth/setup-brand')
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Pattern - Fashion-Tech Noir theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
      
      {/* Animated geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/30 rounded-full" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-emerald-400/30 rotate-45" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border border-emerald-400/30 rounded-full" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-emerald-400/30 rotate-12" />
      </div>

      {/* Modern Header */}
      <header className="relative z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105"
              >
                <div className="text-2xl font-bold text-white">
                  EcoLens
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </Link>
            </div>
            
            {/* Navigation */}
            <DashboardNavigation />
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-black">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-slate-400">Brand Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content with Optimized Transitions */}
      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <DashboardErrorBoundary 
            context="dashboard-layout"
            showHomeButton={true}
            showBackButton={false}
          >
            {children}
          </DashboardErrorBoundary>
        </PageTransition>
      </div>
    </div>
  )
}