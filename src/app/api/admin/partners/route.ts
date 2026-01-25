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

export async function GET(request: Request) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      // Treat null status as 'pending' when filtering
      if (status === 'pending') {
        query = query.or('status.eq.pending,status.is.null');
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: partners, error } = await query;

    if (error) {
      console.error('Error fetching partners:', error);
      return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }

    // Map database columns to frontend expected names
    const mappedPartners = (partners || []).map(p => ({
      ...p,
      business_name: p.partner_name,
      contact_name: p.partner_name?.match(/\(([^)]+)\)/)?.[1] || '',
      email: p.contact_email,
      phone: p.contact_phone,
    }));

    return NextResponse.json({ partners: mappedPartners });
  } catch (error) {
    console.error('Admin partners error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      businessName,
      contactName,
      email,
      phone,
      partnerType,
      website,
      commissionRate = 15,
      status = 'active',
      defaultDiscountPercent = 10,
      defaultCommissionPercent = 15,
      defaultFreeShipping = false,
    } = body;

    if (!businessName || !contactName || !email || !phone || !partnerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['vet', 'funeral_director', 'funeral_home', 'cemetery', 'crematorium', 'pet_cremation', 'pet_store', 'retailer', 'groomer', 'other'];
    if (!validTypes.includes(partnerType)) {
      return NextResponse.json({ error: 'Invalid partner type' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedBusinessName = String(businessName).toLowerCase().trim();

    // Check for exact duplicate: same email + EXACT business name + type
    const { data: existingPartners } = await supabase
      .from('partners')
      .select('id, partner_name, partner_type, status')
      .ilike('contact_email', normalizedEmail);

    const exactDuplicate = existingPartners?.find(p => {
      // Extract just the business name (before the contact name in parentheses)
      const existingBusinessName = (p.partner_name || '').split('(')[0].trim().toLowerCase();
      // Require exact match on business name (not partial/substring match)
      const nameMatches = existingBusinessName === normalizedBusinessName;
      return nameMatches && p.partner_type === partnerType;
    });

    if (exactDuplicate) {
      return NextResponse.json({ 
        error: `A partner with this email, business name, and type already exists (status: ${exactDuplicate.status})` 
      }, { status: 400 });
    }

    const approvedAt = status === 'active' ? new Date().toISOString() : null;

    // Use correct database column names: partner_name, contact_email, contact_phone
    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
        partner_name: `${businessName} (${contactName})`,
        contact_email: normalizedEmail,
        contact_phone: phone,
        partner_type: partnerType,
        website: website || null,
        commission_rate: commissionRate,
        status,
        approved_at: approvedAt,
        default_discount_percent: defaultDiscountPercent,
        default_commission_percent: defaultCommissionPercent,
        default_free_shipping: defaultFreeShipping,
      })
      .select()
      .single();

    if (error || !partner) {
      console.error('Error creating partner:', error);
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
    }

    // Send welcome/approval email if partner is created as active
    if (status === 'active' && PIPEDREAM_WEBHOOK_URL) {
      await fetch(PIPEDREAM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'partner_approved',
          to: normalizedEmail,
          data: {
            businessName,
            contactName,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'}/partner`,
          },
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error('Admin create partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
