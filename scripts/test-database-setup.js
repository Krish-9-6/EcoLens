// Test script to verify database setup
// Run this with: node scripts/test-database-setup.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...\n')

  try {
    // Test 1: Check if tables exist by trying to query them
    console.log('1. Checking table existence...')
    
    try {
      // Try to query the brands table
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('id')
        .limit(1)
      
      if (brandsError) {
        console.error('❌ Error querying brands table:', brandsError.message)
        return
      }
      console.log('✅ Brands table exists and is accessible')
    } catch (error) {
      console.error('❌ Brands table not accessible:', error.message)
      return
    }

    try {
      // Try to query the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profilesError) {
        console.error('❌ Error querying profiles table:', profilesError.message)
        return
      }
      console.log('✅ Profiles table exists and is accessible')
    } catch (error) {
      console.error('❌ Profiles table not accessible:', error.message)
      return
    }

    // Test 2: Check if RPC function exists by trying to call it
    console.log('\n2. Checking RPC function...')
    
    try {
      // Try to call the function (this will fail if it doesn't exist)
      const { error } = await supabase.rpc('create_brand_for_user', {
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        brand_name: 'test'
      })
      
      // We expect an error because the user doesn't exist, but the function should exist
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.error('❌ RPC function create_brand_for_user not found')
        console.log('Make sure you ran the database-schema-complete.sql script in Supabase')
        return
      }
      
      console.log('✅ RPC function create_brand_for_user exists')
    } catch (error) {
      console.error('❌ Error testing RPC function:', error.message)
      return
    }

    // Test 3: Check if we can create a test brand (this will test RLS policies)
    console.log('\n3. Testing brand creation (RLS policies)...')
    
    try {
      // First, try to sign up a test user to get authenticated context
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123'
      })
      
      if (signUpError) {
        console.error('❌ Error creating test user:', signUpError.message)
        console.log('This might indicate auth issues')
        return
      }
      
      console.log('✅ Created test user for authentication')
      
      // Now try to create a brand with authenticated context
      const { data: testBrand, error: createError } = await supabase
        .from('brands')
        .insert({ name: 'Test Brand ' + Date.now() })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creating test brand:', createError.message)
        console.log('This might indicate RLS policy issues')
        return
      }
      
      console.log('✅ Successfully created test brand:', testBrand.name)
      
      // Clean up the test brand
      const { error: deleteError } = await supabase
        .from('brands')
        .delete()
        .eq('id', testBrand.id)
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test brand (this is okay)')
      } else {
        console.log('✅ Successfully cleaned up test brand')
      }
    } catch (error) {
      console.error('❌ Error testing brand creation:', error.message)
      return
    }

    console.log('\n🎉 Database setup looks good!')
    console.log('\nNext steps:')
    console.log('1. Test the onboarding flow with a new user')
    console.log('2. Verify brand isolation works correctly')
    console.log('3. Check that existing users can still access the dashboard')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testDatabaseSetup()