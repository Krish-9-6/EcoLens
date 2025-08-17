-- Database Schema Updates for Enhanced Product Model
-- Run this in your Supabase SQL Editor to add new fields to the products table

-- Add new columns to the products table for enhanced Digital Product Passport functionality
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS care_instructions text,
ADD COLUMN IF NOT EXISTS end_of_life_options text,
ADD COLUMN IF NOT EXISTS material_composition jsonb;

-- Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_material_composition ON public.products USING GIN(material_composition);

-- Update the RLS policies to include the new fields
-- (No changes needed as the existing brand isolation policy covers all columns)

-- Grant necessary permissions (already covered by existing grants)