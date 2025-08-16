'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Badge } from '<ecolens>/components/ui/badge'
import { Progress } from '<ecolens>/components/ui/progress'
import { 
  BarChart3, 
  Network, 
  Users, 
  TreePine,
  TrendingUp,
  Layers
} from 'lucide-react'
import { cn } from '<ecolens>/lib/utils'
import type { SupplierHierarchy } from '<ecolens>/lib/hierarchy'
import { getHierarchyStats } from '<ecolens>/lib/hierarchy'

interface SupplierHierarchyStatsProps {
  hierarchy: SupplierHierarchy
  className?: string
}

/**
 * SupplierHierarchyStats Component - Visual statistics for supply chain hierarchy
 * Requirements: 2.1, 2.2, 2.3, 6.3, 6.4
 * 
 * Displays comprehensive statistics and metrics about the supply chain hierarchy
 * including tier distribution, depth analysis, and relationship metrics
 */
export function SupplierHierarchyStats({ 
  hierarchy, 
  className 
}: SupplierHierarchyStatsProps) {
  const stats = getHierarchyStats(hierarchy)

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'text-blue-600 bg-blue-50'
      case 2:
        return 'text-green-600 bg-green-50'
      case 3:
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTierProgress = (count: number) => {
    return stats.totalSuppliers > 0 ? (count / stats.totalSuppliers) * 100 : 0
  }

  if (stats.totalSuppliers === 0) {
    return null
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4", className)}>
      {/* Total Suppliers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Suppliers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.totalSuppliers}</div>
          <p className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Across </span>
            {Object.values(stats.tierCounts).filter(count => count > 0).length} tiers
          </p>
        </CardContent>
      </Card>

      {/* Hierarchy Depth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Max Depth</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.maxDepth + 1}</div>
          <p className="text-xs text-muted-foreground">
            Levels<span className="hidden sm:inline"> deep</span>
          </p>
        </CardContent>
      </Card>

      {/* Root Suppliers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <span className="hidden sm:inline">Root Suppliers</span>
            <span className="sm:hidden">Roots</span>
          </CardTitle>
          <TreePine className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.rootSuppliers}</div>
          <p className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Entry points</span>
            <span className="sm:hidden">Entries</span>
          </p>
        </CardContent>
      </Card>

      {/* Suppliers with Children */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            <span className="hidden sm:inline">With Downstream</span>
            <span className="sm:hidden">Downstream</span>
          </CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.suppliersWithChildren}</div>
          <p className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Have child suppliers</span>
            <span className="sm:hidden">Have children</span>
          </p>
        </CardContent>
      </Card>

      {/* Tier Distribution */}
      <Card className="col-span-2 md:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="h-4 w-4" />
            Tier Distribution
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Distribution of suppliers across supply chain tiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Tier 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className={getTierColor(1)} variant="secondary">
                  T1
                </Badge>
                <span className="text-xs sm:text-sm font-medium truncate">
                  <span className="hidden sm:inline">Direct Suppliers</span>
                  <span className="sm:hidden">Direct</span>
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {stats.tierCounts[1]} ({getTierProgress(stats.tierCounts[1]).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={getTierProgress(stats.tierCounts[1])} 
              className="h-2"
            />
          </div>

          {/* Tier 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className={getTierColor(2)} variant="secondary">
                  T2
                </Badge>
                <span className="text-xs sm:text-sm font-medium truncate">
                  <span className="hidden sm:inline">Indirect Suppliers</span>
                  <span className="sm:hidden">Indirect</span>
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {stats.tierCounts[2]} ({getTierProgress(stats.tierCounts[2]).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={getTierProgress(stats.tierCounts[2])} 
              className="h-2"
            />
          </div>

          {/* Tier 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className={getTierColor(3)} variant="secondary">
                  T3
                </Badge>
                <span className="text-xs sm:text-sm font-medium truncate">
                  <span className="hidden sm:inline">Sub-tier Suppliers</span>
                  <span className="sm:hidden">Sub-tier</span>
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {stats.tierCounts[3]} ({getTierProgress(stats.tierCounts[3]).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={getTierProgress(stats.tierCounts[3])} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hierarchy Health */}
      <Card className="col-span-2 md:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4" />
            Hierarchy Health
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Analysis of supply chain structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Coverage Ratio</span>
            <Badge variant="outline" className="text-xs">
              {stats.totalSuppliers > 0 
                ? `${((stats.suppliersWithChildren / stats.totalSuppliers) * 100).toFixed(1)}%`
                : '0%'
              }
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Leaf Suppliers</span>
            <Badge variant="outline" className="text-xs">
              {stats.leafSuppliers}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">Avg. Depth</span>
            <Badge variant="outline" className="text-xs">
              {stats.totalSuppliers > 0 
                ? (stats.maxDepth / 2).toFixed(1)
                : '0'
              }
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}