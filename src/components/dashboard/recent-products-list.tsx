'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'

interface RecentProduct {
  id: string
  name: string
}

interface RecentProductsListProps {
  products: RecentProduct[]
}

export function RecentProductsList({ products }: RecentProductsListProps) {
  if (!products || products.length === 0) {
    return (
      <Card className="border-0 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-center py-12">
            No products created yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                  {product.name}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          ))}
        </div>
        {products.length >= 5 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              View all products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
