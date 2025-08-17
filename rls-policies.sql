-- Row-Level Security Policies for EcoLens
--
-- These policies provide brand isolation for authenticated users and public read access for DPP integration.
--

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Brand isolation policies for authenticated users

-- Products: Brand isolation for authenticated users
CREATE POLICY "Brand isolation for products" ON public.products
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Suppliers: Brand isolation for authenticated users
CREATE POLICY "Brand isolation for suppliers" ON public.suppliers
    FOR ALL USING (
        brand_id = (
            SELECT brand_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Product_suppliers: Brand isolation through product relationship
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

-- Certificates: Brand isolation through supplier relationship
CREATE POLICY "Brand isolation for certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.suppliers 
            WHERE id = supplier_id 
            AND brand_id = (
                SELECT brand_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. Public read access policies for DPP integration

-- Allow public read access to all products
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
USING (true);

-- Allow public read access to all brands
CREATE POLICY "Allow public read access to brands" 
ON public.brands 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to create brands" 
ON public.brands
FOR INSERT TO authenticated 
WITH CHECK (true);

-- Allow public read access to all suppliers
CREATE POLICY "Allow public read access to suppliers" 
ON public.suppliers 
FOR SELECT 
USING (true);

-- Allow public read access to all product_suppliers
CREATE POLICY "Allow public read access to product_suppliers" 
ON public.product_suppliers 
FOR SELECT 
USING (true);

-- Allow public read access to all certificates
CREATE POLICY "Allow public read access to certificates" 
ON public.certificates 
FOR SELECT 
USING (true);

-- Allow public read access to all ledger entries
CREATE POLICY "Allow public read access to ledger" 
ON public.ledger 
FOR SELECT 
USING (true);