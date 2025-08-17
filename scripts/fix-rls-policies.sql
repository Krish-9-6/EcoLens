-- Fix RLS Policies for Brand Creation
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS policies
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('brands', 'profiles')
ORDER BY tablename, cmd;

-- 2. Drop existing restrictive policies on brands table
DROP POLICY IF EXISTS "Allow all access to own brand" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to delete brands" ON public.brands;
DROP POLICY IF EXISTS "Allow public read access to brands" ON public.brands;
DROP POLICY IF EXISTS "Allow authenticated users to update brands" ON public.brands;

-- 3. Create proper RLS policies for brands table
-- Allow authenticated users to create brands (for onboarding)
CREATE POLICY "Authenticated users can create brands" ON public.brands 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own brand
CREATE POLICY "Brand members can view their brand" ON public.brands 
  FOR SELECT USING (
    id = (SELECT brand_id FROM public.profiles WHERE id = auth.uid())
  );

-- Allow users to update their own brand
CREATE POLICY "Brand members can update their brand" ON public.brands 
  FOR UPDATE USING (
    id = (SELECT brand_id FROM public.profiles WHERE id = auth.uid())
  ) WITH CHECK (
    id = (SELECT brand_id FROM public.profiles WHERE id = auth.uid())
  );

-- Allow users to delete their own brand
CREATE POLICY "Brand members can delete their brand" ON public.brands 
  FOR DELETE USING (
    id = (SELECT brand_id FROM public.profiles WHERE id = auth.uid())
  );

-- 4. Verify the policies were created
SELECT 
  schemaname,
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'brands'
ORDER BY cmd;
