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
