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
    const { action, commission_rate, reason } = body;

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
          if (!reason || typeof reason !== 'string') {
            return NextResponse.json({ error: 'Suspension reason is required' }, { status: 400 });
          }
          newStatus = 'suspended';
          updateData = { status: 'suspended', is_active: false, suspended_reason: reason, suspended_at: new Date().toISOString() };
          break;
        case 'activate':
          newStatus = 'active';
          updateData = { status: 'active', is_active: true, suspended_reason: null, suspended_at: null };
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
      const partnerEmail = partner.contact_email;
    const businessName = partner.partner_name || partner.business_name;
    // Extract contact name from "Business Name (Contact Name)" format
    const contactNameMatch = partner.partner_name?.match(/\(([^)]+)\)/);
    const contactName = contactNameMatch?.[1] || partner.contact_name || '';
    
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
      } else if (action === 'suspend') {
        await fetch(PIPEDREAM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'partner_suspended',
            to: partnerEmail,
            data: {
              businessName: businessName,
              contactName: contactName,
              reason: reason,
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
      defaultDiscountPercent,
      defaultCommissionPercent,
      defaultFreeShipping,
      address,
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

    // Build update object
    const updateData: Record<string, unknown> = {
      partner_name: contactName ? `${businessName} (${contactName})` : businessName,
      contact_email: email.toLowerCase(),
      contact_phone: phone || null,
      partner_type: partnerType,
      website: website || null,
    };

    // Only update these if provided
    if (commissionRate !== undefined) {
      updateData.commission_rate = commissionRate;
    }
    if (defaultDiscountPercent !== undefined) {
      updateData.default_discount_percent = defaultDiscountPercent;
    }
    if (defaultCommissionPercent !== undefined) {
      updateData.default_commission_percent = defaultCommissionPercent;
    }
    if (defaultFreeShipping !== undefined) {
      updateData.default_free_shipping = defaultFreeShipping;
    }
    if (address !== undefined) {
      updateData.address = address;
    }

    // Update partner
    const { error: updateError } = await supabase
      .from('partners')
      .update(updateData)
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
