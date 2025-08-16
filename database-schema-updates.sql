-- Database Schema Updates for Brand Dashboard
-- This file contains all the necessary schema changes for multi-tenant brand isolation

-- 1. Create profiles table to link authenticated users to brands
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Add missing columns to suppliers table
-- Add brand_id column (foreign key to brands)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE;

-- Add parent_supplier_id column (self-referencing for hierarchy)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS parent_supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- 3. Add constraints to ensure tier hierarchy logic
-- Drop existing constraint if it exists and recreate with proper logic
ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS valid_tier_hierarchy;

-- Add constraint: Tier 1 has no parent, Tier 2/3 must have parent
ALTER TABLE public.suppliers 
ADD CONSTRAINT valid_tier_hierarchy CHECK (
    (tier = 1 AND parent_supplier_id IS NULL) OR
    (tier > 1 AND parent_supplier_id IS NOT NULL)
);

-- Add constraint to ensure parent supplier is from previous tier
ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS valid_parent_tier;
-- Note: This constraint would require a function to check parent tier
-- For now, we'll handle this in application logic

-- 4. Update existing RLS policies to include brand isolation

-- Drop existing policies to recreate them with brand isolation
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow public read access to product_suppliers" ON public.product_suppliers;

-- Products policies
CREATE POLICY "Brand isolation for products" ON public.products
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Suppliers policies
CREATE POLICY "Brand isolation for suppliers" ON public.suppliers
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Allow public read access to suppliers" ON public.suppliers
    FOR SELECT USING (true);

-- Product_suppliers policies
CREATE POLICY "Brand isolation for product_suppliers" ON public.product_suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = product_id 
            AND brand_id = (
                SELECT brand_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Allow public read access to product_suppliers" ON public.product_suppliers
    FOR SELECT USING (true);

-- 5. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_brand_id ON public.profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_brand_id ON public.suppliers(brand_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_parent_id ON public.suppliers(parent_supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

-- 6. Create function to automatically set brand_id on insert
CREATE OR REPLACE FUNCTION set_brand_id_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Get brand_id from user's profile
    SELECT brand_id INTO NEW.brand_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- If no brand_id found, raise exception
    IF NEW.brand_id IS NULL THEN
        RAISE EXCEPTION 'User must have a valid brand profile';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set brand_id
DROP TRIGGER IF EXISTS set_brand_id_on_product_insert ON public.products;
CREATE TRIGGER set_brand_id_on_product_insert
    BEFORE INSERT ON public.products
    FOR EACH ROW
    WHEN (NEW.brand_id IS NULL)
    EXECUTE FUNCTION set_brand_id_from_profile();

DROP TRIGGER IF EXISTS set_brand_id_on_supplier_insert ON public.suppliers;
CREATE TRIGGER set_brand_id_on_supplier_insert
    BEFORE INSERT ON public.suppliers
    FOR EACH ROW
    WHEN (NEW.brand_id IS NULL)
    EXECUTE FUNCTION set_brand_id_from_profile();

-- 7. Update existing data (if needed)
-- Note: This assumes existing data should be associated with the first brand
-- In production, this would need to be handled more carefully
UPDATE public.suppliers 
SET brand_id = (SELECT id FROM public.brands LIMIT 1)
WHERE brand_id IS NULL;

-- Make brand_id NOT NULL after updating existing data
ALTER TABLE public.suppliers ALTER COLUMN brand_id SET NOT NULL;