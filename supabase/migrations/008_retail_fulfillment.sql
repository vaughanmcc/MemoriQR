-- =====================================================
-- MIGRATION 008: Retail Fulfillment Tracking
-- Adds fulfillment status tracking for retail activations
-- and updates activation code format for scratch cards
-- =====================================================

-- Add fulfillment tracking columns to memorial_records
ALTER TABLE memorial_records 
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'not_required' 
    CHECK (fulfillment_status IN ('not_required', 'pending', 'processing', 'shipped', 'delivered')),
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipping_address JSONB,
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS activation_source TEXT DEFAULT 'online'
    CHECK (activation_source IN ('online', 'retail'));

-- Add retail price and variant tracking to activation codes
ALTER TABLE retail_activation_codes
  ADD COLUMN IF NOT EXISTS variant_code TEXT,
  ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES code_batches(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN memorial_records.fulfillment_status IS 'Status of physical product fulfillment: not_required (online prepaid), pending, processing, shipped, delivered';
COMMENT ON COLUMN memorial_records.tracking_number IS 'Shipping tracking number';
COMMENT ON COLUMN memorial_records.shipping_carrier IS 'Shipping carrier (NZ Post, CourierPost, etc)';
COMMENT ON COLUMN memorial_records.shipped_at IS 'Timestamp when product was shipped';
COMMENT ON COLUMN memorial_records.delivered_at IS 'Timestamp when product was delivered';
COMMENT ON COLUMN memorial_records.shipping_address IS 'Customer shipping address as JSON';
COMMENT ON COLUMN memorial_records.shipping_name IS 'Name for shipping label';
COMMENT ON COLUMN memorial_records.activation_source IS 'How the memorial was activated: online (direct purchase) or retail (scratch card)';

COMMENT ON COLUMN retail_activation_codes.variant_code IS 'Card variant code (e.g., 5N, 10B, 25Q) indicating duration and product type';
COMMENT ON COLUMN retail_activation_codes.retail_price IS 'Retail price for this activation code';
COMMENT ON COLUMN retail_activation_codes.batch_id IS 'Reference to the code batch this code belongs to';

-- Create index for fulfillment queries
CREATE INDEX IF NOT EXISTS idx_memorial_fulfillment_status ON memorial_records(fulfillment_status) 
  WHERE fulfillment_status != 'not_required';
CREATE INDEX IF NOT EXISTS idx_memorial_activation_source ON memorial_records(activation_source);

-- Update generate_activation_code function to support new format
-- Format: MQR-[VARIANT]-[RANDOM] e.g., MQR-10B-A7K9M2
CREATE OR REPLACE FUNCTION generate_retail_activation_code(variant TEXT)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    random_part TEXT;
BEGIN
    -- Generate 6-character alphanumeric random part
    random_part := upper(substr(md5(random()::text), 1, 6));
    code := 'MQR-' || variant || '-' || random_part;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM retail_activation_codes WHERE activation_code = code) LOOP
        random_part := upper(substr(md5(random()::text), 1, 6));
        code := 'MQR-' || variant || '-' || random_part;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create a view for pending fulfillment orders
CREATE OR REPLACE VIEW pending_fulfillment AS
SELECT 
    mr.id AS memorial_id,
    mr.memorial_slug,
    mr.deceased_name,
    mr.product_type,
    mr.hosting_duration,
    mr.fulfillment_status,
    mr.shipping_name,
    mr.shipping_address,
    mr.created_at,
    c.email AS customer_email,
    c.full_name AS customer_name,
    p.partner_name,
    rac.activation_code
FROM memorial_records mr
LEFT JOIN customers c ON mr.customer_id = c.id
LEFT JOIN retail_activation_codes rac ON rac.memorial_id = mr.id
LEFT JOIN partners p ON rac.partner_id = p.id
WHERE mr.fulfillment_status IN ('pending', 'processing')
ORDER BY mr.created_at ASC;

-- Grant access to the view
-- Note: Actual RLS policies are handled by the service role
