-- Migration: Inventory/Stock Management System
-- Track stock levels by product and purchase batch for cost tracking

-- Inventory items table - tracks stock by batch/purchase
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product info
  product_type TEXT NOT NULL CHECK (product_type IN ('qr', 'nfc', 'frames', 'packaging', 'other')),
  variant TEXT, -- e.g., 'small', 'large', 'oak', 'walnut'
  description TEXT,
  sku TEXT, -- optional internal SKU
  
  -- Stock levels
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0, -- reserved for pending orders
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_in_stock - quantity_reserved) STORED,
  
  -- Thresholds
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER, -- suggested reorder amount
  
  -- Cost tracking (per unit from last purchase)
  unit_cost NUMERIC(10, 2),
  currency TEXT DEFAULT 'NZD',
  
  -- Source tracking
  purchase_id UUID REFERENCES business_purchases(id) ON DELETE SET NULL,
  supplier_name TEXT,
  
  -- Location (for future multi-location support)
  location TEXT DEFAULT 'default',
  
  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory movements log - tracks all stock changes
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  
  -- Movement details
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'received',      -- stock received from purchase
    'shipped',       -- shipped with customer order
    'adjustment',    -- manual adjustment (count correction)
    'reserved',      -- reserved for pending order
    'unreserved',    -- reservation released
    'returned',      -- customer return
    'damaged',       -- damaged/written off
    'transferred'    -- moved between locations
  )),
  
  quantity INTEGER NOT NULL, -- positive for in, negative for out
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  -- References
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES business_purchases(id) ON DELETE SET NULL,
  
  -- Details
  reason TEXT,
  performed_by TEXT, -- admin who made the change
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregate stock view (combines batches by product type)
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
  product_type,
  variant,
  SUM(quantity_in_stock) as total_in_stock,
  SUM(quantity_reserved) as total_reserved,
  SUM(quantity_in_stock - quantity_reserved) as total_available,
  MIN(low_stock_threshold) as low_stock_threshold,
  ROUND(AVG(unit_cost), 2) as avg_unit_cost,
  COUNT(*) as batch_count,
  CASE WHEN SUM(quantity_in_stock - quantity_reserved) <= MIN(low_stock_threshold) THEN true ELSE false END as is_low_stock
FROM inventory
WHERE is_active = true
GROUP BY product_type, variant;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_purchase ON inventory(purchase_id);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(quantity_in_stock, low_stock_threshold);
CREATE INDEX IF NOT EXISTS idx_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_movements_order ON inventory_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON inventory_movements(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON inventory;
CREATE TRIGGER trigger_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- Auto-create movement log on stock changes
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.quantity_in_stock != NEW.quantity_in_stock THEN
    INSERT INTO inventory_movements (
      inventory_id,
      movement_type,
      quantity,
      quantity_before,
      quantity_after,
      reason
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.quantity_in_stock > OLD.quantity_in_stock THEN 'received'
        ELSE 'adjustment'
      END,
      NEW.quantity_in_stock - OLD.quantity_in_stock,
      OLD.quantity_in_stock,
      NEW.quantity_in_stock,
      'Auto-logged from direct update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inventory_movement_log ON inventory;
CREATE TRIGGER trigger_inventory_movement_log
  AFTER UPDATE ON inventory
  FOR EACH ROW
  WHEN (OLD.quantity_in_stock IS DISTINCT FROM NEW.quantity_in_stock)
  EXECUTE FUNCTION log_inventory_movement();

-- RLS policies
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to inventory" ON inventory;
CREATE POLICY "Service role has full access to inventory"
  ON inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to inventory_movements" ON inventory_movements;
CREATE POLICY "Service role has full access to inventory_movements"
  ON inventory_movements FOR ALL USING (true) WITH CHECK (true);

-- Add inventory tracking fields to business_purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_purchases' AND column_name = 'stock_added'
  ) THEN
    ALTER TABLE business_purchases ADD COLUMN stock_added BOOLEAN DEFAULT false;
    ALTER TABLE business_purchases ADD COLUMN stock_added_at TIMESTAMPTZ;
  END IF;
END $$;

COMMENT ON TABLE inventory IS 'Stock levels tracked by purchase batch for FIFO cost tracking';
COMMENT ON TABLE inventory_movements IS 'Log of all inventory changes for audit trail';

SELECT 'Inventory system migration completed successfully!' as result;
