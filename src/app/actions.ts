'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { User, createClient } from '@supabase/supabase-js'

import { ProductSchema, SupplierSchema } from '<ecolens>/lib/schemas'
import { withFormAuth } from '<ecolens>/lib/server-action-auth'
import type { FormState } from '<ecolens>/lib/types'

/**
 * Server Action: Create a new product.
 * This action is protected and requires the user to be authenticated and have a brand_id.
 */
export const createProduct = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const validatedData = ProductSchema.parse({
        name: formData.get('name'),
        description: formData.get('description'),
      })

      // 2. Get the user's brand_id from their app_metadata
      const brandId = user.app_metadata?.brand_id;

      if (!brandId) {
        return { message: 'Error: Could not find your brand association. Please log in again.' }
      }

      // 3. Insert the new product into the database
      const { error } = await supabase.from('products').insert({
        ...validatedData,
        brand_id: brandId,
      })

      if (error) {
        console.error('Database error creating product:', error)
        return { message: `Database Error: ${error.message}` }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          errors: error.flatten().fieldErrors,
          message: 'Validation Error: Please check the fields.',
        }
      }
      console.error('Unexpected error in createProduct:', error)
      return { message: 'An unexpected error occurred.' }
    }

    // 4. Revalidate and redirect
    revalidatePath('/dashboard/products')
    redirect('/dashboard/products')
  }
)

/**
 * Server Action: Add a new supplier to a product's supply chain.
 * This action is protected and requires authentication.
 */
export const addSupplier = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const validatedData = SupplierSchema.parse({
        name: formData.get('name'),
        tier: Number(formData.get('tier')),
        location: formData.get('location'),
        product_id: formData.get('product_id'),
        parent_supplier_id: formData.get('parent_supplier_id') || null,
      })
      
      // 2. Insert the new supplier
      const { error } = await supabase.from('suppliers').insert(validatedData)

      if (error) {
        console.error('Database error adding supplier:', error)
        return { message: `Database Error: ${error.message}` }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          errors: error.flatten().fieldErrors,
          message: 'Validation Error: Please check the fields.',
        }
      }
      console.error('Unexpected error in addSupplier:', error)
      return { message: 'An unexpected error occurred.' }
    }

    // 3. Revalidate and redirect
    const productId = formData.get('product_id') as string
    revalidatePath(`/dashboard/products/${productId}`)
    redirect(`/dashboard/products/${productId}`)
  }
)

/**
 * Server Action: Create a new brand and link it to the user's app_metadata.
 * This now uses a Supabase Admin Client for the entire operation to bypass RLS issues.
 */
export const setupBrand = withFormAuth(
  // The 'supabase' client from the wrapper is no longer needed here, but we keep the signature consistent.
  async (_, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const brandName = formData.get('name') as string;
      if (!brandName || brandName.trim().length < 2) {
        return {
          errors: { name: ['Brand name must be at least 2 characters'] },
          message: 'Please enter a valid brand name.',
        }
      }

      // 2. Create a Supabase Admin Client. This will bypass all RLS policies.
      // Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } } // Important for server-side use
      );

      // 3. Create the new brand using the Admin Client
      const { data: newBrand, error: brandError } = await supabaseAdmin
        .from('brands')
        .insert({ name: brandName.trim() })
        .select()
        .single();

      if (brandError) {
        console.error('Database error creating brand:', brandError);
        if (brandError.code === '23505') { // unique_violation
          return { message: 'A brand with this name already exists.' }
        }
        return { message: 'Failed to create brand due to a database permission error.' }
      }

      // 4. Update the user's app_metadata with the new brand_id using the Admin Client
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { app_metadata: { ...user.app_metadata, brand_id: newBrand.id } }
      )

      if (updateUserError) {
        console.error('Error updating user metadata:', updateUserError);
        return { message: 'Failed to link brand to your profile. Please contact support.' }
      }

    } catch (error) {
      console.error('Unexpected error in setupBrand:', error);
      return { message: 'An unexpected error occurred. Please try again.' }
    }

    // 5. Revalidate and redirect on success
    revalidatePath('/dashboard', 'layout');
    redirect('/dashboard');
  }
);