# Migration Guide: From app_metadata to Profiles Table

This guide will help you migrate from the old `app_metadata` approach to the new, more secure `profiles` table approach for brand management.

## Overview of Changes

The refactor moves from storing `brand_id` in Supabase Auth's `app_metadata` to a dedicated `profiles` table with proper foreign key relationships and Row-Level Security (RLS).

## Step 1: Database Migration

### 1.1 Run the Complete Schema Script

Execute the `database-schema-complete.sql` file in your Supabase SQL Editor. This will:

- Create the `brands` and `profiles` tables
- Set up the automated profile creation trigger
- Implement proper RLS policies
- Create the atomic brand creation RPC function

### 1.2 Data Migration (if you have existing users)

If you have existing users with brands in `app_metadata`, run this migration script:

```sql
-- Migrate existing users from app_metadata to profiles table
-- Run this AFTER creating the new schema

-- First, ensure all existing users have profiles
INSERT INTO public.profiles (id, full_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Then, migrate brand associations from app_metadata
UPDATE public.profiles
SET brand_id = (
  SELECT (app_metadata->>'brand_id')::uuid
  FROM auth.users
  WHERE auth.users.id = profiles.id
)
WHERE brand_id IS NULL
AND EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND auth.users.app_metadata->>'brand_id' IS NOT NULL
);

-- Verify the migration
SELECT 
  p.id,
  p.brand_id,
  u.app_metadata->>'brand_id' as old_brand_id
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.brand_id IS NOT NULL;
```

## Step 2: Update Environment Variables

Ensure your `.env.local` has the necessary Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Code Changes Already Implemented

The following files have been updated:

1. **`middleware.ts`** - Now checks `profiles` table instead of `app_metadata`
2. **`src/app/actions.ts`** - Updated to use new `createBrandAndLinkToProfile` action
3. **`src/app/onboarding/page.tsx`** - New dedicated onboarding route
4. **`src/components/onboarding-form.tsx`** - New form component
5. **`src/app/dashboard/layout.tsx`** - Added server-side profile checking
6. **`src/lib/auth.ts`** - Updated to use profiles table

## Step 4: Testing the Migration

### 4.1 Test New User Flow

1. Create a new user account
2. Verify they're automatically redirected to `/onboarding`
3. Complete the brand creation form
4. Verify they're redirected to `/dashboard`
5. Check that a `profiles` record was created with the correct `brand_id`

### 4.2 Test Existing User Flow

1. Log in with an existing user
2. If they have a `brand_id` in `app_metadata`, they should work normally
3. If they don't have a `brand_id`, they should be redirected to `/onboarding`

### 4.3 Test Brand Isolation

1. Create products/suppliers as one user
2. Verify they're only visible to users in the same brand
3. Verify users from different brands can't see each other's data

## Step 5: Rollback Plan (if needed)

If you need to rollback, you can:

1. **Revert the code changes** by checking out the previous commit
2. **Keep the database changes** - they won't break the old code
3. **Or drop the new tables** if you want to completely revert:

```sql
-- WARNING: This will delete all new data
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS create_brand_for_user(uuid, text);
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.brands;
```

## Step 6: Cleanup (After Migration is Stable)

Once you're confident the new system is working:

1. **Remove the old `setupBrand` action** from `actions.ts`
2. **Update any remaining references** to `user.app_metadata.brand_id`
3. **Remove the old `/auth/setup-brand` route** if no longer needed

## Troubleshooting

### Common Issues

1. **"Function create_brand_for_user does not exist"**
   - Ensure you ran the complete SQL script in Supabase
   - Check that the function was created successfully

2. **"Permission denied" errors**
   - Verify RLS policies are enabled and correct
   - Check that the `create_brand_for_user` function has `SECURITY DEFINER`

3. **Users stuck in redirect loops**
   - Check middleware logic for infinite redirects
   - Verify profile records exist for all users

4. **Brand isolation not working**
   - Verify RLS policies on `products` and `suppliers` tables
   - Check that `brand_id` columns are being set correctly

### Debug Queries

```sql
-- Check if profiles exist for all users
SELECT 
  u.id,
  u.email,
  p.brand_id,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Check brand isolation
SELECT 
  p.brand_id,
  COUNT(*) as user_count
FROM public.profiles p
GROUP BY p.brand_id;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Performance Considerations

1. **Indexes**: The migration creates necessary indexes on `brand_id` columns
2. **Triggers**: Profile creation is automatic and fast
3. **RLS**: Policies are optimized for brand-based queries

## Security Benefits

1. **Proper foreign key constraints** prevent orphaned records
2. **Row-Level Security** ensures data isolation between brands
3. **No more reliance on `app_metadata`** which can be modified by users
4. **Atomic operations** prevent partial state updates

## Next Steps

After successful migration:

1. **Monitor performance** of brand-based queries
2. **Add additional profile fields** as needed (company info, preferences, etc.)
3. **Implement profile management** features
4. **Add audit logging** for brand creation and updates
