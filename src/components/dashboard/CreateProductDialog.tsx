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

interface CreateProductDialogProps {
  children: React.ReactNode
}

/**
 * CreateProductDialog Component - Modal for product creation
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Provides a modal interface for creating new products with form integration
 * and success handling that closes the dialog automatically
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your brand catalog. You can add suppliers and build the supply chain after creation.
          </DialogDescription>
        </DialogHeader>
        <CreateProductForm onFormSuccess={handleFormSuccess} />
      </DialogContent>
    </Dialog>
  )
}