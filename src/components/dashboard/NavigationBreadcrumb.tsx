'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '<ecolens>/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface NavigationBreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

/**
 * Navigation Breadcrumb Component
 * Requirements: 6.5
 * 
 * Provides clear navigation context and improves user flow
 * between dashboard pages with breadcrumb navigation
 */
export function NavigationBreadcrumb({ items, className }: NavigationBreadcrumbProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)
  
  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            )}
            
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span 
                className={cn(
                  'font-medium',
                  item.current ? 'text-foreground' : 'text-muted-foreground'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Auto-generate breadcrumbs from the current path
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    current: pathname === '/dashboard'
  })
  
  // Handle dashboard routes
  if (segments.includes('dashboard')) {
    const dashboardIndex = segments.indexOf('dashboard')
    const remainingSegments = segments.slice(dashboardIndex + 1)
    
    let currentPath = '/dashboard'
    
    remainingSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === remainingSegments.length - 1
      
      // Handle specific routes
      if (segment === 'products') {
        breadcrumbs.push({
          label: 'Products',
          href: isLast ? undefined : '/dashboard/products',
          current: isLast
        })
      } else if (isUUID(segment)) {
        // This is likely a product ID
        breadcrumbs.push({
          label: 'Product Details',
          current: true
        })
      } else {
        // Generic segment handling
        breadcrumbs.push({
          label: capitalizeFirst(segment.replace(/-/g, ' ')),
          href: isLast ? undefined : currentPath,
          current: isLast
        })
      }
    })
  }
  
  return breadcrumbs
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}