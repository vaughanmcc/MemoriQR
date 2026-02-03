
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetReminder() {
  const slug = 'uncwcyc-2026-optt';
  console.log(`Resetting 30-day reminder for ${slug}...`);

  const { data, error } = await supabase
    .from('memorial_records')
    .update({ reminder_sent_30_days_at: null })
    .eq('memorial_slug', slug)
    .select();

  if (error) {
    console.error('Error updating memorial:', error);
    return;
  }

  if (data.length === 0) {
    console.log('No memorial found with that slug.');
    return;
  }

  console.log('Successfully reset reminder flag:', data);
}

resetReminder();
