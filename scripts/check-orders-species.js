// scripts/check-orders-species.js
// Check orders with species data

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

async function checkOrders() {
  // Check orders for species data
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('order_number, order_status, deceased_name, species, activation_code')
    .order('created_at', { ascending: false })
    .limit(10);

  if (ordersError) {
    console.error('Orders error:', ordersError.message);
  } else {
    console.log('Recent orders with species:');
    orders.forEach(o => {
      console.log(`  ${o.order_number}: "${o.deceased_name}" species="${o.species || 'null'}" code=${o.activation_code} status=${o.order_status}`);
    });
  }

  // Check retail codes
  const { data: codes, error: codesError } = await supabase
    .from('retail_activation_codes')
    .select('code, status, species')
    .order('created_at', { ascending: false })
    .limit(10);

  if (codesError) {
    console.error('Codes error:', codesError.message);
  } else {
    console.log('\nRecent retail codes:');
    codes.forEach(c => {
      console.log(`  ${c.code}: status=${c.status} species="${c.species || 'null'}"`);
    });
  }
}

checkOrders();
