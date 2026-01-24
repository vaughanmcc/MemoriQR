import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';

// Search memorials
export async function GET(request: NextRequest) {
  // Verify admin session
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (!adminSession?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const slug = searchParams.get('slug')?.trim();

  const supabase = createAdminClient();

  // If slug is provided, get single memorial details
  if (slug) {
    const { data: memorial, error } = await supabase
      .from('memorial_records')
      .select(`
        *,
        customer:customers(id, full_name, email, phone)
      `)
      .eq('memorial_slug', slug)
      .single();

    if (error || !memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    return NextResponse.json({ memorial });
  }

  // Search memorials
  if (!query) {
    return NextResponse.json({ error: 'Search query required' }, { status: 400 });
  }

  // Search by deceased name, slug, or customer email
  const searchPattern = `%${query}%`;

  const { data: memorials, error } = await supabase
    .from('memorial_records')
    .select(`
      id,
      memorial_slug,
      deceased_name,
      deceased_type,
      species,
      is_published,
      hosting_expires_at,
      renewal_status,
      views_count,
      created_at,
      customer:customers(id, full_name, email)
    `)
    .or(`deceased_name.ilike.${searchPattern},memorial_slug.ilike.${searchPattern}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Memorial search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  // Also search by customer email if no results or to add more
  const { data: byEmail } = await supabase
    .from('memorial_records')
    .select(`
      id,
      memorial_slug,
      deceased_name,
      deceased_type,
      species,
      is_published,
      hosting_expires_at,
      renewal_status,
      views_count,
      created_at,
      customer:customers!inner(id, full_name, email)
    `)
    .ilike('customers.email', searchPattern)
    .order('created_at', { ascending: false })
    .limit(50);

  // Combine and dedupe results
  const combined = [...(memorials || [])];
  if (byEmail) {
    for (const m of byEmail) {
      if (!combined.find(c => c.id === m.id)) {
        combined.push(m);
      }
    }
  }

  return NextResponse.json({ memorials: combined });
}

// Update memorial (toggle publish, extend expiry)
export async function PATCH(request: NextRequest) {
  // Verify admin session
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');
  
  if (!adminSession?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memorialId, action, value } = body;

    if (!memorialId || !action) {
      return NextResponse.json({ error: 'Memorial ID and action required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get current memorial
    const { data: memorial, error: fetchError } = await supabase
      .from('memorial_records')
      .select('*')
      .eq('id', memorialId)
      .single();

    if (fetchError || !memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    let message = '';

    switch (action) {
      case 'toggle_publish':
        updateData = { is_published: !memorial.is_published };
        message = memorial.is_published ? 'Memorial unpublished' : 'Memorial published';
        break;

      case 'extend_expiry':
        // Extend by specified months (default 12)
        const months = value || 12;
        const currentExpiry = new Date(memorial.hosting_expires_at);
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + months);
        updateData = { 
          hosting_expires_at: newExpiry.toISOString(),
          renewal_status: 'active'
        };
        message = `Hosting extended by ${months} months to ${newExpiry.toLocaleDateString()}`;
        break;

      case 'reset_views':
        updateData = { views_count: 0 };
        message = 'View count reset to 0';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('memorial_records')
      .update(updateData)
      .eq('id', memorialId);

    if (updateError) {
      console.error('Memorial update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Memorial update error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
