// Load environment variables from .env.local (or .env) using ES module import
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use supabase-js directly for Node.js scripts
import { createClient } from '@supabase/supabase-js'

// Load env vars (if using dotenv, uncomment below)
// require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)


async function checkActivationCode(code) {
  const upperCode = code.toUpperCase()

  // Check retail_activation_codes
  const { data: retailCode, error: retailError } = await supabase
    .from('retail_activation_codes')
    .select('*')
    .eq('activation_code', upperCode)
    .single()

  if (retailCode) {
    console.log('Found in retail_activation_codes:', retailCode)
  } else {
    console.log('Not found in retail_activation_codes.', retailError?.message)
  }

  // Check orders
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', `MQR-${upperCode}`)
    .eq('order_status', 'paid')
    .single()

  if (order) {
    console.log('Found in orders:', order)
  } else {
    console.log('Not found in orders.', orderError?.message)
  }
}

// Usage: node scripts/check-code.js FLUFFY-2026-5Y18
const code = process.argv[2]
if (!code) {
  console.error('Usage: node scripts/check-code.js <CODE>')
  process.exit(1)
}

checkActivationCode(code)
