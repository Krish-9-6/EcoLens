'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '<ecolens>/components/ui/dialog'
import { CreateProductForm } from './CreateProductForm'
import { Package, Sparkles } from 'lucide-react'

interface CreateProductDialogProps {
  children: React.ReactNode
}

/**
 * CreateProductDialog Component - Modal for product creation
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Enhanced with state-of-the-art design, bold typography, and user-friendly descriptions
 * for non-tech-savvy users with clear field requirements and visual hierarchy
 */
export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false)

  const handleFormSuccess = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-hidden bg-black text-white border border-slate-800 p-4">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle asChild>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30">
                <Package className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Create New Product
                </h2>
                <p className="text-emerald-400 font-medium text-sm">
                  Product Catalog Management
                </p>
              </div>
            </div>
          </DialogTitle>
          
          <DialogDescription asChild>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">
                    Product Information Setup
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Add a new product to your brand catalog with comprehensive sustainability tracking.
                  </p>
                </div>
              </div>
              
              {/* Product Creation Benefits */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-slate-700">
                <div className="grid grid-cols-4 gap-3 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    <span className="text-white text-xs">Supply Chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-white text-xs">Compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                    <span className="text-white text-xs">Sustainability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                    <span className="text-white text-xs">AI Content</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-hidden">
          <CreateProductForm onFormSuccess={handleFormSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}