-- =====================================================
-- MIGRATION 012: Code Activity Log & Code Transfer
-- Tracks all activity on referral codes and allows transfers
-- =====================================================

-- Activity log for referral codes
CREATE TABLE IF NOT EXISTS referral_code_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,                            -- Store the code text for reference
  activity_type TEXT NOT NULL,                   -- created, transferred, used, expired
  
  -- Actor information
  performed_by_partner_id UUID REFERENCES partners(id),
  performed_by_admin BOOLEAN DEFAULT false,
  
  -- Transfer specific fields
  from_partner_id UUID REFERENCES partners(id),
  to_partner_id UUID REFERENCES partners(id),
  from_partner_name TEXT,
  to_partner_name TEXT,
  
  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add similar activity log for activation codes
CREATE TABLE IF NOT EXISTS activation_code_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_code TEXT REFERENCES retail_activation_codes(activation_code) ON DELETE CASCADE,
  code TEXT NOT NULL,                            -- Store the code text for reference
  activity_type TEXT NOT NULL,                   -- created, assigned, unassigned, transferred, used
  
  -- Actor information
  performed_by_partner_id UUID REFERENCES partners(id),
  performed_by_admin BOOLEAN DEFAULT false,
  
  -- Transfer/assignment specific fields
  from_partner_id UUID REFERENCES partners(id),
  to_partner_id UUID REFERENCES partners(id),
  from_partner_name TEXT,
  to_partner_name TEXT,
  
  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_code_id 
  ON referral_code_activity_log(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_type 
  ON referral_code_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_partner 
  ON referral_code_activity_log(performed_by_partner_id) WHERE performed_by_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_created 
  ON referral_code_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_activation_code_activity_code 
  ON activation_code_activity_log(activation_code);
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_type 
  ON activation_code_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_partner 
  ON activation_code_activity_log(performed_by_partner_id) WHERE performed_by_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_created 
  ON activation_code_activity_log(created_at);

-- Note: Partners are linked by having the same contact_email
-- No need for linked_partner_ids column - the email-based linking already exists
-- in the partner login system (same owner = same email = can manage multiple businesses)
