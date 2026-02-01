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

export async function GET() {
  if (!await checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get partner stats
    const { data: partners } = await supabase
      .from('partners')
      .select('status');

    const totalPartners = partners?.length ?? 0;
    const activePartners = partners?.filter(p => p.status === 'active').length ?? 0;
    const pendingApplications = partners?.filter(p => p.status === 'pending').length ?? 0;

    // Get memorial count
    const { count: totalMemorials } = await supabase
      .from('memorial_records')
      .select('*', { count: 'exact', head: true });

    // Get order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, order_status');

    // Count orders that are paid, shipped, or completed (not cancelled or pending)
    const paidOrders = orders?.filter(o => ['paid', 'processing', 'shipped', 'completed'].includes(o.order_status)) ?? [];
    const totalOrders = paidOrders.length;
    const orderRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Get partner batch revenue (paid code batches)
    const { data: batches } = await supabase
      .from('code_batches')
      .select('total_cost, status, paid_at')
      .not('paid_at', 'is', null);
    
    const batchRevenue = batches?.reduce((sum, b) => sum + (Number(b.total_cost) || 0), 0) ?? 0;
    
    // Total revenue = orders + partner batches
    const totalRevenue = orderRevenue + batchRevenue;

    // Get recent activations (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: recentActivations } = await supabase
      .from('memorials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get pending batch requests (pending status = unpaid checkout sessions)
    // Note: With Stripe checkout, 'pending' means checkout started but not completed
    const { count: pendingBatchRequests } = await supabase
      .from('code_batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('paid_at', null);

    // Get pending commissions (awaiting payout)
    const { count: pendingCommissions } = await supabase
      .from('partner_commissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get pending fulfillment - memorials that need physical products shipped
    // This includes both online orders and partner-activated codes
    const { count: pendingFulfillment } = await supabase
      .from('memorial_records')
      .select('*', { count: 'exact', head: true })
      .in('fulfillment_status', ['pending', 'processing']);

    // Get pending referral code requests
    const { count: pendingReferralRequests } = await (supabase
      .from('referral_code_requests' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending') as any);

    return NextResponse.json({
      totalPartners,
      activePartners,
      pendingApplications,
      pendingBatchRequests: pendingBatchRequests ?? 0,
      pendingCommissions: pendingCommissions ?? 0,
      pendingFulfillment: pendingFulfillment ?? 0,
      pendingReferralRequests: pendingReferralRequests ?? 0,
      totalMemorials: totalMemorials ?? 0,
      totalOrders,
      totalRevenue,
      recentActivations: recentActivations ?? 0,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
