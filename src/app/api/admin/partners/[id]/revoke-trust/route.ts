import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PIPEDREAM_WEBHOOK_URL = process.env.PIPEDREAM_WEBHOOK_URL;

async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session')?.value;
  const correctPassword = process.env.ADMIN_PASSWORD;
  return !!correctPassword && session === correctPassword;
}

// POST - Revoke all trusted device sessions for a partner
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get partner details for email notification
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('id, partner_name, contact_email')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Delete all trusted device sessions for this partner
    const { error, count } = await supabase
      .from('partner_sessions')
      .delete()
      .eq('partner_id', id)
      .eq('is_trusted_device', true);

    if (error) {
      console.error('Error revoking trusted sessions:', error);
      return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 });
    }

    // Send email notification to partner
    if (PIPEDREAM_WEBHOOK_URL && partner.contact_email) {
      const contactNameMatch = partner.partner_name?.match(/\(([^)]+)\)/);
      const contactName = contactNameMatch?.[1] || '';
      const businessName = partner.partner_name?.replace(/\s*\([^)]+\)\s*$/, '') || '';

      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_trust_revoked',
          to: partner.contact_email,
          data: {
            businessName,
            contactName,
            revokedCount: count || 0,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'}/partner`,
          },
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ 
      success: true, 
      revokedCount: count || 0,
      message: `Revoked ${count || 0} trusted session(s)`
    });
  } catch (error) {
    console.error('Revoke trust error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
