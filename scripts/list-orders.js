// scripts/list-orders.js
// Lists all orders in the database

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

async function listOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_number, order_status, memorial_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error.message);
  } else if (orders && orders.length > 0) {
    console.log('Recent orders:');
    orders.forEach(o => console.log(o));
  } else {
    console.log('No orders found in the database.');
  }
}

listOrders();
