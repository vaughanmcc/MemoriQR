#!/usr/bin/env node
/**
 * Cleanup script - Deletes ALL data from database and storage
 * 
 * Usage: node scripts/cleanup-all-data.js
 * 
 * WARNING: This is destructive! All data will be permanently deleted.
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzrgrjtjgmrhdgbcsrlf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cmdyanRqZ21yaGRnYmNzcmxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYwMjgyOCwiZXhwIjoyMDgzMTc4ODI4fQ.5s5d-o6FSP4ko6nCvnaCEejkwahHHZZW1rEr7necNnw'
)

async function deleteStorageFiles(bucket) {
  console.log(`\n📁 Cleaning bucket: ${bucket}`)
  
  // List all top-level items (folders and files)
  const { data: items, error } = await supabase.storage.from(bucket).list('', { limit: 1000 })
  
  if (error) {
    console.log(`  ❌ Error listing: ${error.message}`)
    return
  }
  
  if (!items || items.length === 0) {
    console.log('  ✓ Already empty')
    return
  }
  
  for (const item of items) {
    if (item.id === null) {
      // It's a folder - list and delete contents
      const { data: files } = await supabase.storage.from(bucket).list(item.name, { limit: 1000 })
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${item.name}/${f.name}`)
        const { error: deleteError } = await supabase.storage.from(bucket).remove(filePaths)
        
        if (deleteError) {
          console.log(`  ❌ Error deleting ${item.name}/: ${deleteError.message}`)
        } else {
          console.log(`  ✓ Deleted ${files.length} files from ${item.name}/`)
        }
      }
    } else {
      // It's a file at root level
      const { error: deleteError } = await supabase.storage.from(bucket).remove([item.name])
      if (!deleteError) {
        console.log(`  ✓ Deleted ${item.name}`)
      }
    }
  }
}

async function deleteTableData(table) {
  console.log(`\n🗑️  Cleaning table: ${table}`)
  
  // Get count first
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  
  if (count === 0) {
    console.log('  ✓ Already empty')
    return
  }
  
  // Delete all rows - need to use a filter that matches everything
  const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
  
  if (error) {
    console.log(`  ❌ Error: ${error.message}`)
  } else {
    console.log(`  ✓ Deleted ${count} rows`)
  }
}

async function main() {
  console.log('🧹 MemoriQR Data Cleanup Script')
  console.log('================================')
  console.log('⚠️  WARNING: This will delete ALL data!\n')
  
  // Check if --confirm flag is passed
  if (!process.argv.includes('--confirm')) {
    console.log('To confirm deletion, run with --confirm flag:')
    console.log('  node scripts/cleanup-all-data.js --confirm\n')
    process.exit(0)
  }
  
  console.log('Starting cleanup...')
  
  // 1. Delete storage files first (since they're referenced by memorial_records)
  await deleteStorageFiles('memorial-photos')
  await deleteStorageFiles('memorial-videos')
  
  // 2. Delete database records (order matters due to foreign keys)
  // Children first, then parents
  await deleteTableData('orders')
  await deleteTableData('memorial_records')
  await deleteTableData('retail_activation_codes')
  await deleteTableData('customers')
  
  console.log('\n✅ Cleanup complete!')
}

main().catch(console.error)
