-- Create Demo Product for Landing Page "See it in Action" (Simple Version)
-- Run this in your Supabase SQL Editor
-- This version avoids foreign key constraint issues

-- First, let's create a demo brand if it doesn't exist
INSERT INTO public.brands (id, name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'EcoLens Demo Brand',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create demo suppliers for the supply chain
INSERT INTO public.suppliers (id, name, tier, location, latitude, longitude, brand_id, created_at, updated_at)
VALUES 
  -- Tier 1 Supplier (Raw Materials)
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Organic Cotton Co.',
    1,
    'Texas, USA',
    31.9686,
    -99.9018,
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  ),
  -- Tier 2 Supplier (Manufacturing)
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'EcoTextile Manufacturing',
    2,
    'Portugal',
    39.3999,
    -8.2245,
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  ),
  -- Tier 3 Supplier (Assembly)
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Sustainable Stitch Factory',
    3,
    'Morocco',
    31.7917,
    -7.0926,
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Set up supplier hierarchy (only if not already set)
UPDATE public.suppliers 
SET parent_supplier_id = '550e8400-e29b-41d4-a716-446655440002'
WHERE id = '550e8400-e29b-41d4-a716-446655440003' 
  AND parent_supplier_id IS NULL;

UPDATE public.suppliers 
SET parent_supplier_id = '550e8400-e29b-41d4-a716-446655440003'
WHERE id = '550e8400-e29b-41d4-a716-446655440004' 
  AND parent_supplier_id IS NULL;

-- Create demo certificates for suppliers
INSERT INTO public.certificates (id, supplier_id, name, verified_at, brand_id, created_at, updated_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'GOTS (Global Organic Textile Standard)',
    NOW() - INTERVAL '30 days',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    'OEKO-TEX Standard 100',
    NOW() - INTERVAL '45 days',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440004',
    'Fair Trade Certified',
    NOW() - INTERVAL '60 days',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Create the main demo product
INSERT INTO public.products (
  id, 
  name, 
  image_url, 
  brand_id, 
  sku,
  description,
  care_instructions,
  end_of_life_options,
  material_composition,
  created_at, 
  updated_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000', -- This matches the demo product ID in the config
  'Organic Cotton Sustainable T-Shirt',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
  '550e8400-e29b-41d4-a716-446655440000',
  'ECO-TSHIRT-001',
  'This premium organic cotton t-shirt represents the future of sustainable fashion. Made from 100% GOTS-certified organic cotton, it demonstrates how transparency and environmental responsibility can coexist with style and comfort. The cotton is sourced from certified organic farms in Texas, processed in Portugal using eco-friendly methods, and assembled in Morocco under fair trade conditions. Each step of the supply chain is verified and documented, ensuring complete traceability from farm to finished product.',
  'Machine wash cold with like colors. Use mild detergent and avoid fabric softeners. Tumble dry low or air dry for best results. To extend the life of your garment and reduce environmental impact, wash only when necessary and consider using eco-friendly detergents. Iron on low heat if needed. This garment is designed to last, reducing the need for frequent replacements.',
  'This t-shirt is 100% biodegradable and can be composted in industrial composting facilities. The organic cotton will naturally decompose within 6 months under proper conditions. Alternatively, the garment can be recycled through textile recycling programs or donated to extend its useful life. The natural fibers ensure no microplastics are released during washing or disposal.',
  '[
    {"material": "Organic Cotton", "percent": 100}
  ]'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  sku = EXCLUDED.sku,
  description = EXCLUDED.description,
  care_instructions = EXCLUDED.care_instructions,
  end_of_life_options = EXCLUDED.end_of_life_options,
  material_composition = EXCLUDED.material_composition,
  updated_at = NOW();

-- Link the product to all suppliers in the supply chain
INSERT INTO public.product_suppliers (id, product_id, supplier_id, created_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440008',
    '123e4567-e89b-12d3-a456-426614174000',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440009',
    '123e4567-e89b-12d3-a456-426614174000',
    '550e8400-e29b-41d4-a716-446655440003',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440010',
    '123e4567-e89b-12d3-a456-426614174000',
    '550e8400-e29b-41d4-a716-446655440004',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add some ledger entries for transparency (only if sequence exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'ledger_id_seq') THEN
    INSERT INTO public.ledger (id, created_at, event_type, related_entity_id, data_hash)
    VALUES 
      (
        nextval('ledger_id_seq'),
        NOW() - INTERVAL '90 days',
        'product_created',
        '123e4567-e89b-12d3-a456-426614174000',
        'hash_product_creation_123e4567'
      ),
      (
        nextval('ledger_id_seq'),
        NOW() - INTERVAL '60 days',
        'certificate_verified',
        '550e8400-e29b-41d4-a716-446655440005',
        'hash_cert_verification_550e8400'
      ),
      (
        nextval('ledger_id_seq'),
        NOW() - INTERVAL '30 days',
        'supplier_audit',
        '550e8400-e29b-41d4-a716-446655440003',
        'hash_audit_550e8400_003'
      );
  END IF;
END $$;

-- Verify the demo product was created successfully
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

-- Show the complete supply chain
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
