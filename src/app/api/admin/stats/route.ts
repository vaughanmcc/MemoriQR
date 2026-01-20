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
      .select('amount_total, status');

    const completedOrders = orders?.filter(o => o.status === 'completed') ?? [];
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);

    // Get recent activations (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: recentActivations } = await supabase
      .from('memorials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return NextResponse.json({
      totalPartners,
      activePartners,
      pendingApplications,
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
