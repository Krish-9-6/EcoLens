import { z } from 'zod'

/**
 * Validation schema for product creation and updates
 * Requirements: 4.1, 4.2 - Form validation with specific rules
 */
export const ProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(255, "Product name must not exceed 255 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Product name cannot be empty or only whitespace"
    })
})

/**
 * Validation schema for supplier creation and updates
 * Requirements: 2.2, 2.6 - Supplier tier validation and hierarchy rules
 */
export const SupplierSchema = z.object({
  name: z
    .string()
    .min(3, "Supplier name must be at least 3 characters")
    .max(255, "Supplier name must not exceed 255 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Supplier name cannot be empty or only whitespace"
    }),
  
  tier: z
    .number()
    .int("Tier must be a whole number")
    .min(1, "Tier must be 1, 2, or 3")
    .max(3, "Tier must be 1, 2, or 3"),
  
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(255, "Location must not exceed 255 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Location cannot be empty or only whitespace"
    }),
  
  productId: z
    .string()
    .uuid("Product ID must be a valid UUID"),
  
  parentSupplierId: z
    .string()
    .uuid("Parent supplier ID must be a valid UUID")
    .optional()
    .nullable()
})
.refine((data) => {
  // Tier 1 suppliers should not have a parent
  if (data.tier === 1 && data.parentSupplierId) {
    return false
  }
  // Tier 2 and 3 suppliers must have a parent
  if ((data.tier === 2 || data.tier === 3) && !data.parentSupplierId) {
    return false
  }
  return true
}, {
  message: "Tier 1 suppliers cannot have a parent. Tier 2 and 3 suppliers must have a parent supplier.",
  path: ["parentSupplierId"]
})

/**
 * Type inference for validated product data
 */
export type ValidatedProduct = z.infer<typeof ProductSchema>

/**
 * Type inference for validated supplier data
 */
export type ValidatedSupplier = z.infer<typeof SupplierSchema>

/**
 * UUID validation schema for reuse across forms
 */
export const UUIDSchema = z.string().uuid("Must be a valid UUID")

/**
 * Optional UUID schema for nullable foreign keys
 */
export const OptionalUUIDSchema = z.string().uuid("Must be a valid UUID").optional().nullable()

/**
 * Schema for validating product ID parameters in routes
 */
export const ProductParamsSchema = z.object({
  productId: UUIDSchema
})

/**
 * Schema for validating supplier ID parameters in routes
 */
export const SupplierParamsSchema = z.object({
  supplierId: UUIDSchema
})

/**
 * Combined schema for product-supplier relationship validation
 */
export const ProductSupplierSchema = z.object({
  productId: UUIDSchema,
  supplierId: UUIDSchema
})