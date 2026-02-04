import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return session?.value === process.env.ADMIN_PASSWORD;
}

// GET - List inventory movements (history)
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const inventoryId = searchParams.get('inventoryId');
  const orderId = searchParams.get('orderId');
  const purchaseId = searchParams.get('purchaseId');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    let query = supabase
      .from('inventory_movements')
      .select(`
        *,
        inventory:inventory(product_type, variant, description),
        order:orders(order_number),
        purchase:business_purchases(purchase_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (inventoryId) {
      query = query.eq('inventory_id', inventoryId);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (purchaseId) {
      query = query.eq('purchase_id', purchaseId);
    }

    const { data: movements, error } = await query;
    if (error) throw error;

    return NextResponse.json({ movements });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
  }
}

// POST - Record a movement (e.g., shipping an order, receiving stock)
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      inventory_id,
      movement_type,
      quantity,
      order_id,
      purchase_id,
      reason,
      performed_by,
    } = body;

    // Get current stock
    const { data: inventory, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity_in_stock, quantity_reserved')
      .eq('id', inventory_id)
      .single();

    if (fetchError) throw fetchError;

    const quantity_before = inventory.quantity_in_stock;
    let quantity_after = quantity_before;
    let reserved_change = 0;

    // Apply movement based on type
    switch (movement_type) {
      case 'received':
        quantity_after = quantity_before + quantity;
        break;
      case 'shipped':
      case 'damaged':
        quantity_after = quantity_before + quantity; // quantity should be negative
        // Also unreserve if it was reserved
        reserved_change = Math.max(-inventory.quantity_reserved, quantity);
        break;
      case 'reserved':
        reserved_change = quantity;
        break;
      case 'unreserved':
        reserved_change = -quantity;
        break;
      case 'adjustment':
      case 'returned':
        quantity_after = quantity_before + quantity;
        break;
    }

    // Update inventory
    const update: Record<string, number> = { quantity_in_stock: quantity_after };
    if (reserved_change !== 0) {
      update.quantity_reserved = inventory.quantity_reserved + reserved_change;
    }

    const { error: updateError } = await supabase
      .from('inventory')
      .update(update)
      .eq('id', inventory_id);

    if (updateError) throw updateError;

    // Log movement
    const { data: movement, error: logError } = await supabase
      .from('inventory_movements')
      .insert({
        inventory_id,
        movement_type,
        quantity,
        quantity_before,
        quantity_after,
        order_id,
        purchase_id,
        reason,
        performed_by,
      })
      .select()
      .single();

    if (logError) throw logError;

    return NextResponse.json({ success: true, movement });
  } catch (error) {
    console.error('Error recording movement:', error);
    return NextResponse.json({ error: 'Failed to record movement' }, { status: 500 });
  }
}
