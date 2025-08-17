/**
 * Supply Chain Hierarchy Processing Utilities
 * Requirements: 2.1, 2.2, 2.3, 6.3, 6.4
 * 
 * Utilities for processing and organizing supplier hierarchy data
 * for visual display in the brand dashboard
 */

import type { SupplierWithHierarchy } from './types'

export interface HierarchyNode extends SupplierWithHierarchy {
  children: HierarchyNode[]
  depth: number
  hasChildren: boolean
  isRoot: boolean
  path: string[] // Array of supplier IDs from root to this node
}

export interface TierGroup {
  tier: 1 | 2 | 3
  suppliers: HierarchyNode[]
  rootSuppliers: HierarchyNode[] // Top-level suppliers for this tier
  totalCount: number
}

export interface SupplierHierarchy {
  tiers: {
    1: TierGroup
    2: TierGroup  
    3: TierGroup
  }
  allSuppliers: HierarchyNode[]
  maxDepth: number
  totalSuppliers: number
}

/**
 * Builds a complete hierarchy tree from flat supplier array
 * @param suppliers - Flat array of suppliers with parent relationships
 * @returns SupplierHierarchy - Organized hierarchy structure
 */
export function buildSupplierHierarchy(suppliers: SupplierWithHierarchy[]): SupplierHierarchy {
  // Create a map for quick lookups
  const supplierMap = new Map<string, HierarchyNode>()
  
  // Initialize all suppliers as hierarchy nodes
  suppliers.forEach(supplier => {
    supplierMap.set(supplier.id, {
      ...supplier,
      children: [],
      depth: 0,
      hasChildren: false,
      isRoot: supplier.parent_supplier_id === null,
      path: []
    })
  })

  // Build parent-child relationships and calculate depths
  const rootNodes: HierarchyNode[] = []
  
  suppliers.forEach(supplier => {
    const node = supplierMap.get(supplier.id)!
    
    if (supplier.parent_supplier_id) {
      const parent = supplierMap.get(supplier.parent_supplier_id)
      if (parent) {
        parent.children.push(node)
        parent.hasChildren = true
        node.depth = parent.depth + 1
        node.path = [...parent.path, parent.id]
      }
    } else {
      rootNodes.push(node)
      node.path = []
    }
  })

  // Sort children by name for consistent display
  const sortChildren = (node: HierarchyNode) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name))
    node.children.forEach(sortChildren)
  }
  
  rootNodes.forEach(sortChildren)
  rootNodes.sort((a, b) => a.name.localeCompare(b.name))

  // Organize by tiers
  const allNodes = Array.from(supplierMap.values())
  const maxDepth = Math.max(...allNodes.map(n => n.depth), 0)

  const tiers = {
    1: createTierGroup(1, allNodes),
    2: createTierGroup(2, allNodes),
    3: createTierGroup(3, allNodes)
  }

  return {
    tiers,
    allSuppliers: allNodes,
    maxDepth,
    totalSuppliers: suppliers.length
  }
}

/**
 * Creates a tier group with organized supplier data
 */
function createTierGroup(tier: 1 | 2 | 3, allNodes: HierarchyNode[]): TierGroup {
  const tierSuppliers = allNodes.filter(node => node.tier === tier)
  const rootSuppliers = tierSuppliers.filter(node => 
    tier === 1 ? node.isRoot : node.parent_supplier_id !== null
  )

  return {
    tier,
    suppliers: tierSuppliers,
    rootSuppliers,
    totalCount: tierSuppliers.length
  }
}

/**
 * Gets all child suppliers for a given parent supplier
 * @param parentId - ID of the parent supplier
 * @param hierarchy - Complete hierarchy structure
 * @returns Array of direct child suppliers
 */
export function getChildSuppliers(parentId: string, hierarchy: SupplierHierarchy): HierarchyNode[] {
  const parent = hierarchy.allSuppliers.find(s => s.id === parentId)
  return parent?.children || []
}

/**
 * Gets all suppliers that can be parents for a given tier
 * @param tier - Target tier (2 or 3)
 * @param hierarchy - Complete hierarchy structure
 * @returns Array of potential parent suppliers
 */
export function getPotentialParents(tier: 2 | 3, hierarchy: SupplierHierarchy): HierarchyNode[] {
  const parentTier = (tier - 1) as 1 | 2
  return hierarchy.tiers[parentTier].suppliers
}

/**
 * Checks if a supplier has children in the next tier
 * @param supplierId - ID of the supplier to check
 * @param hierarchy - Complete hierarchy structure
 * @returns boolean indicating if supplier has children
 */
export function hasChildrenInNextTier(supplierId: string, hierarchy: SupplierHierarchy): boolean {
  const supplier = hierarchy.allSuppliers.find(s => s.id === supplierId)
  return supplier?.hasChildren || false
}

/**
 * Gets the complete path from root to a specific supplier
 * @param supplierId - ID of the target supplier
 * @param hierarchy - Complete hierarchy structure
 * @returns Array of supplier names representing the path
 */
export function getSupplierPath(supplierId: string, hierarchy: SupplierHierarchy): string[] {
  const supplier = hierarchy.allSuppliers.find(s => s.id === supplierId)
  if (!supplier) return []

  const pathSuppliers = supplier.path.map(id => 
    hierarchy.allSuppliers.find(s => s.id === id)?.name || 'Unknown'
  )
  
  return [...pathSuppliers, supplier.name]
}

/**
 * Groups suppliers by their immediate parent for display purposes
 * @param suppliers - Array of suppliers to group
 * @returns Map of parent ID to child suppliers
 */
export function groupSuppliersByParent(suppliers: HierarchyNode[]): Map<string | null, HierarchyNode[]> {
  const groups = new Map<string | null, HierarchyNode[]>()
  
  suppliers.forEach(supplier => {
    const parentId = supplier.parent_supplier_id
    if (!groups.has(parentId)) {
      groups.set(parentId, [])
    }
    groups.get(parentId)!.push(supplier)
  })

  // Sort each group by name
  groups.forEach(group => {
    group.sort((a, b) => a.name.localeCompare(b.name))
  })

  return groups
}

/**
 * Calculates hierarchy statistics for display
 * @param hierarchy - Complete hierarchy structure
 * @returns Statistics object with counts and metrics
 */
export function getHierarchyStats(hierarchy: SupplierHierarchy) {
  const stats = {
    totalSuppliers: hierarchy.totalSuppliers,
    maxDepth: hierarchy.maxDepth,
    tierCounts: {
      1: hierarchy.tiers[1].totalCount,
      2: hierarchy.tiers[2].totalCount,
      3: hierarchy.tiers[3].totalCount
    },
    rootSuppliers: hierarchy.tiers[1].rootSuppliers.length,
    suppliersWithChildren: hierarchy.allSuppliers.filter(s => s.hasChildren).length,
    leafSuppliers: hierarchy.allSuppliers.filter(s => !s.hasChildren).length
  }

  return stats
}