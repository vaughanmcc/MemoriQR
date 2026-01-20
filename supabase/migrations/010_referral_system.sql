-- =====================================================
-- MIGRATION 010: Lead Generation / Referral System
-- Adds referral codes for partner lead generation cards
-- =====================================================

-- Referral codes table (lead generation cards)
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,                     -- Format: REF-XXXXX
  partner_id UUID REFERENCES partners(id),       -- Which partner owns this code
  
  -- Discount settings
  discount_percent DECIMAL(5,2) DEFAULT 0,       -- 0-100 percent discount
  free_shipping BOOLEAN DEFAULT false,           -- Free shipping flag
  
  -- Commission settings  
  commission_percent DECIMAL(5,2) DEFAULT 15,    -- 0-100 percent commission
  
  -- Usage tracking
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  order_id UUID,                                 -- Link to the order when used
  
  -- Metadata
  batch_id TEXT,                                 -- Group codes generated together
  batch_name TEXT,                               -- Human-readable batch name
  expires_at TIMESTAMP,                          -- Optional expiry
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_discount CHECK (discount_percent >= 0 AND discount_percent <= 100),
  CONSTRAINT valid_commission CHECK (commission_percent >= 0 AND commission_percent <= 100)
);

-- Add new columns to existing partner_commissions table for referral tracking
-- (Table was created in migration 005 for activation code commissions)
ALTER TABLE partner_commissions
  ADD COLUMN IF NOT EXISTS referral_code_id UUID,
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS order_total DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_percent DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS payout_reference TEXT;

-- Add foreign keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'partner_commissions_referral_code_id_fkey'
  ) THEN
    ALTER TABLE partner_commissions 
      ADD CONSTRAINT partner_commissions_referral_code_id_fkey 
      FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add default discount/commission rates to partners table
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS default_discount_percent DECIMAL(5,2) DEFAULT 10,
  ADD COLUMN IF NOT EXISTS default_commission_percent DECIMAL(5,2) DEFAULT 15,
  ADD COLUMN IF NOT EXISTS default_free_shipping BOOLEAN DEFAULT false;

-- Add referral tracking to orders table  
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_discount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS partner_commission_id UUID;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referral_codes_partner 
  ON referral_codes(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_batch 
  ON referral_codes(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_codes_unused 
  ON referral_codes(is_used) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_referral_codes_code
  ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_referral
  ON partner_commissions(referral_code_id) WHERE referral_code_id IS NOT NULL;

-- Comments
COMMENT ON TABLE referral_codes IS 'Lead generation codes for partner referral cards';
COMMENT ON COLUMN referral_codes.discount_percent IS 'Customer discount percentage (0-100)';
COMMENT ON COLUMN referral_codes.commission_percent IS 'Partner commission percentage (0-100)';
