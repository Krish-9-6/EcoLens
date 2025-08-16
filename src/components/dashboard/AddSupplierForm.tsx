'use client'

import { useEffect, useState, useTransition } from 'react'
import { useFormState } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '<ecolens>/lib/schemas'
import { addSupplierToProduct } from '<ecolens>/app/actions'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '<ecolens>/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '<ecolens>/components/ui/select'
import { Input } from '<ecolens>/components/ui/input'
import { Button } from '<ecolens>/components/ui/button'
import { ErrorMessage, getUserFriendlyErrorMessage } from '<ecolens>/components/dashboard/ErrorMessage'
import { DashboardLoadingState } from '<ecolens>/components/dashboard/DashboardLoadingState'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { SupplierWithHierarchy } from '<ecolens>/lib/types'
import { z } from 'zod'

interface AddSupplierFormProps {
  productId: string
  tier: 1 | 2 | 3
  parentSupplierId?: string | null
  tier1Suppliers?: SupplierWithHierarchy[]
  tier2Suppliers?: SupplierWithHierarchy[]
  onFormSuccess: () => void
}

/**
 * AddSupplierForm Component - Context-aware supplier creation form
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Enhanced with comprehensive error handling, loading states, and optimistic UI updates
 * Handles supplier creation with tier-based validation and parent selection
 */
export function AddSupplierForm({
  productId,
  tier,
  parentSupplierId = null,
  tier1Suppliers = [],
  tier2Suppliers = [],
  onFormSuccess
}: AddSupplierFormProps) {
  const [state, formAction] = useFormState(addSupplierToProduct, { message: null })
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)

  // Form setup with Zod validation
  const form = useForm<z.infer<typeof SupplierSchema>>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: '',
      tier: tier,
      location: '',
      productId: productId,
      parentSupplierId: parentSupplierId
    }
  })

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.errors) {
      setIsSubmitting(false)
      setErrorDismissed(false)
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as keyof typeof form.formState.errors, {
            message: messages[0]
          })
        }
      })
    }
  }, [state?.errors, form])

  // Handle successful submission
  useEffect(() => {
    if (state?.message === 'Supplier added successfully!') {
      setShowSuccess(true)
      setIsSubmitting(false)
      
      // Show success state briefly before closing
      setTimeout(() => {
        form.reset()
        setShowSuccess(false)
        onFormSuccess()
      }, 1500)
    }
  }, [state?.message, form, onFormSuccess])

  // Handle server errors
  useEffect(() => {
    if (state?.message && state.message !== 'Supplier added successfully!') {
      setIsSubmitting(false)
      setErrorDismissed(false)
    }
  }, [state?.message])

  // Get available parent suppliers based on tier
  const getAvailableParents = () => {
    if (tier === 1) return []
    if (tier === 2) return tier1Suppliers
    if (tier === 3) return tier2Suppliers
    return []
  }

  const availableParents = getAvailableParents()

  const isLoading = isSubmitting || isPending || form.formState.isSubmitting

  // Enhanced form submission with optimistic updates
  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true)
    setErrorDismissed(false)
    
    startTransition(() => {
      formAction(formData)
    })
  }

  // Show success state
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Supplier Added!</h3>
          <p className="text-sm text-gray-600 mt-1">
            Updating supply chain view...
          </p>
        </div>
        <DashboardLoadingState type="inline" message="Refreshing..." />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form action={handleSubmit} className="space-y-4">
        {/* Hidden fields for context */}
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="tier" value={tier} />
        
        {/* Supplier Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter supplier name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The name of the supplier company or organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Shanghai, China"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                The primary location or country where this supplier operates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Supplier Selection (for Tier 2 and 3) */}
        {tier > 1 && availableParents.length > 0 && (
          <FormField
            control={form.control}
            name="parentSupplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Parent Supplier (Tier {tier - 1})
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || parentSupplierId || undefined}
                  disabled={isLoading || !!parentSupplierId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a Tier ${tier - 1} supplier`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableParents.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This supplier will be linked as a sub-supplier to the selected Tier {tier - 1} supplier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Hidden parent supplier ID if pre-selected */}
        {parentSupplierId && (
          <input type="hidden" name="parentSupplierId" value={parentSupplierId} />
        )}

        {/* Enhanced error message display */}
        {state?.message && state.message !== 'Supplier added successfully!' && !errorDismissed && (
          <ErrorMessage
            {...getUserFriendlyErrorMessage(state.message)}
            dismissible
            onDismiss={() => setErrorDismissed(true)}
            action={{
              label: 'Try Again',
              onClick: () => {
                setErrorDismissed(true)
                form.reset({
                  name: '',
                  tier: tier,
                  location: '',
                  productId: productId,
                  parentSupplierId: parentSupplierId
                })
              }
            }}
          />
        )}

        {/* Loading state overlay */}
        {isLoading && (
          <DashboardLoadingState 
            type="form" 
            message="Adding supplier to your supply chain..." 
            className="py-4"
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              'Add Supplier'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}