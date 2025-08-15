-- Row-Level Security Policies for EcoLens
--
-- These policies grant public, read-only access to the specified tables.
--

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for public read access

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
