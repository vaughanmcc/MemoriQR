// Check memorial fulfillment status
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkFulfillment() {
  // Get all memorials with their fulfillment status
  const { data: memorials, error } = await supabase
    .from('memorial_records')
    .select('id, memorial_slug, deceased_name, fulfillment_status, activation_source, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\n=== Recent Memorials ===')
  memorials.forEach(m => {
    console.log(`${m.memorial_slug} | ${m.deceased_name} | status: ${m.fulfillment_status || 'NULL'} | source: ${m.activation_source || 'NULL'} | ${m.created_at}`)
  })

  // Count by fulfillment status
  const { data: counts, error: countError } = await supabase
    .from('memorial_records')
    .select('fulfillment_status')
  
  if (!countError && counts) {
    const statusCounts = counts.reduce((acc, m) => {
      const status = m.fulfillment_status || 'NULL'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    console.log('\n=== Fulfillment Status Counts ===')
    console.log(statusCounts)
  }
}

checkFulfillment()
