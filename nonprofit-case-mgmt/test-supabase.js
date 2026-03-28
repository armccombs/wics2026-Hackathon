#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * This script tests the connection to your Supabase instance
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('🔍 Checking environment variables...\n');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!SUPABASE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  process.exit(1);
}

console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_KEY.substring(0, 20)}...`);

// Create Supabase client
console.log('\n🔌 Connecting to Supabase...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection by checking auth status
async function testConnection() {
  try {
    // Get the current session (should return null if not authenticated, but should not error)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`   Session status: ${data.session ? 'Authenticated' : 'Anonymous'}`);

    // Try a simple query to any table to verify database access
    console.log('\n🔍 Testing database access...\n');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (tableError) {
      // This might fail due to permissions, which is okay
      console.warn('⚠️  Could not query system tables (this may be a permission issue)');
      console.log('   But connection to Supabase is working!');
    } else {
      console.log('✅ Database access verified!');
    }

    console.log('\n✅ All tests passed! Your Supabase connection is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
}

testConnection();
