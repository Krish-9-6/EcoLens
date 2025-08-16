'use client'

import { useState, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '<ecolens>/components/ui/dialog'
import { AddSupplierForm } from '<ecolens>/components/dashboard/AddSupplierForm'
import type { SupplierWithHierarchy } from '<ecolens>/lib/types'

interface AddSupplierDialogProps {
  children: ReactNode
  productId: string
  tier: 1 | 2 | 3
  parentSupplierId?: string | null
  tier1Suppliers?: SupplierWithHierarchy[]
  tier2Suppliers?: SupplierWithHierarchy[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * AddSupplierDialog Component - Context-aware supplier addition modal
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Provides modal interface for adding suppliers with dynamic titles
 * and parent supplier selection based on tier and context
 */
export function AddSupplierDialog({
  children,
  productId,
  tier,
  parentSupplierId = null,
  tier1Suppliers = [],
  tier2Suppliers = [],
  open,
  onOpenChange
}: AddSupplierDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use controlled or uncontrolled state
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  // Generate dynamic title based on tier and context
  const getDialogTitle = () => {
    switch (tier) {
      case 1:
        return 'Add Tier 1 Supplier'
      case 2:
        return parentSupplierId 
          ? `Add Tier 2 Supplier`
          : 'Add Tier 2 Supplier'
      case 3:
        return parentSupplierId 
          ? `Add Tier 3 Supplier`
          : 'Add Tier 3 Supplier'
      default:
        return 'Add Supplier'
    }
  }

  // Generate dynamic description based on tier
  const getDialogDescription = () => {
    switch (tier) {
      case 1:
        return 'Add a direct supplier to your brand. Tier 1 suppliers are your immediate supply chain partners.'
      case 2:
        return 'Add a supplier that provides materials or services to your Tier 1 suppliers.'
      case 3:
        return 'Add a supplier that provides materials or services to your Tier 2 suppliers.'
      default:
        return 'Add a new supplier to your supply chain.'
    }
  }

  // Handle successful form submission
  const handleFormSuccess = () => {
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <AddSupplierForm
          productId={productId}
          tier={tier}
          parentSupplierId={parentSupplierId}
          tier1Suppliers={tier1Suppliers}
          tier2Suppliers={tier2Suppliers}
          onFormSuccess={handleFormSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}