// scripts/update-memorial-theme.js
// Update theme and frame for a specific memorial

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

async function updateMemorial() {
  // Update the feanufbyfeybfbdafbda memorial to use Sage + Oval Victorian
  const { data, error } = await supabase
    .from('memorial_records')
    .update({
      theme: 'sage',
      frame: 'oval-victorian'
    })
    .eq('memorial_slug', 'feanufbyfeybfbdafbda-2026-nnw8')
    .select('memorial_slug, theme, frame');

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Updated memorial:');
    console.log(data);
  }
}

updateMemorial();
