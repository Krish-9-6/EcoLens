import { createClient } from '../../lib/supabase/server'
import { requireAuth } from '../../lib/auth'
import { fetchDashboardAnalytics } from '../../lib/data'
import { StatCard } from '../../components/dashboard/stat-card'
import { SupplierTierChart } from '../../components/dashboard/supplier-tier-chart'
import { RecentProductsList } from '../../components/dashboard/recent-products-list'
import { Package, Users, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  // Get authenticated user
  const user = await requireAuth()
  
  // Get user's brand_id from profile
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_id')
    .eq('id', user.id)
    .single()

  if (!profile?.brand_id) {
    throw new Error('User profile not found or brand not set')
  }

  // Fetch dashboard analytics
  const analytics = await fetchDashboardAnalytics(profile.brand_id)

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Welcome back!
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Here's an overview of your transparency efforts and supply chain management.
        </p>
      </div>

      {/* Stats Grid with Enhanced Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={analytics.productCount}
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Total Suppliers"
          value={analytics.supplierCount}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Supply Chain Depth"
          value={`${analytics.tierDistribution.length} Tiers`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Charts and Recent Activity with Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SupplierTierChart data={analytics.tierDistribution} />
        <RecentProductsList products={analytics.recentProducts} />
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Quick Actions</h2>
          <p className="text-slate-300">Get started with managing your supply chain</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-black text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_30px_rgba(0,255,133,0.5)]"
          >
            <Package className="h-4 w-4 mr-2" />
            Create New Product
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center px-6 py-3 border-2 border-emerald-400 text-emerald-400 text-sm font-semibold rounded-lg hover:bg-emerald-400 hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}