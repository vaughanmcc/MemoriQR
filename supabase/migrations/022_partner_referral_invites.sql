-- Partner Referral Invites
-- Tracks when partners send referral invitations via email
-- Used to attribute sales to partners for commission

CREATE TABLE partner_referral_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  message TEXT, -- Optional personal message from partner
  invite_code VARCHAR(20) NOT NULL UNIQUE, -- Unique code for tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ, -- When recipient clicked the link
  converted_at TIMESTAMPTZ, -- When recipient completed an order
  order_id UUID REFERENCES orders(id), -- The order that was created
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'clicked', 'converted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up invites by partner
CREATE INDEX idx_partner_referral_invites_partner_id ON partner_referral_invites(partner_id);

-- Index for looking up invites by invite code
CREATE INDEX idx_partner_referral_invites_invite_code ON partner_referral_invites(invite_code);

-- Index for looking up by recipient email
CREATE INDEX idx_partner_referral_invites_recipient_email ON partner_referral_invites(recipient_email);

-- Index for status filtering
CREATE INDEX idx_partner_referral_invites_status ON partner_referral_invites(status);

-- Trigger to update updated_at
CREATE TRIGGER update_partner_referral_invites_updated_at
  BEFORE UPDATE ON partner_referral_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE partner_referral_invites IS 'Tracks referral invitations sent by partners via email for commission attribution';
