// scripts/check-order-status.js
// Check order status and details

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

async function checkOrder(orderNumber) {
  // Check without status filter
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    console.error('Error:', error.message);
  } else if (order) {
    console.log('Order found:');
    console.log('  order_number:', order.order_number);
    console.log('  order_status:', order.order_status);
    console.log('  memorial_id:', order.memorial_id);
    console.log('  created_at:', order.created_at);
  } else {
    console.log('Order not found.');
  }
}

const orderNumber = process.argv[2] || 'MQR-MKBFAI7X';
checkOrder(orderNumber);
