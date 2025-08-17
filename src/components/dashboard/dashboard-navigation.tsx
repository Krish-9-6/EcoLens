'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'

export function DashboardNavigation() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/dashboard/products' },
  ]

  return (
    <nav className="flex space-x-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              isActive
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(0,255,133,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
