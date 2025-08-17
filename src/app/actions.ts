'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { User } from '@supabase/supabase-js'

import { ProductSchema, SupplierSchema } from '<ecolens>/lib/schemas'
import { withFormAuth } from '<ecolens>/lib/server-action-auth'
import type { FormState } from '<ecolens>/lib/types'
import { GEMINI_MODELS, getModelEndpoint, logModelAttempt, getErrorMessage, validateApiKey } from '<ecolens>/lib/ai-utils'

/**
 * AI-powered content generation using Gemini API with fallback mechanism
 * Generates product descriptions and care instructions based on product name and materials
 * Fallback order: Gemini 2.5 Pro → Gemini 2.5 Flash → Gemini 2.0 Pro → Gemini 2.0 Flash
 */
export async function generateProductContent(
  productName: string,
  materials: { material: string; percent: number }[]
): Promise<{ success: boolean; description?: string; careInstructions?: string; error?: string; modelUsed?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const apiKeyValidation = validateApiKey(apiKey)
    if (!apiKeyValidation.valid) {
      return { success: false, error: apiKeyValidation.error }
    }
    
    // At this point, apiKey is guaranteed to be defined
    const validatedApiKey = apiKey!

    // Construct materials string for the prompt
    const materialsString = materials.length > 0 
      ? materials.map(m => `${m.material} (${m.percent}%)`).join(', ')
      : 'No specific materials listed'

    // Engineer a detailed prompt for the Gemini API
    const prompt = `You are a fashion sustainability expert and product copywriter. Based on the following product information, generate compelling, SEO-friendly content:

Product Name: ${productName}
Materials: ${materialsString}

Please provide:

1. A compelling product description (150-200 words) that:
   - Highlights sustainability aspects
   - Uses engaging, SEO-friendly language
   - Appeals to environmentally conscious consumers
   - Mentions material composition and benefits

2. Care instructions (100-150 words) that:
   - Provide practical washing and care guidance
   - Include sustainability tips for extending product life
   - Mention eco-friendly care practices
   - Are easy to follow and understand

Format your response as JSON with two fields: "description" and "careInstructions".

Example response format:
{
  "description": "Your product description here...",
  "careInstructions": "Your care instructions here..."
}`

    // Try each model in order until one succeeds
    for (const model of GEMINI_MODELS) {
      try {
        console.log(`Attempting to generate content with ${model.name}...`)
        
        const response = await fetch(
          getModelEndpoint(model, validatedApiKey),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          
          // Extract the generated text from the response
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (generatedText) {
            // Try to parse the JSON response
            try {
              // First, try to extract JSON from markdown code blocks if present
              let jsonText = generatedText
              
              // Remove markdown code block formatting if present
              if (generatedText.includes('```json')) {
                const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/)
                if (jsonMatch) {
                  jsonText = jsonMatch[1].trim()
                }
              } else if (generatedText.includes('```')) {
                // Handle generic code blocks
                const codeMatch = generatedText.match(/```\s*([\s\S]*?)\s*```/)
                if (codeMatch) {
                  jsonText = codeMatch[1].trim()
                }
              }
              
              const parsedContent = JSON.parse(jsonText)
              logModelAttempt(model, true)
              return {
                success: true,
                description: parsedContent.description,
                careInstructions: parsedContent.careInstructions,
                modelUsed: model.name
              }
            } catch (parseError) {
              // If JSON parsing fails, try to extract content from plain text
              console.warn(`Failed to parse JSON response from ${model.name}, attempting text extraction:`, parseError)
              
              // Enhanced text extraction that handles various formats
              let description = ''
              let careInstructions = ''
              
              // Remove markdown formatting
              let cleanText = generatedText
                .replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
              
              // Try to find JSON-like structure even if not valid JSON
              const descriptionMatch = cleanText.match(/"description"\s*:\s*"([^"]*)"|description\s*:\s*"([^"]*)"|description\s*:\s*'([^']*)'/)
              const careMatch = cleanText.match(/"careInstructions"\s*:\s*"([^"]*)"|careInstructions\s*:\s*"([^"]*)"|careInstructions\s*:\s*'([^']*)'/)
              
              if (descriptionMatch) {
                description = descriptionMatch[1] || descriptionMatch[2] || descriptionMatch[3] || ''
              }
              
              if (careMatch) {
                careInstructions = careMatch[1] || careMatch[2] || careMatch[3] || ''
              }
              
              // If regex extraction failed, try line-by-line parsing
              if (!description || !careInstructions) {
                const lines = cleanText.split('\n')
                let currentSection = ''
                
                for (const line of lines) {
                  const trimmedLine = line.trim()
                  if (trimmedLine.toLowerCase().includes('description') || trimmedLine.toLowerCase().includes('product')) {
                    currentSection = 'description'
                  } else if (trimmedLine.toLowerCase().includes('care') || trimmedLine.toLowerCase().includes('washing')) {
                    currentSection = 'care'
                  } else if (trimmedLine && currentSection === 'description' && !trimmedLine.startsWith('{') && !trimmedLine.startsWith('}')) {
                    description += (description ? ' ' : '') + trimmedLine
                  } else if (trimmedLine && currentSection === 'care' && !trimmedLine.startsWith('{') && !trimmedLine.startsWith('}')) {
                    careInstructions += (careInstructions ? ' ' : '') + trimmedLine
                  }
                }
              }
              
              logModelAttempt(model, true, 'using enhanced text parsing fallback')
              return {
                success: true,
                description: description || 'AI-generated product description',
                careInstructions: careInstructions || 'AI-generated care instructions',
                modelUsed: model.name
              }
            }
          } else {
             logModelAttempt(model, false, 'no content generated')
             continue // Try next model
           }
         } else {
           const errorData = await response.text()
           logModelAttempt(model, false, `HTTP ${response.status}: ${errorData}`)
           continue // Try next model
         }
       } catch (modelError) {
         logModelAttempt(model, false, modelError instanceof Error ? modelError.message : 'unknown error')
         continue // Try next model
       }
    }

    // If all models fail, return error
    console.error('All Gemini models failed to generate content')
    return { 
      success: false, 
      error: getErrorMessage()
    }
  } catch (error) {
    console.error('Error in generateProductContent:', error)
    return { 
      success: false, 
      error: getErrorMessage()
    }
  }
}

/**
 * Server Action: Create a new brand and link it to the user's profile.
 * This action uses the new profiles table and RPC function for atomic operations.
 */
export const createBrandAndLinkToProfile = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const brandName = formData.get('brandName') as string;
      if (!brandName || brandName.trim().length < 3) {
        return {
          errors: { brandName: ['Brand name must be at least 3 characters long'] },
          message: 'Please enter a valid brand name.',
        }
      }

      // 2. Use the RPC function for atomic brand creation and profile linking
      const { error } = await supabase.rpc('create_brand_for_user', {
        user_id: user.id,
        brand_name: brandName.trim(),
      });

      if (error) {
        console.error('Onboarding RPC Error:', error);
        if (error.code === '23505') { // unique_violation
          return { message: 'A brand with this name already exists.' }
        }
        return { message: `Database error: ${error.message}` }
      }

      // 3. Revalidate and return success state (client will handle redirect)
      revalidatePath('/dashboard', 'layout');
      return { 
        message: 'Brand created successfully!',
        success: true 
      };
    } catch (error) {
      console.error('Unexpected error in createBrandAndLinkToProfile:', error);
      return { message: 'An unexpected error occurred. Please try again.' }
    }
  }
);

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
        sku: formData.get('sku') || undefined,
        description: formData.get('description') || undefined,
        care_instructions: formData.get('care_instructions') || undefined,
        end_of_life_options: formData.get('end_of_life_options') || undefined,
        material_composition: formData.get('material_composition') ? 
          JSON.parse(formData.get('material_composition') as string) : undefined,
      })

      // 2. Get the user's brand_id from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .single();

      if (!profile?.brand_id) {
        return { message: 'Error: Could not find your brand association. Please complete onboarding first.' }
      }

      // 3. Insert the new product into the database with explicit brand_id and retrieve the new product's ID
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          ...validatedData,
          brand_id: profile.brand_id, // CRITICAL FIX: Explicitly set brand_id
        })
        .select('id')
        .single()

      if (error || !newProduct?.id) {
        console.error('Database error creating product:', error)
        return { message: `Database Error: ${error?.message || 'Failed to create product'}` }
      }

      // 4. Revalidate and redirect to the new product management page
      revalidatePath('/dashboard/products') // Revalidate the list page
      redirect(`/dashboard/products/${newProduct.id}`) // Redirect to the new management page
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
      
      // 2. Get the user's brand_id from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .single();

      if (!profile?.brand_id) {
        return { message: 'Error: Could not find your brand association. Please complete onboarding first.' }
      }

      // 3. Insert the new supplier with brand_id
      const { error } = await supabase.from('suppliers').insert({
        ...validatedData,
        brand_id: profile.brand_id,
      })

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

    // 4. Revalidate and redirect
    const productId = formData.get('product_id') as string
    revalidatePath(`/dashboard/products/${productId}`)
    redirect(`/dashboard/products/${productId}`)
  }
)

/**
 * Server Action: Add a new supplier to a product's supply chain.
 * This is an alias for addSupplier to maintain compatibility with existing components.
 */
export const addSupplierToProduct = withFormAuth(
  async (supabase, user: User, prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // 1. Validate form data
      const validatedData = SupplierSchema.parse({
        name: formData.get('name'),
        tier: Number(formData.get('tier')),
        location: formData.get('location'),
        product_id: formData.get('productId'), // Note: form uses productId, not product_id
        parent_supplier_id: formData.get('parentSupplierId') || null, // Note: form uses parentSupplierId
      })
      
      // 2. Get the user's brand_id from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('brand_id')
        .eq('id', user.id)
        .single();

      if (!profile?.brand_id) {
        return { message: 'Error: Could not find your brand association. Please complete onboarding first.' }
      }

      // 3. Insert the new supplier with brand_id
      const { data: newSupplier, error } = await supabase.from('suppliers').insert({
        name: validatedData.name,
        tier: validatedData.tier,
        location: validatedData.location,
        brand_id: profile.brand_id,
        parent_supplier_id: validatedData.parentSupplierId,
      }).select().single()

      if (error) {
        console.error('Database error adding supplier:', error)
        return { message: `Database Error: ${error.message}` }
      }

      // 4. Link the supplier to the product via product_suppliers table
      const { error: linkError } = await supabase.from('product_suppliers').insert({
        product_id: validatedData.productId,
        supplier_id: newSupplier.id, // Use the actual supplier ID from the insert above
      })

      if (linkError) {
        console.error('Database error linking supplier to product:', linkError)
        return { message: `Database Error: ${linkError.message}` }
      }

      return { message: 'Supplier added successfully!' }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          errors: error.flatten().fieldErrors,
          message: 'Validation Error: Please check the fields.',
        }
      }
      console.error('Unexpected error in addSupplierToProduct:', error)
      return { message: 'An unexpected error occurred.' }
    }
  }
)