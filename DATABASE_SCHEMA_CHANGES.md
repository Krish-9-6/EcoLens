# Database Schema Changes for Brand Dashboard

This document outlines the database schema changes implemented for the Brand Dashboard feature, which enables multi-tenant brand isolation and supply chain hierarchy management.

## Changes Made

### 1. New Tables

#### `profiles` Table
Links authenticated users to their respective brands.

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Schema Updates

#### `suppliers` Table Updates
- Added `brand_id` column for multi-tenant isolation
- Added `parent_supplier_id` column for supply chain hierarchy
- Added constraint to enforce tier hierarchy logic

```sql
-- New columns
ALTER TABLE public.suppliers 
ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE;

ALTER TABLE public.suppliers 
ADD COLUMN parent_supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Tier hierarchy constraint
ALTER TABLE public.suppliers 
ADD CONSTRAINT valid_tier_hierarchy CHECK (
    (tier = 1 AND parent_supplier_id IS NULL) OR
    (tier > 1 AND parent_supplier_id IS NOT NULL)
);
```

### 3. Row-Level Security (RLS) Policies

#### Brand Isolation Policies
- **Products**: Users can only access products belonging to their brand
- **Suppliers**: Users can only access suppliers belonging to their brand
- **Product_suppliers**: Users can only access relationships for their brand's products
- **Certificates**: Users can only access certificates for their brand's suppliers

#### Public Read Access
- All tables maintain public read access for Digital Product Passport (DPP) integration
- This allows the public DPP pages to continue functioning without authentication

### 4. Performance Optimizations

#### New Indexes
```sql
CREATE INDEX idx_profiles_brand_id ON public.profiles(brand_id);
CREATE INDEX idx_suppliers_brand_id ON public.suppliers(brand_id);
CREATE INDEX idx_suppliers_parent_id ON public.suppliers(parent_supplier_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
```

### 5. Automatic Brand Association

#### Trigger Function
Created a trigger function that automatically sets `brand_id` when inserting new products or suppliers:

```sql
CREATE OR REPLACE FUNCTION set_brand_id_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    SELECT brand_id INTO NEW.brand_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    IF NEW.brand_id IS NULL THEN
        RAISE EXCEPTION 'User must have a valid brand profile';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## TypeScript Type Updates

### New Types Added
- `Profile` type for user-brand relationships
- `SupplierWithHierarchy` for nested supplier structures
- `ProductWithSuppliers` for complete product data with supply chain
- `FormState` for Server Action responses

### Updated Types
- `suppliers` table now includes `brand_id` and `parent_supplier_id`
- `products` and `suppliers` Insert types have optional `brand_id` (set by trigger)

## Migration Instructions

1. Run the `database-schema-updates.sql` file against your Supabase database
2. Update the `rls-policies.sql` file with the new policies
3. Regenerate TypeScript types using: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
4. Update your application code to use the new types from `src/lib/types.ts`

## Security Considerations

- All data operations are protected by RLS policies at the database level
- Users cannot access or modify data belonging to other brands
- Public read access is maintained for DPP functionality
- Automatic brand association prevents data leakage during inserts

## Backward Compatibility

- Existing DPP functionality remains unaffected
- Public read policies ensure DPP pages continue to work
- New columns are added without breaking existing queries
- Type updates are additive and don't remove existing functionality