-- =====================================================
-- MIGRATION 019: Add foreign key for referral_codes.order_id
-- Fixes: "Could not find a relationship between 'referral_codes' and 'orders'"
-- =====================================================

-- Add foreign key constraint to referral_codes.order_id -> orders.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'referral_codes_order_id_fkey'
    AND table_name = 'referral_codes'
  ) THEN
    ALTER TABLE referral_codes
      ADD CONSTRAINT referral_codes_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_order_id ON referral_codes(order_id);
