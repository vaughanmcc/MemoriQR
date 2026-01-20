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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    console.error('Get partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, commission_rate } = body;

    // Get current partner data
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    let newStatus = partner.status;
    let updateData: Record<string, unknown> = {};

    // Handle status actions
    if (action) {
      switch (action) {
        case 'approve':
          newStatus = 'active';
          updateData = { status: 'active', approved_at: new Date().toISOString() };
          break;
        case 'reject':
          newStatus = 'rejected';
          updateData = { status: 'rejected' };
          break;
        case 'suspend':
          newStatus = 'suspended';
          updateData = { status: 'suspended' };
          break;
        case 'activate':
          newStatus = 'active';
          updateData = { status: 'active' };
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Handle commission rate update
    if (commission_rate !== undefined) {
      updateData.commission_rate = commission_rate;
    }

    // Update partner
    const { error: updateError } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Update partner error:', updateError);
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
    }

    // Send notification emails
    if (PIPEDREAM_WEBHOOK_URL && action) {
      if (action === 'approve') {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_approved',
            to: partner.email,
            data: {
              businessName: partner.business_name,
              contactName: partner.contact_name,
              loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/partner`,
            },
          }),
        }).catch(console.error);
      } else if (action === 'reject') {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_rejected',
            to: partner.email,
            data: {
              businessName: partner.business_name,
              contactName: partner.contact_name,
            },
          }),
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Update partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
