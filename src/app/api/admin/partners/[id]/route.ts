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
    // DB statuses: pending, active, suspended, rejected (see migration 012)
    if (action) {
      switch (action) {
        case 'approve':
          newStatus = 'active';
          updateData = { status: 'active', approved_at: new Date().toISOString(), is_active: true };
          break;
        case 'reject':
          newStatus = 'rejected';
          updateData = { status: 'rejected', rejected_at: new Date().toISOString(), is_active: false };
          break;
        case 'suspend':
          newStatus = 'suspended';
          updateData = { status: 'suspended', is_active: false };
          break;
        case 'activate':
          newStatus = 'active';
          updateData = { status: 'active', is_active: true };
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
    // Note: Use correct DB columns: contact_email, partner_name
    const partnerEmail = partner.contact_email || partner.email;
    const businessName = partner.partner_name || partner.business_name;
    const contactName = partner.partner_name?.match(/\\(([^)]+)\\)/)?.[1] || partner.contact_name || '';
    
    if (PIPEDREAM_WEBHOOK_URL && action && partnerEmail) {
      if (action === 'approve') {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_approved',
            to: partnerEmail,
            data: {
              businessName: businessName,
              contactName: contactName,
              loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'}/partner`,
            },
          }),
        }).catch(console.error);
      } else if (action === 'reject') {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_rejected',
            to: partnerEmail,
            data: {
              businessName: businessName,
              contactName: contactName,
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

// PUT - Full update of partner details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      businessName,
      contactName,
      email,
      phone,
      partnerType,
      website,
      commissionRate,
    } = body;

    if (!businessName || !email) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 });
    }

    // Check if partner exists
    const { data: existing, error: fetchError } = await supabase
      .from('partners')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Update partner with correct column names
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        partner_name: contactName ? `${businessName} (${contactName})` : businessName,
        contact_email: email.toLowerCase(),
        contact_phone: phone || null,
        partner_type: partnerType,
        website: website || null,
        commission_rate: commissionRate,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating partner:', updateError);
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
