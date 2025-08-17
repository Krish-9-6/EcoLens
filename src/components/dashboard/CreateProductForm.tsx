'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
import { createProduct, generateProductContent } from '<ecolens>/app/actions'
import { ProductSchema, MaterialCompositionSchema } from '<ecolens>/lib/schemas'
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
import { Textarea } from '<ecolens>/components/ui/textarea'
import { ErrorMessage, getUserFriendlyErrorMessage } from '<ecolens>/components/dashboard/ErrorMessage'
import { DashboardLoadingState } from '<ecolens>/components/dashboard/DashboardLoadingState'
import { Loader2, Plus, Trash2, Sparkles, Package, Hash, Percent, FileText, Info, AlertCircle, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

interface CreateProductFormProps {
  onFormSuccess: () => void
}

type FormData = z.infer<typeof ProductSchema>

/**
 * Enhanced CreateProductForm Component - Advanced form for creating new products with AI assistance
 * Features: Comprehensive product data capture, AI-powered content generation, material composition management
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function CreateProductForm({ onFormSuccess }: CreateProductFormProps) {
  const [state, formAction] = useActionState(createProduct, { message: null })
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      care_instructions: '',
      end_of_life_options: '',
      material_composition: []
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "material_composition"
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
    if (state?.message === 'Product created successfully!') {
      setIsSubmitting(false)
      
      // Show success state briefly before closing
      setTimeout(() => {
        form.reset()
        onFormSuccess()
      }, 1500)
    }
  }, [state?.message, form, onFormSuccess])

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
      setErrorDismissed(false)
    }
  }, [form])

  const isLoading = isSubmitting || isPending || form.formState.isSubmitting

  // Enhanced form submission with optimistic updates
  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true)
    setErrorDismissed(false)
    
    // Convert form data to FormData for server action
    const submitData = new FormData()
    submitData.append('name', formData.name)
    if (formData.sku) submitData.append('sku', formData.sku)
    if (formData.description) submitData.append('description', formData.description)
    if (formData.care_instructions) submitData.append('care_instructions', formData.care_instructions)
    if (formData.end_of_life_options) submitData.append('end_of_life_options', formData.end_of_life_options)
    if (formData.material_composition && formData.material_composition.length > 0) {
      submitData.append('material_composition', JSON.stringify(formData.material_composition))
    }
    
    startTransition(() => {
      formAction(submitData)
    })
  }

  // AI-powered content generation
  const handleGenerateContent = async () => {
    const productName = form.getValues('name')
    const materials = form.getValues('material_composition') || []
    
    if (!productName.trim()) {
      toast.error('Please enter a product name first')
      return
    }

    setIsGeneratingAI(true)
    
    try {
      const result = await generateProductContent(productName, materials)
      
      if (result.success) {
        if (result.description) {
          form.setValue('description', result.description)
        }
        if (result.careInstructions) {
          form.setValue('care_instructions', result.careInstructions)
        }
        
        // Show success message with model information if available
        const modelInfo = result.modelUsed ? ` using ${result.modelUsed}` : ''
        toast.success(`AI content generated successfully${modelInfo}!`)
      } else {
        toast.error(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      toast.error('Failed to generate content')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Add new material composition field
  const addMaterial = () => {
    append({ material: '', percent: 0 })
  }

  // Remove material composition field
  const removeMaterial = (index: number) => {
    remove(index)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate role="form">
        {/* Form Header with Requirements */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-start gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30">
              <Info className="h-2.5 w-2.5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                Product Information Required
              </h4>
              <p className="text-slate-300 text-xs">
                Provide comprehensive product details to enable supply chain mapping, compliance tracking, and sustainability reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Column 1 - Basic Information */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              Basic Information
            </h3>
            
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                    Product Name
                    <span className="text-red-400 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Organic Cotton T-Shirt"
                      {...field}
                      disabled={isLoading}
                      aria-describedby="name-description name-error"
                      autoComplete="off"
                      maxLength={255}
                      className="h-9 text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </FormControl>
                  <FormDescription id="name-description" className="mt-1">
                    <div className="flex items-start gap-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 mt-0.5">
                        <AlertCircle className="h-2 w-2 text-emerald-400" />
                      </span>
                      <span className="text-xs text-slate-300">
                        Choose a clear, descriptive name that customers will recognize.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage id="name-error" />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                    <Hash className="h-3 w-3 text-emerald-400" />
                    SKU (Stock Keeping Unit)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., ECO-TSHIRT-001"
                      {...field}
                      disabled={isLoading}
                      maxLength={100}
                      className="h-9 text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </FormControl>
                  <FormDescription className="mt-1">
                    <div className="flex items-start gap-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 mt-0.5">
                        <AlertCircle className="h-2 w-2 text-emerald-400" />
                      </span>
                      <span className="text-xs text-slate-300">
                        Optional unique identifier for inventory management.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Column 2 - Material Composition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-400" />
                Material Composition
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                disabled={isLoading}
                className="flex items-center gap-1 h-7 px-2 text-xs border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
              >
                <Plus className="h-3 w-3" />
                Add Material
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start p-2 bg-slate-800 rounded-lg border border-slate-700">
                <FormField
                  control={form.control}
                  name={`material_composition.${index}.material`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs font-bold text-slate-300">
                        Material {index + 1}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Organic Cotton"
                          {...field}
                          disabled={isLoading}
                          className="h-7 text-xs bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`material_composition.${index}.percent`}
                  render={({ field }) => (
                    <FormItem className="w-16">
                      <FormLabel className="text-xs font-bold text-slate-300">
                        %
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="%"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isLoading}
                          min="0"
                          max="100"
                          className="h-7 text-xs bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  disabled={isLoading}
                  className="mt-5 h-7 w-7 p-0 border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {fields.length === 0 && (
              <div className="flex items-start gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-700 border border-slate-600 mt-0.5">
                  <Info className="h-2 w-2 text-slate-400" />
                </div>
                <span className="text-xs text-slate-300">
                  No materials added yet. Add materials to enable AI-powered content generation.
                </span>
              </div>
            )}
          </div>

          {/* Column 3 - Content & AI */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              Product Content
            </h3>

            {/* AI Content Generation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  AI-Powered Content Generation
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={isLoading || isGeneratingAI || !form.getValues('name').trim()}
                  className="flex items-center gap-1 h-7 px-2 text-xs border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {isGeneratingAI ? 'Generating...' : '✨ Generate with AI'}
                </Button>
              </div>
              <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-purple-900/20 to-emerald-900/20 rounded-lg border border-purple-400/30">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500/20 border border-purple-400/30 mt-0.5">
                  <Lightbulb className="h-2 w-2 text-purple-400" />
                </div>
                <span className="text-xs text-slate-300">
                  Use AI to generate compelling product descriptions and care instructions based on your product name and materials.
                </span>
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                    Product Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product's features, sustainability benefits, and value proposition..."
                      {...field}
                      disabled={isLoading}
                      rows={2}
                      maxLength={1000}
                      className="text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </FormControl>
                  <FormDescription className="mt-1">
                    <div className="flex items-start gap-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 mt-0.5">
                        <AlertCircle className="h-2 w-2 text-emerald-400" />
                      </span>
                      <span className="text-xs text-slate-300">
                        Compelling description highlighting sustainability features and product benefits.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Care Instructions */}
            <FormField
              control={form.control}
              name="care_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                    Care Instructions
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide washing, care, and maintenance instructions with sustainability tips..."
                      {...field}
                      disabled={isLoading}
                      rows={2}
                      maxLength={2000}
                      className="text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </FormControl>
                  <FormDescription className="mt-1">
                    <div className="flex items-start gap-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 mt-0.5">
                        <AlertCircle className="h-2 w-2 text-emerald-400" />
                      </span>
                      <span className="text-xs text-slate-300">
                        Washing and care guidance with sustainability tips to extend product life.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End of Life Options */}
            <FormField
              control={form.control}
              name="end_of_life_options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-bold text-white">
                    End-of-Life Options
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe sustainable disposal, recycling, or upcycling options for the product..."
                      {...field}
                      disabled={isLoading}
                      rows={2}
                      maxLength={1000}
                      className="text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </FormControl>
                  <FormDescription className="mt-1">
                    <div className="flex items-start gap-2">
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30 mt-0.5">
                        <AlertCircle className="h-2 w-2 text-emerald-400" />
                      </span>
                      <span className="text-xs text-slate-300">
                        Sustainable disposal, recycling, or upcycling options to minimize environmental impact.
                      </span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => onFormSuccess()}
            disabled={isLoading}
            className="w-full sm:w-auto h-9 text-sm border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !form.formState.isValid}
            className="w-full sm:w-auto h-9 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black"
            aria-describedby={isLoading ? "loading-description" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                <span id="loading-description">Creating Product...</span>
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}