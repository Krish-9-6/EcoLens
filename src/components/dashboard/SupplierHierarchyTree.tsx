'use client'

import { useState } from 'react'
import { Card, CardContent } from '<ecolens>/components/ui/card'
import { Button } from '<ecolens>/components/ui/button'
import { Badge } from '<ecolens>/components/ui/badge'
import { AddSupplierDialog } from '<ecolens>/components/dashboard/AddSupplierDialog'
import { 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Building2, 
  Plus,
  ArrowDown,
  Users
} from 'lucide-react'
import { cn } from '<ecolens>/lib/utils'
import type { HierarchyNode, SupplierHierarchy } from '<ecolens>/lib/hierarchy'

interface SupplierHierarchyTreeProps {
  hierarchy: SupplierHierarchy
  productId: string
  className?: string
}

/**
 * SupplierHierarchyTree Component - Visual tree display of supplier hierarchy
 * Requirements: 2.1, 2.2, 2.3, 6.3, 6.4
 * 
 * Displays suppliers in a tree structure showing parent-child relationships
 * with collapsible nodes and contextual actions
 */
export function SupplierHierarchyTree({ 
  hierarchy, 
  productId, 
  className 
}: SupplierHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 2:
        return 'bg-green-50 border-green-200 text-green-800'
      case 3:
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const renderSupplierNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0
    const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : ''

    return (
      <div key={node.id} className="space-y-2">
        {/* Supplier Node */}
        <Card className={cn(
          "border-l-4 transition-all duration-200 hover:shadow-md",
          level === 0 ? "border-l-primary" : "border-l-muted",
          indentClass
        )}>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              {/* Node Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Expand/Collapse Button */}
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 mt-0.5 flex-shrink-0"
                      onClick={() => toggleNode(node.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium truncate text-sm sm:text-base">{node.name}</h4>
                      <Badge className={getTierColor(node.tier)} variant="secondary">
                        T{node.tier}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{node.location}</span>
                    </div>

                    {/* Hierarchy Path - Hidden on mobile for space */}
                    {node.path.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>Path:</span>
                        {node.path.map((pathId, index) => {
                          const pathSupplier = hierarchy.allSuppliers.find(s => s.id === pathId)
                          return (
                            <span key={pathId} className="flex items-center gap-1">
                              {index > 0 && <ArrowDown className="h-3 w-3" />}
                              <span className="truncate max-w-20">
                                {pathSupplier?.name || 'Unknown'}
                              </span>
                            </span>
                          )
                        })}
                        <ArrowDown className="h-3 w-3" />
                        <span className="font-medium">{node.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Children Count Badge */}
                {hasChildren && (
                  <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0">
                    <Users className="h-3 w-3" />
                    <span className="hidden sm:inline">{node.children.length}</span>
                    <span className="sm:hidden">{node.children.length}</span>
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 pt-2 border-t flex-wrap">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Details</span>
                </Button>
                
                {/* Add Child Supplier Button */}
                {node.tier < 3 && (
                  <AddSupplierDialog
                    productId={productId}
                    tier={(node.tier + 1) as 2 | 3}
                    parentSupplierId={node.id}
                    tier1Suppliers={hierarchy.tiers[1].suppliers}
                    tier2Suppliers={hierarchy.tiers[2].suppliers}
                  >
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Add T{node.tier + 1}</span>
                      <span className="sm:hidden">+T{node.tier + 1}</span>
                    </Button>
                  </AddSupplierDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Nodes */}
        {hasChildren && isExpanded && (
          <div className="space-y-2 relative">
            {/* Connection Line - Hidden on mobile for cleaner look */}
            <div className={cn(
              "hidden sm:block absolute left-6 top-0 bottom-0 w-px bg-border",
              indentClass
            )} />
            
            {node.children.map(child => renderSupplierNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Get root suppliers (Tier 1 suppliers with no parent)
  const rootSuppliers = hierarchy.tiers[1].rootSuppliers

  if (rootSuppliers.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 text-muted-foreground/50 mb-4">
            <Building2 className="h-full w-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Supply Chain Yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Start building your supply chain by adding your first Tier 1 supplier.
          </p>
          <AddSupplierDialog
            productId={productId}
            tier={1}
            parentSupplierId={null}
            tier1Suppliers={[]}
            tier2Suppliers={[]}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Supplier
            </Button>
          </AddSupplierDialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hierarchy Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total: {hierarchy.totalSuppliers} suppliers</span>
        <span>Max Depth: {hierarchy.maxDepth + 1} levels</span>
        <span>
          Distribution: T1({hierarchy.tiers[1].totalCount}) • 
          T2({hierarchy.tiers[2].totalCount}) • 
          T3({hierarchy.tiers[3].totalCount})
        </span>
      </div>

      {/* Tree Structure */}
      <div className="space-y-4">
        {rootSuppliers.map(supplier => renderSupplierNode(supplier))}
      </div>
    </div>
  )
}