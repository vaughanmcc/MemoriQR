-- Migration: Invoice System
-- Auto-generate invoices for all orders

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_type TEXT NOT NULL DEFAULT 'order' CHECK (invoice_type IN ('order', 'renewal', 'partner_batch', 'refund')),
  
  -- Billing info (snapshot at time of invoice)
  billing_name TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  billing_address JSONB,
  
  -- Line items (stored as JSON for flexibility)
  line_items JSONB NOT NULL DEFAULT '[]',
  
  -- Amounts
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  discount_code TEXT,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NZD',
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial_refund')),
  payment_method TEXT,
  stripe_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at DESC);

-- Generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  seq_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_prefix || '%';
  
  new_number := 'INV-' || year_prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to invoices"
  ON invoices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add invoice_id to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON TABLE invoices IS 'Automated invoices for orders, renewals, and partner batches';

SELECT 'Invoice system migration completed successfully!' as result;
