-- Migration: Business Purchases System
-- Track internal business orders/purchases (QR tags, supplies, etc.)

-- Create business_purchases table
CREATE TABLE IF NOT EXISTS business_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Purchase details
  purchase_number TEXT NOT NULL UNIQUE,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('qr_tags', 'nfc_tags', 'supplies', 'equipment', 'services', 'other')),
  description TEXT,
  
  -- Supplier info
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  supplier_email TEXT,
  supplier_website TEXT,
  
  -- Quantities and costs
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10, 2),
  total_cost NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NZD',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled')),
  
  -- Dates
  ordered_at TIMESTAMPTZ,
  expected_delivery TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  
  -- Shipping/tracking
  tracking_number TEXT,
  shipping_carrier TEXT,
  
  -- Payment
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  
  -- Notes and attachments
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_business_purchases_status ON business_purchases(status);
CREATE INDEX IF NOT EXISTS idx_business_purchases_type ON business_purchases(purchase_type);
CREATE INDEX IF NOT EXISTS idx_business_purchases_created ON business_purchases(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_business_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_purchases_updated_at ON business_purchases;
CREATE TRIGGER trigger_business_purchases_updated_at
  BEFORE UPDATE ON business_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_business_purchases_updated_at();

-- Generate purchase number function
CREATE OR REPLACE FUNCTION generate_purchase_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  seq_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(purchase_number FROM 6) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM business_purchases
  WHERE purchase_number LIKE 'PO-' || year_prefix || '%';
  
  new_number := 'PO-' || year_prefix || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE business_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to business_purchases"
  ON business_purchases
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE business_purchases IS 'Internal business purchases for QR tags, supplies, equipment, etc.';

SELECT 'Business purchases migration completed successfully!' as result;
