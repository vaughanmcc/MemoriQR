-- Partner Referral Code Shares
-- Tracks when partners share their referral codes via email
-- Used to track who each code was shared with

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Track sharing of referral codes
CREATE TABLE referral_code_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  message TEXT, -- Optional personal message from partner
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up shares by referral code
CREATE INDEX idx_referral_code_shares_code_id ON referral_code_shares(referral_code_id);

-- Index for looking up shares by partner
CREATE INDEX idx_referral_code_shares_partner_id ON referral_code_shares(partner_id);

-- Index for looking up by recipient email
CREATE INDEX idx_referral_code_shares_recipient_email ON referral_code_shares(recipient_email);

-- Trigger to update updated_at
CREATE TRIGGER update_referral_code_shares_updated_at
  BEFORE UPDATE ON referral_code_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE referral_code_shares IS 'Tracks when partners share their referral codes with potential customers via email';
