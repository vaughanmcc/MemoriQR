import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    return NextResponse.json({ partners });
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

    const validTypes = ['funeral_director', 'cemetery', 'pet_cremation', 'retailer', 'other'];
    if (!validTypes.includes(partnerType)) {
      return NextResponse.json({ error: 'Invalid partner type' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const { data: existing } = await supabase
      .from('partners')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A partner with this email already exists' }, { status: 400 });
    }

    const approvedAt = status === 'active' ? new Date().toISOString() : null;

    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        email: normalizedEmail,
        phone,
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

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error('Admin create partner error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
