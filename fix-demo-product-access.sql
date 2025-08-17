-- Fix Demo Product Public Access
-- Run this in your Supabase SQL Editor
-- This ensures the demo product is accessible for the "See it in Action" feature

-- First, let's check if the demo product exists
SELECT 
  id,
  name,
  brand_id,
  created_at
FROM public.products 
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- Check if the demo brand exists
SELECT 
  id,
  name,
  created_at
FROM public.brands 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Drop conflicting policies and recreate them with proper priority
-- Drop the brand isolation policy for products (it conflicts with public read)
DROP POLICY IF EXISTS "Brand isolation for products" ON public.products;

-- Create a new policy that allows authenticated users to access their brand's products
CREATE POLICY "Brand isolation for products" ON public.products
    FOR ALL USING (
        auth.uid() IS NULL OR  -- Allow public access (unauthenticated users)
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Ensure public read access is still in place
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
USING (true);

-- Test the demo product access
SELECT 
  p.id,
  p.name,
  p.sku,
  p.description,
  b.name as brand_name,
  COUNT(ps.supplier_id) as supplier_count,
  COUNT(c.id) as certificate_count
FROM public.products p
JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_suppliers ps ON p.id = ps.product_id
LEFT JOIN public.certificates c ON ps.supplier_id = c.supplier_id
WHERE p.id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY p.id, p.name, p.sku, p.description, b.name;

-- Show the complete supply chain for verification
SELECT 
  p.name as product_name,
  s.name as supplier_name,
  s.tier,
  s.location,
  c.name as certificate_name,
  c.verified_at
FROM public.products p
JOIN public.product_suppliers ps ON p.id = ps.product_id
JOIN public.suppliers s ON ps.supplier_id = s.id
LEFT JOIN public.certificates c ON s.id = c.supplier_id
WHERE p.id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY s.tier;
