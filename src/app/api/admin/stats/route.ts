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
      .from('memorials')
      .select('*', { count: 'exact', head: true });

    // Get order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, order_status');

    // Count orders that are paid, shipped, or completed (not cancelled or pending)
    const paidOrders = orders?.filter(o => ['paid', 'processing', 'shipped', 'completed'].includes(o.order_status)) ?? [];
    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Get recent activations (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: recentActivations } = await supabase
      .from('memorials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get pending batch requests
    const { count: pendingBatchRequests } = await supabase
      .from('code_batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get pending commissions (awaiting payout)
    const { count: pendingCommissions } = await supabase
      .from('partner_commissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get pending fulfillment orders (paid but not shipped)
    const { count: pendingFulfillment } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'paid');

    return NextResponse.json({
      totalPartners,
      activePartners,
      pendingApplications,
      pendingBatchRequests: pendingBatchRequests ?? 0,
      pendingCommissions: pendingCommissions ?? 0,
      pendingFulfillment: pendingFulfillment ?? 0,
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
