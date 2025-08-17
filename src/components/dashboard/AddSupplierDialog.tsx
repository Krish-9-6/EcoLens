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
import { Building2, Users, Globe, ArrowRight } from 'lucide-react'

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
 * Enhanced with state-of-the-art design, bold typography, and user-friendly descriptions
 * for non-tech-savvy users with clear field requirements and visual hierarchy
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

  // Generate dynamic title with icons and bold styling
  const getDialogTitle = () => {
    const baseTitle = `Add Tier ${tier} Supplier`
    const icon = tier === 1 ? Building2 : tier === 2 ? Users : Globe
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
          {icon && <icon.type {...icon.props} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {baseTitle}
          </h2>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Supply Chain Level {tier}
          </p>
        </div>
      </div>
    )
  }

  // Generate enhanced description with visual elements
  const getDialogDescription = () => {
    const descriptions = {
      1: {
        title: "Direct Supply Partner",
        description: "This supplier directly provides materials, components, or services to your brand. They are your immediate supply chain partners.",
        examples: "Examples: Raw material suppliers, component manufacturers, packaging providers",
        icon: Building2
      },
      2: {
        title: "Secondary Supply Partner", 
        description: "This supplier provides materials or services to your Tier 1 suppliers, creating a deeper supply chain network.",
        examples: "Examples: Sub-component suppliers, specialized material providers, logistics partners",
        icon: Users
      },
      3: {
        title: "Tertiary Supply Partner",
        description: "This supplier supports your Tier 2 suppliers, representing the deepest level of your supply chain.",
        examples: "Examples: Raw material extractors, specialized service providers, regional distributors",
        icon: Globe
      }
    }

    const tierInfo = descriptions[tier as keyof typeof descriptions]
    const IconComponent = tierInfo.icon

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {tierInfo.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {tierInfo.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {tierInfo.examples}
            </p>
          </div>
        </div>
        
        {/* Supply Chain Visualization */}
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="font-medium">Your Brand</span>
            </div>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="font-medium">Tier 1</span>
            </div>
            {tier > 1 && (
              <>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="font-medium">Tier 2</span>
                </div>
              </>
            )}
            {tier > 2 && (
              <>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="font-medium">Tier 3</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-6">
          <DialogTitle asChild>
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription asChild>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <AddSupplierForm
            productId={productId}
            tier={tier}
            parentSupplierId={parentSupplierId}
            tier1Suppliers={tier1Suppliers}
            tier2Suppliers={tier2Suppliers}
            onFormSuccess={handleFormSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}