-- Fix missing sku column in products table
-- Run this in your Supabase SQL Editor

-- Add the missing sku column to the products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text;

-- Add an index for better query performance on the sku field
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'sku';
