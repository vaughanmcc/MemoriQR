
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

async function checkMemorial() {
  const { data, error } = await supabase
    .from('memorial_records')
    .select('*')
    .ilike('memorial_slug', '%uncwcyc%');

  if (error) {
    console.error('Error fetching memorial:', error);
    return;
  }

  if (data.length === 0) {
    console.log('No memorial found matching "uncwcyc"');
    return;
  }

  const memorial = data[0];
  console.log('Memorial Data:', memorial);

  const now = new Date();
  const expiresAt = new Date(memorial.hosting_expires_at);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('Current Date:', now.toISOString());
  console.log('Expires At:', expiresAt.toISOString());
  console.log('Days Until Expiry:', daysUntilExpiry);
}

checkMemorial();
