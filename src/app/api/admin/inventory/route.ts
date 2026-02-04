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

// GET - List inventory with summary
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view'); // 'detail' or 'summary'
  const productType = searchParams.get('productType');
  const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

  try {
    // Get detailed inventory
    let query = supabase
      .from('inventory')
      .select(`
        *,
        purchase:business_purchases(purchase_number, supplier_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productType && productType !== 'all') {
      query = query.eq('product_type', productType);
    }

    const { data: inventory, error } = await query;
    if (error) throw error;

    // Calculate summary by product type
    const summary: Record<string, {
      total_in_stock: number;
      total_reserved: number;
      total_available: number;
      avg_unit_cost: number;
      batch_count: number;
      is_low_stock: boolean;
      low_stock_threshold: number;
    }> = {};

    inventory?.forEach(item => {
      const key = item.variant ? `${item.product_type}:${item.variant}` : item.product_type;
      if (!summary[key]) {
        summary[key] = {
          total_in_stock: 0,
          total_reserved: 0,
          total_available: 0,
          avg_unit_cost: 0,
          batch_count: 0,
          is_low_stock: false,
          low_stock_threshold: item.low_stock_threshold || 10,
        };
      }
      summary[key].total_in_stock += item.quantity_in_stock || 0;
      summary[key].total_reserved += item.quantity_reserved || 0;
      summary[key].total_available += (item.quantity_in_stock || 0) - (item.quantity_reserved || 0);
      summary[key].avg_unit_cost = ((summary[key].avg_unit_cost * summary[key].batch_count) + (item.unit_cost || 0)) / (summary[key].batch_count + 1);
      summary[key].batch_count += 1;
    });

    // Check for low stock
    Object.keys(summary).forEach(key => {
      summary[key].is_low_stock = summary[key].total_available <= summary[key].low_stock_threshold;
    });

    // Get low stock items
    const lowStockItems = inventory?.filter(item => 
      (item.quantity_in_stock - (item.quantity_reserved || 0)) <= (item.low_stock_threshold || 10)
    ) || [];

    // Filter for low stock only if requested
    const filteredInventory = lowStockOnly 
      ? lowStockItems 
      : inventory;

    return NextResponse.json({
      inventory: filteredInventory,
      summary,
      lowStockItems,
      stats: {
        totalItems: inventory?.length || 0,
        lowStockCount: lowStockItems.length,
        totalValue: inventory?.reduce((sum, item) => 
          sum + ((item.quantity_in_stock || 0) * (item.unit_cost || 0)), 0
        ) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST - Add new inventory batch (usually from a purchase)
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      product_type,
      variant,
      description,
      sku,
      quantity_in_stock,
      low_stock_threshold,
      reorder_quantity,
      unit_cost,
      currency,
      purchase_id,
      supplier_name,
      notes,
    } = body;

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        product_type,
        variant,
        description,
        sku,
        quantity_in_stock,
        low_stock_threshold: low_stock_threshold || 10,
        reorder_quantity,
        unit_cost,
        currency: currency || 'NZD',
        purchase_id,
        supplier_name,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Log the initial stock as a movement
    await supabase.from('inventory_movements').insert({
      inventory_id: data.id,
      movement_type: 'received',
      quantity: quantity_in_stock,
      quantity_before: 0,
      quantity_after: quantity_in_stock,
      purchase_id,
      reason: 'Initial stock from purchase',
    });

    // Mark purchase as stock added if from a purchase
    if (purchase_id) {
      await supabase
        .from('business_purchases')
        .update({ stock_added: true, stock_added_at: new Date().toISOString() })
        .eq('id', purchase_id);
    }

    return NextResponse.json({ success: true, inventory: data });
  } catch (error) {
    console.error('Error creating inventory:', error);
    return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 });
  }
}

// PATCH - Update inventory (adjust stock, update details)
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, adjustment, reason, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // If this is a stock adjustment
    if (adjustment !== undefined) {
      // Get current stock
      const { data: current, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity_in_stock')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newQuantity = current.quantity_in_stock + adjustment;
      
      // Update stock
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity_in_stock: newQuantity })
        .eq('id', id);

      if (updateError) throw updateError;

      // Log movement
      await supabase.from('inventory_movements').insert({
        inventory_id: id,
        movement_type: adjustment > 0 ? 'received' : 'adjustment',
        quantity: adjustment,
        quantity_before: current.quantity_in_stock,
        quantity_after: newQuantity,
        reason: reason || 'Manual adjustment',
      });

      // Check for low stock alert
      const { data: item } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (item && (item.quantity_in_stock - (item.quantity_reserved || 0)) <= item.low_stock_threshold) {
        // Trigger low stock alert webhook
        if (process.env.PIPEDREAM_WEBHOOK_URL) {
          try {
            await fetch(process.env.PIPEDREAM_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'low_stock_alert',
                item: {
                  product_type: item.product_type,
                  variant: item.variant,
                  quantity_available: item.quantity_in_stock - (item.quantity_reserved || 0),
                  low_stock_threshold: item.low_stock_threshold,
                  supplier_name: item.supplier_name,
                },
              }),
            });
          } catch (e) {
            console.error('Failed to send low stock alert:', e);
          }
        }
      }
    }

    // Apply other updates
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}

// DELETE - Deactivate inventory item
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    // Soft delete by setting is_active = false
    const { error } = await supabase
      .from('inventory')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 });
  }
}
