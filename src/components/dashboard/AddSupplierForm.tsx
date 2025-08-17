'use client'

import { useEffect, useState, useTransition } from 'react'
import { useActionState } from 'react'
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
import { CheckCircle, Loader2, Building2, MapPin, Users, AlertCircle, Info } from 'lucide-react'
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
 * Enhanced with comprehensive error handling, loading states, and user-friendly design
 * for non-tech-savvy users with clear field requirements and visual guidance
 */
export function AddSupplierForm({
  productId,
  tier,
  parentSupplierId = null,
  tier1Suppliers = [],
  tier2Suppliers = [],
  onFormSuccess
}: AddSupplierFormProps) {
  const [state, formAction] = useActionState(addSupplierToProduct, { message: null })
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Supplier Added Successfully!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your supply chain has been updated with the new Tier {tier} supplier.
          </p>
        </div>
        <DashboardLoadingState type="inline" message="Refreshing supply chain view..." />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form action={handleSubmit} className="space-y-6">
        {/* Hidden fields for context */}
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="tier" value={tier} />
        
        {/* Form Header with Requirements */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Required Information
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Please provide accurate supplier information to ensure proper supply chain mapping and compliance tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Supplier Company Name
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., ABC Manufacturing Co., Ltd."
                  {...field}
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription className="mt-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mt-0.5">
                    <AlertCircle className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <div className="space-y-1">
                    <span className="block text-sm text-gray-600 dark:text-gray-300">
                      Enter the official registered company name as it appears on business documents.
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      <strong>Examples:</strong> "Shanghai Textile Corp.", "Green Materials Inc.", "EcoPack Solutions"
                    </span>
                  </div>
                </div>
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
              <FormLabel className="flex items-center gap-2 text-base font-semibold">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Primary Operating Location
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Shanghai, China or New York, USA"
                  {...field}
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription className="mt-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mt-0.5">
                    <AlertCircle className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <div className="space-y-1">
                    <span className="block text-sm text-gray-600 dark:text-gray-300">
                      Specify the main city and country where this supplier operates or has their headquarters.
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      <strong>Format:</strong> "City, Country" - This helps with compliance and sustainability tracking.
                    </span>
                  </div>
                </div>
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
                <FormLabel className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Parent Supplier (Tier {tier - 1})
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || parentSupplierId || undefined}
                  disabled={isLoading || !!parentSupplierId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={`Choose a Tier ${tier - 1} supplier from the list`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableParents.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{supplier.name}</span>
                          <span className="text-xs text-gray-500">{supplier.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                              <FormDescription className="mt-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 mt-0.5">
                    <AlertCircle className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <div className="space-y-1">
                    <span className="block text-sm text-gray-600 dark:text-gray-300">
                      Select which Tier {tier - 1} supplier this new supplier will work with. This creates the supply chain hierarchy.
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      <strong>Why this matters:</strong> This helps track the complete supply chain and ensures proper compliance reporting.
                    </span>
                  </div>
                </div>
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
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[140px] h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Adding Supplier...
              </>
            ) : (
              <>
                <Building2 className="h-5 w-5 mr-2" />
                Add Supplier
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}