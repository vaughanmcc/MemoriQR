// Script to run Supabase migrations programmatically
// Run with: npx tsx scripts/run-migration.ts

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  console.log('🚀 Starting migration...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  // Split into individual statements (simple split, may need refinement for complex SQL)
  // For safety, we'll run the whole thing through Supabase's RPC
  
  console.log('\n⚠️  This script requires the database to be managed via Supabase Dashboard.')
  console.log('   The Supabase JS client cannot run raw DDL statements directly.')
  console.log('\n📋 Please run the migration manually:')
  console.log('   1. Go to Supabase Dashboard → SQL Editor')
  console.log('   2. Copy contents of: supabase/migrations/001_initial_schema.sql')
  console.log('   3. Paste and click "Run"')
  console.log('\n💡 Alternative: Use Supabase CLI')
  console.log('   npx supabase db push --linked')
}

runMigration()
