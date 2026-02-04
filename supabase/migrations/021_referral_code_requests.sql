-- =====================================================
-- MIGRATION 021: Referral Code Requests
-- Allows partners to request referral codes via the portal
-- =====================================================

-- Referral code requests table
CREATE TABLE IF NOT EXISTS referral_code_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Request details
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100),
  reason TEXT,                                   -- Required if quantity > 10
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,                              -- Notes from admin when approving/rejecting
  processed_at TIMESTAMP,
  processed_by TEXT,                             -- Admin email who processed
  
  -- Generated batch info (populated when approved)
  batch_id TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_code_requests_partner 
  ON referral_code_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_requests_status 
  ON referral_code_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_referral_code_requests_created 
  ON referral_code_requests(created_at DESC);

-- Updated trigger for updated_at
CREATE OR REPLACE FUNCTION update_referral_code_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS referral_code_requests_updated_at ON referral_code_requests;
CREATE TRIGGER referral_code_requests_updated_at
  BEFORE UPDATE ON referral_code_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_code_requests_updated_at();

-- Comments
COMMENT ON TABLE referral_code_requests IS 'Partner requests for additional referral codes';
COMMENT ON COLUMN referral_code_requests.quantity IS 'Number of codes requested (max 100)';
COMMENT ON COLUMN referral_code_requests.reason IS 'Required explanation when requesting more than 10 codes';
