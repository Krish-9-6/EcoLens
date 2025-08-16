'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '<ecolens>/components/ui/card'
import { Button } from '<ecolens>/components/ui/button'
import { Badge } from '<ecolens>/components/ui/badge'
import { AddSupplierDialog } from '<ecolens>/components/dashboard/AddSupplierDialog'
import { 
  Plus, 
  MapPin, 
  Building2, 
  ArrowDown, 
  Users,
  ChevronRight,
  Network
} from 'lucide-react'
import { cn } from '<ecolens>/lib/utils'
import type { SupplierWithHierarchy } from '<ecolens>/lib/types'

interface SupplierTierColumnProps {
  tier: 1 | 2 | 3
  title: string
  description: string
  suppliers: SupplierWithHierarchy[]
  productId: string
  canAddSupplier: boolean
  parentSupplierId: string | null
  tier1Suppliers?: SupplierWithHierarchy[] // For tier 2 to show parent options
  tier2Suppliers?: SupplierWithHierarchy[] // For tier 3 to show parent options
}

/**
 * SupplierTierColumn Component - Enhanced visual tier-based supplier display
 * Requirements: 2.1, 2.2, 2.3, 6.3, 6.4
 * 
 * Displays suppliers for a specific tier with enhanced hierarchy visualization,
 * contextual add supplier functionality, and improved parent-child relationships
 */
export function SupplierTierColumn({
  tier,
  title,
  description,
  suppliers,
  productId,
  canAddSupplier,
  parentSupplierId,
  tier1Suppliers = [],
  tier2Suppliers = []
}: SupplierTierColumnProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Get tier-specific styling with enhanced colors
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100'
      case 2:
        return 'bg-green-50 border-green-200 text-green-800 shadow-green-100'
      case 3:
        return 'bg-purple-50 border-purple-200 text-purple-800 shadow-purple-100'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 shadow-gray-100'
    }
  }

  const getTierAccentColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'border-l-blue-400'
      case 2:
        return 'border-l-green-400'
      case 3:
        return 'border-l-purple-400'
      default:
        return 'border-l-gray-400'
    }
  }

  // Enhanced supplier grouping with hierarchy information
  const getSuppliersByParent = () => {
    if (tier === 1) {
      return [{ parent: null, suppliers, childrenCount: 0 }]
    }

    const parentSuppliers = tier === 2 ? tier1Suppliers : tier2Suppliers
    const groupedSuppliers: { 
      parent: SupplierWithHierarchy | null; 
      suppliers: SupplierWithHierarchy[];
      childrenCount: number;
    }[] = []

    // Group suppliers by their parent with enhanced metadata
    parentSuppliers.forEach(parent => {
      const childSuppliers = suppliers.filter(s => s.parent_supplier_id === parent.id)
      if (childSuppliers.length > 0) {
        // Count children in next tier
        const nextTierSuppliers = tier === 2 ? tier2Suppliers : []
        const childrenCount = nextTierSuppliers.filter(s => 
          childSuppliers.some(child => child.id === s.parent_supplier_id)
        ).length

        groupedSuppliers.push({ 
          parent, 
          suppliers: childSuppliers,
          childrenCount
        })
      }
    })

    return groupedSuppliers
  }

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const supplierGroups = getSuppliersByParent()

  return (
    <div className="space-y-4">
      {/* Enhanced Tier Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-1">
                <Badge className={cn(getTierColor(tier), "shadow-sm")}>
                  <Network className="h-3 w-3 mr-1" />
                  Tier {tier}
                </Badge>
                <span className="text-lg">{title}</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {suppliers.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {/* Enhanced Add Supplier Section */}
        <CardContent className="pt-0">
          {canAddSupplier ? (
            <AddSupplierDialog
              productId={productId}
              tier={tier}
              parentSupplierId={parentSupplierId}
              tier1Suppliers={tier1Suppliers}
              tier2Suppliers={tier2Suppliers}
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full hover:shadow-sm transition-shadow"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {title.split(' ')[1]} {title.split(' ')[2]}
              </Button>
            </AddSupplierDialog>
          ) : (
            <div className="text-center p-3 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">
                {tier === 2 
                  ? 'Add Tier 1 suppliers first to enable Tier 2'
                  : 'Add Tier 2 suppliers first to enable Tier 3'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Suppliers List with Hierarchy Visualization */}
      <div className="space-y-3">
        {supplierGroups.length > 0 ? (
          supplierGroups.map((group, groupIndex) => {
            const groupId = group.parent?.id || `root-${groupIndex}`
            const isExpanded = expandedGroups.has(groupId)
            
            return (
              <div key={groupIndex} className="space-y-2">
                {/* Enhanced Parent Supplier Header (for tier 2 and 3) */}
                {group.parent && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-md border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleGroup(groupId)}
                    >
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </Button>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">
                        Under: {group.parent.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {group.suppliers.length} supplier{group.suppliers.length !== 1 ? 's' : ''}
                      </Badge>
                      {group.childrenCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {group.childrenCount} downstream
                        </Badge>
                      )}
                    </div>
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                
                {/* Child Suppliers with Enhanced Cards */}
                <div className={cn(
                  "space-y-2 transition-all duration-200",
                  group.parent && !isExpanded && "hidden"
                )}>
                  {group.suppliers.map((supplier, supplierIndex) => {
                    const hasDownstreamSuppliers = tier < 3 && (
                      tier === 1 ? tier2Suppliers.some(s => s.parent_supplier_id === supplier.id) :
                      tier === 2 ? false : // Tier 2 has no downstream suppliers in this context
                      false // Tier 3 has no downstream
                    )

                    return (
                      <Card 
                        key={supplier.id} 
                        className={cn(
                          "border-l-4 transition-all duration-200 hover:shadow-md",
                          getTierAccentColor(tier),
                          group.parent && "ml-4"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Enhanced Supplier Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium truncate">{supplier.name}</h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={cn("text-xs", getTierColor(tier))}
                                  >
                                    T{supplier.tier}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{supplier.location}</span>
                                </div>

                                {/* Hierarchy Position Indicator */}
                                {supplier.parent_supplier_id && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span>Position:</span>
                                    <span className="font-mono bg-muted px-1 rounded">
                                      {supplierIndex + 1} of {group.suppliers.length}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Status Indicators */}
                              <div className="flex flex-col items-end gap-1">
                                {hasDownstreamSuppliers && (
                                  <Badge variant="outline" className="text-xs">
                                    Has downstream
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Enhanced Supplier Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                              
                              {/* Add Child Supplier Button (for tier 1 and 2) */}
                              {tier < 3 && (
                                <AddSupplierDialog
                                  productId={productId}
                                  tier={(tier + 1) as 2 | 3}
                                  parentSupplierId={supplier.id}
                                  tier1Suppliers={tier1Suppliers}
                                  tier2Suppliers={tier2Suppliers}
                                >
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-xs hover:bg-primary/5"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add T{tier + 1}
                                  </Button>
                                </AddSupplierDialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          /* Enhanced Empty State for This Tier */
          suppliers.length === 0 && (
            <Card className="border-dashed border-muted hover:border-muted-foreground/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="h-12 w-12 text-muted-foreground/30 mb-3">
                  <Building2 className="h-full w-full" />
                </div>
                <h4 className="font-medium text-muted-foreground mb-1">
                  No {title.toLowerCase()} yet
                </h4>
                <p className="text-sm text-muted-foreground/70 text-center">
                  {tier === 1 
                    ? "Start your supply chain here"
                    : `Add suppliers from Tier ${tier - 1} first`
                  }
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}