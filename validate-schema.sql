-- Validation queries to verify schema changes
-- Run these queries to ensure the schema updates were applied correctly

-- 1. Verify profiles table exists with correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verify suppliers table has new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'suppliers'
AND column_name IN ('brand_id', 'parent_supplier_id')
ORDER BY ordinal_position;

-- 3. Verify constraints exist
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
AND table_name = 'suppliers'
AND constraint_name = 'valid_tier_hierarchy';

-- 4. Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'suppliers', 'product_suppliers', 'profiles')
ORDER BY tablename;

-- 5. Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'suppliers', 'product_suppliers', 'profiles')
ORDER BY tablename, policyname;

-- 6. Verify indexes exist
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;