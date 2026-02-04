import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify admin session
async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  try {
    let query = supabase
      .from('business_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('purchase_type', type);
    }

    if (search) {
      query = query.or(`supplier_name.ilike.%${search}%,purchase_number.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: purchases, error } = await query;

    if (error) throw error;

    // Get counts
    const { data: allPurchases } = await supabase
      .from('business_purchases')
      .select('status');

    const counts = {
      all: allPurchases?.length || 0,
      pending: allPurchases?.filter(p => p.status === 'pending').length || 0,
      ordered: allPurchases?.filter(p => p.status === 'ordered').length || 0,
      shipped: allPurchases?.filter(p => p.status === 'shipped').length || 0,
      received: allPurchases?.filter(p => p.status === 'received').length || 0,
    };

    return NextResponse.json({ purchases, counts });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Generate purchase number
    const { data: numberData, error: numberError } = await supabase
      .rpc('generate_purchase_number');

    if (numberError) throw numberError;

    const purchaseData = {
      purchase_number: numberData,
      purchase_type: body.purchase_type,
      description: body.description || null,
      supplier_name: body.supplier_name,
      supplier_contact: body.supplier_contact || null,
      supplier_email: body.supplier_email || null,
      supplier_website: body.supplier_website || null,
      quantity: body.quantity || 1,
      unit_cost: body.unit_cost || null,
      total_cost: body.total_cost,
      currency: body.currency || 'NZD',
      status: body.status || 'pending',
      ordered_at: body.ordered_at || null,
      expected_delivery: body.expected_delivery || null,
      payment_method: body.payment_method || null,
      notes: body.notes || null,
    };

    const { data: purchase, error } = await supabase
      .from('business_purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
    }

    // Handle status transitions
    if (updates.status === 'ordered' && !updates.ordered_at) {
      updates.ordered_at = new Date().toISOString();
    }
    if (updates.status === 'received' && !updates.received_at) {
      updates.received_at = new Date().toISOString();
    }

    const { data: purchase, error } = await supabase
      .from('business_purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('business_purchases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}
