-- Complete Database Schema for Veritas Multi-Tenant Platform
-- Run this in your Supabase SQL Editor

-- 1. CREATE TABLES
-- Create the brands table first
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

-- Create the profiles table that links to auth users and brands
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL, -- This MUST match the user's ID from auth.users
  brand_id uuid NULL,
  full_name text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. AUTOMATE PROFILE CREATION
-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. IMPLEMENT ROW-LEVEL SECURITY (RLS)
-- Enable RLS on both tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: Users can only manage their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Brands Policies: Users can view their own brand's info
CREATE POLICY "Brand members can view their brand" ON public.brands 
  FOR SELECT USING (
    id = (SELECT brand_id FROM public.profiles WHERE id = auth.uid())
  );

-- Allow authenticated users to create brands (for onboarding)
CREATE POLICY "Authenticated users can create brands" ON public.brands 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. CREATE THE RPC FUNCTION FOR ATOMIC BRAND CREATION
-- This ensures the two operations (create brand + link profile) are atomic
CREATE OR REPLACE FUNCTION create_brand_for_user(user_id uuid, brand_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_brand_id uuid;
BEGIN
  -- Step 1: Create the new brand and get its ID
  INSERT INTO public.brands (name)
  VALUES (brand_name)
  RETURNING id INTO new_brand_id;

  -- Step 2: Link the new brand to the user's profile
  UPDATE public.profiles
  SET brand_id = new_brand_id, updated_at = now()
  WHERE id = user_id;
END;
$$;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_brand_id ON public.profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);

-- 6. UPDATE EXISTING TABLES TO USE THE NEW SCHEMA
-- Add brand_id to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE;

-- Add brand_id to suppliers table if it doesn't exist
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE;

-- 7. CREATE FUNCTION TO AUTO-SET BRAND_ID ON INSERT
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

-- 8. UPDATE RLS POLICIES FOR EXISTING TABLES
-- Products policies with brand isolation
DROP POLICY IF EXISTS "Brand isolation for products" ON public.products;
CREATE POLICY "Brand isolation for products" ON public.products
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Suppliers policies with brand isolation
DROP POLICY IF EXISTS "Brand isolation for suppliers" ON public.suppliers;
CREATE POLICY "Brand isolation for suppliers" ON public.suppliers
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- 9. GRANT NECESSARY PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.brands TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.suppliers TO authenticated;
GRANT EXECUTE ON FUNCTION create_brand_for_user TO authenticated;
