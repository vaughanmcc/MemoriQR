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
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(full_name, email),
        order:orders(order_number, product_type)
      `)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('invoice_type', type);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,billing_name.ilike.%${search}%,billing_email.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: invoices, error } = await query.limit(100);

    if (error) throw error;

    // Get summary stats
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_amount, currency, invoice_type, created_at')
      .order('created_at', { ascending: false });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const stats = {
      total: allInvoices?.length || 0,
      totalRevenue: allInvoices?.reduce((sum, i) => sum + parseFloat(i.total_amount), 0) || 0,
      thisMonth: allInvoices?.filter(i => new Date(i.created_at) >= thisMonth).length || 0,
      thisMonthRevenue: allInvoices
        ?.filter(i => new Date(i.created_at) >= thisMonth)
        .reduce((sum, i) => sum + parseFloat(i.total_amount), 0) || 0,
    };

    return NextResponse.json({ invoices, stats });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
