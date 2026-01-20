// scripts/check-memorial-theme.js
// Check theme and frame for recent memorials

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMemorials() {
  const { data, error } = await supabase
    .from('memorial_records')
    .select('memorial_slug, deceased_name, theme, frame, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Recent memorials with theme/frame:');
    data.forEach(m => {
      console.log(`  ${m.memorial_slug}: theme="${m.theme}", frame="${m.frame}" (${m.deceased_name})`);
    });
  }
}

checkMemorials();
