/**
 * Cleanup script to delete all DEV data from database and storage
 * Usage: node scripts/cleanup-dev-data.js
 * 
 * WARNING: This will permanently delete all data!
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDevData() {
  console.log('\n⚠️  WARNING: This will delete ALL data from the database and storage buckets!\n');
  
  // Give user 3 seconds to cancel
  console.log('Starting in 3 seconds... (Ctrl+C to cancel)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // =====================================================
    // 1. Clear Storage Buckets
    // =====================================================
    console.log('📦 Clearing storage buckets...\n');

    // Clear memorial-photos bucket
    const { data: photos, error: photosListError } = await supabase.storage
      .from('memorial-photos')
      .list('', { limit: 1000 });

    if (photos && photos.length > 0) {
      // Get all folders (memorials)
      for (const folder of photos) {
        if (folder.name) {
          const { data: files } = await supabase.storage
            .from('memorial-photos')
            .list(folder.name, { limit: 1000 });
          
          if (files && files.length > 0) {
            const filePaths = files.map(f => `${folder.name}/${f.name}`);
            const { error: deleteError } = await supabase.storage
              .from('memorial-photos')
              .remove(filePaths);
            
            if (deleteError) {
              console.log(`  ⚠️  Error deleting photos in ${folder.name}:`, deleteError.message);
            } else {
              console.log(`  ✓ Deleted ${filePaths.length} photos from ${folder.name}`);
            }
          }
        }
      }
    }
    console.log('  ✓ memorial-photos bucket cleared\n');

    // Clear memorial-videos bucket
    const { data: videos, error: videosListError } = await supabase.storage
      .from('memorial-videos')
      .list('', { limit: 1000 });

    if (videos && videos.length > 0) {
      for (const folder of videos) {
        if (folder.name) {
          const { data: files } = await supabase.storage
            .from('memorial-videos')
            .list(folder.name, { limit: 1000 });
          
          if (files && files.length > 0) {
            const filePaths = files.map(f => `${folder.name}/${f.name}`);
            const { error: deleteError } = await supabase.storage
              .from('memorial-videos')
              .remove(filePaths);
            
            if (deleteError) {
              console.log(`  ⚠️  Error deleting videos in ${folder.name}:`, deleteError.message);
            } else {
              console.log(`  ✓ Deleted ${filePaths.length} videos from ${folder.name}`);
            }
          }
        }
      }
    }
    console.log('  ✓ memorial-videos bucket cleared\n');

    // =====================================================
    // 2. Clear Database Tables (in order of dependencies)
    // =====================================================
    console.log('🗄️  Clearing database tables...\n');

    // Activity log
    const { error: activityError } = await supabase
      .from('activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    console.log(activityError ? `  ⚠️  activity_log: ${activityError.message}` : '  ✓ activity_log cleared');

    // Memorial upgrades
    const { error: upgradesError } = await supabase
      .from('memorial_upgrades')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(upgradesError ? `  ⚠️  memorial_upgrades: ${upgradesError.message}` : '  ✓ memorial_upgrades cleared');

    // Renewals
    const { error: renewalsError } = await supabase
      .from('renewals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(renewalsError ? `  ⚠️  renewals: ${renewalsError.message}` : '  ✓ renewals cleared');

    // Retail activation codes
    const { error: retailCodesError } = await supabase
      .from('retail_activation_codes')
      .delete()
      .neq('activation_code', '');
    console.log(retailCodesError ? `  ⚠️  retail_activation_codes: ${retailCodesError.message}` : '  ✓ retail_activation_codes cleared');

    // Memorial records
    const { error: memorialsError } = await supabase
      .from('memorial_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(memorialsError ? `  ⚠️  memorial_records: ${memorialsError.message}` : '  ✓ memorial_records cleared');

    // Orders
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(ordersError ? `  ⚠️  orders: ${ordersError.message}` : '  ✓ orders cleared');

    // Customers
    const { error: customersError } = await supabase
      .from('customers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(customersError ? `  ⚠️  customers: ${customersError.message}` : '  ✓ customers cleared');

    // Partners (optional - uncomment if you want to clear partners too)
    // const { error: partnersError } = await supabase
    //   .from('partners')
    //   .delete()
    //   .neq('id', '00000000-0000-0000-0000-000000000000');
    // console.log(partnersError ? `  ⚠️  partners: ${partnersError.message}` : '  ✓ partners cleared');

    console.log('\n✅ DEV data cleanup complete!\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupDevData();
