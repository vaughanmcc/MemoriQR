require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  // List existing buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }
  
  console.log('Existing buckets:', buckets.map(b => b.name));
  
  // Create memorial-photos bucket if it doesn't exist
  const memorialBucket = buckets.find(b => b.name === 'memorial-photos');
  if (!memorialBucket) {
    console.log('Creating memorial-photos bucket...');
    const { error: createError } = await supabase.storage.createBucket('memorial-photos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError.message);
    } else {
      console.log('✓ memorial-photos bucket created');
    }
  } else {
    console.log('✓ memorial-photos bucket already exists');
  }
  
  // Create memorial-videos bucket if it doesn't exist  
  const videoBucket = buckets.find(b => b.name === 'memorial-videos');
  if (!videoBucket) {
    console.log('Creating memorial-videos bucket...');
    const { error: createError } = await supabase.storage.createBucket('memorial-videos', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError.message);
    } else {
      console.log('✓ memorial-videos bucket created');
    }
  } else {
    console.log('✓ memorial-videos bucket already exists');
  }
}

setupStorage().catch(console.error);
