// scripts/insert-test-code.js
// Usage: node scripts/insert-test-code.js FLUFFY-2026-5Y18

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertTestCode(code) {
  const upperCode = code.toUpperCase();
  const { data, error } = await supabase
    .from('retail_activation_codes')
    .insert([
      {
        activation_code: upperCode,
        is_used: false,
        product_type: 'nfc_only', // Must be 'nfc_only', 'qr_only', or 'both'
        hosting_duration: 5,     // Must be 5, 10, or 25
        partner_id: null         // Or set a value if needed
      }
    ])
    .select();

  if (error) {
    console.error('Insert error:', error.message);
  } else {
    console.log('Inserted:', data);
  }
}

const code = process.argv[2];
if (!code) {
  console.error('Usage: node scripts/insert-test-code.js <CODE>');
  process.exit(1);
}

insertTestCode(code);
