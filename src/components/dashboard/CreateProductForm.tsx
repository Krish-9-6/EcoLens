'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormState } from 'react-dom'
import { createProduct } from '<ecolens>/app/actions'
import { ProductSchema } from '<ecolens>/lib/schemas'
import { Button } from '<ecolens>/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '<ecolens>/components/ui/form'
import { Input } from '<ecolens>/components/ui/input'
import { ErrorMessage, getUserFriendlyErrorMessage } from '<ecolens>/components/dashboard/ErrorMessage'
import { DashboardLoadingState } from '<ecolens>/components/dashboard/DashboardLoadingState'
import { Loader2, CheckCircle } from 'lucide-react'
import type { z } from 'zod'

interface CreateProductFormProps {
  onFormSuccess: () => void
}

/**
 * CreateProductForm Component - Form for creating new products
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Enhanced with comprehensive error handling, loading states, and optimistic UI updates
 * Provides client-side validation and server-side error handling with user-friendly messages
 */
export function CreateProductForm({ onFormSuccess }: CreateProductFormProps) {
  const [state, formAction] = useFormState(createProduct, { message: null })
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)
  
  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
    },
  })

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.errors) {
      setIsSubmitting(false)
      setErrorDismissed(false)
      Object.entries(state.errors).forEach(([field, messages]) => {
        form.setError(field as keyof typeof form.formState.errors, {
          message: messages?.[0],
        })
      })
    }
  }, [state?.errors, form])

  // Handle successful form submission (redirect happens in server action)
  useEffect(() => {
    if (state?.message === null && !state?.errors && form.formState.isSubmitSuccessful) {
      setShowSuccess(true)
      setIsSubmitting(false)
      
      // Show success state briefly before closing
      setTimeout(() => {
        form.reset()
        setShowSuccess(false)
        onFormSuccess()
      }, 1500)
    }
  }, [state, form.formState.isSubmitSuccessful, onFormSuccess, form])

  // Handle server errors
  useEffect(() => {
    if (state?.message && state.message !== null) {
      setIsSubmitting(false)
      setErrorDismissed(false)
    }
  }, [state?.message])

  // Reset form when dialog is opened (via prop changes)
  useEffect(() => {
    if (!form.formState.isSubmitting && !form.formState.isSubmitSuccessful) {
      form.reset()
      setShowSuccess(false)
      setErrorDismissed(false)
    }
  }, [form])

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
          <h3 className="text-lg font-medium text-gray-900">Product Created!</h3>
          <p className="text-sm text-gray-600 mt-1">
            Redirecting to your new product...
          </p>
        </div>
        <DashboardLoadingState type="inline" message="Redirecting..." />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form action={handleSubmit} className="space-y-4" noValidate role="form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product name"
                  {...field}
                  disabled={isLoading}
                  aria-describedby="name-description name-error"
                  autoComplete="off"
                  maxLength={255}
                />
              </FormControl>
              <FormDescription id="name-description">
                Choose a descriptive name for your product (minimum 3 characters)
              </FormDescription>
              <FormMessage id="name-error" />
            </FormItem>
          )}
        />

        {/* Enhanced error message display */}
        {state?.message && !errorDismissed && (
          <ErrorMessage
            {...getUserFriendlyErrorMessage(state.message)}
            dismissible
            onDismiss={() => setErrorDismissed(true)}
            action={{
              label: 'Try Again',
              onClick: () => {
                setErrorDismissed(true)
                form.reset()
              }
            }}
          />
        )}

        {/* Loading state overlay */}
        {isLoading && (
          <DashboardLoadingState 
            type="form" 
            message="Creating your product..." 
            className="py-4"
          />
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onFormSuccess()}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !form.formState.isValid}
            className="w-full sm:w-auto"
            aria-describedby={isLoading ? "loading-description" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                <span id="loading-description">Creating...</span>
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}