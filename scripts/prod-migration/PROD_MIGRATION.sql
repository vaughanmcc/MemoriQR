-- ============================================================================
-- MEMORIQR PRODUCTION MIGRATION
-- Combined migrations: 012-023 (preview-smoke → main)
-- 
-- Generated: February 3, 2026
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor (PRODUCTION project)
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
-- 5. Verify no errors in output
-- ============================================================================

-- =====================================================
-- MIGRATION 012a: Code Activity Log
-- =====================================================
-- Activity log for referral codes
CREATE TABLE IF NOT EXISTS referral_code_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  performed_by_partner_id UUID REFERENCES partners(id),
  performed_by_admin BOOLEAN DEFAULT false,
  from_partner_id UUID REFERENCES partners(id),
  to_partner_id UUID REFERENCES partners(id),
  from_partner_name TEXT,
  to_partner_name TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activation_code_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_code TEXT REFERENCES retail_activation_codes(activation_code) ON DELETE CASCADE,
  code TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  performed_by_partner_id UUID REFERENCES partners(id),
  performed_by_admin BOOLEAN DEFAULT false,
  from_partner_id UUID REFERENCES partners(id),
  to_partner_id UUID REFERENCES partners(id),
  from_partner_name TEXT,
  to_partner_name TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_code_activity_code_id ON referral_code_activity_log(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_type ON referral_code_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_partner ON referral_code_activity_log(performed_by_partner_id) WHERE performed_by_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_code_activity_created ON referral_code_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_code ON activation_code_activity_log(activation_code);
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_type ON activation_code_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_partner ON activation_code_activity_log(performed_by_partner_id) WHERE performed_by_partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activation_code_activity_created ON activation_code_activity_log(created_at);

-- =====================================================
-- MIGRATION 012b: Partner Status Constraint
-- =====================================================
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_status_check;
ALTER TABLE partners ADD CONSTRAINT partners_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'suspended', 'rejected'));
UPDATE partners SET status = 'active' WHERE status = 'approved';
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_partner_type_check;
ALTER TABLE partners ADD CONSTRAINT partners_partner_type_check 
  CHECK (partner_type IN ('vet', 'funeral_director', 'funeral_home', 'cemetery', 'crematorium', 'pet_cremation', 'pet_store', 'retailer', 'groomer', 'other'));
UPDATE partners SET is_active = false WHERE status = 'pending';

-- =====================================================
-- MIGRATION 013: Partner Suspension Reason
-- =====================================================
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS suspended_reason text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- =====================================================
-- MIGRATION 014: Partner Rejection Reason
-- =====================================================
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS rejected_reason text;

-- =====================================================
-- MIGRATION 015: Partner Trusted Device
-- =====================================================
ALTER TABLE public.partner_sessions ADD COLUMN IF NOT EXISTS is_trusted_device boolean default false;

-- =====================================================
-- MIGRATION 016: Partner Referral Notifications
-- =====================================================
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS notify_referral_redemption boolean DEFAULT true;
COMMENT ON COLUMN public.partners.notify_referral_redemption IS 'Whether partner receives email when a referral code is redeemed';

-- =====================================================
-- MIGRATION 017: PII Encryption Audit
-- =====================================================
COMMENT ON COLUMN partners.bank_account_number IS 'SENSITIVE: Bank account number - encrypted at rest';
COMMENT ON COLUMN partners.bank_account_name IS 'SENSITIVE: Bank account holder name - encrypted at rest';
COMMENT ON COLUMN partners.contact_email IS 'SENSITIVE: Partner contact email - encrypted at rest';
COMMENT ON COLUMN partners.payout_email IS 'SENSITIVE: Payout notification email - encrypted at rest';
COMMENT ON COLUMN partners.contact_phone IS 'SENSITIVE: Partner phone number - encrypted at rest';

CREATE TABLE IF NOT EXISTS partner_security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  change_description TEXT NOT NULL,
  old_value_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_security_audit_partner ON partner_security_audit(partner_id, created_at DESC);
ALTER TABLE partner_security_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON partner_security_audit;
CREATE POLICY "Admins can view all audit logs" ON partner_security_audit FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role can insert audit logs" ON partner_security_audit;
CREATE POLICY "Service role can insert audit logs" ON partner_security_audit FOR INSERT TO service_role WITH CHECK (true);

-- =====================================================
-- MIGRATION 018: Partner Batch Stripe Payment
-- =====================================================
ALTER TABLE code_batches ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE code_batches ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE code_batches ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_code_batches_stripe_session ON code_batches(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
COMMENT ON COLUMN code_batches.stripe_session_id IS 'Stripe Checkout session ID for partner payment';
COMMENT ON COLUMN code_batches.stripe_payment_intent_id IS 'Stripe PaymentIntent ID after successful payment';
COMMENT ON COLUMN code_batches.paid_at IS 'When the partner payment was completed';

-- =====================================================
-- MIGRATION 019: Referral Codes Order FK
-- =====================================================
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
CREATE INDEX IF NOT EXISTS idx_referral_codes_order_id ON referral_codes(order_id);

-- =====================================================
-- MIGRATION 020: Partner Contact Name
-- =====================================================
ALTER TABLE partners ADD COLUMN IF NOT EXISTS contact_name TEXT;
UPDATE partners SET contact_name = substring(partner_name from '\(([^)]+)\)') WHERE contact_name IS NULL AND partner_name LIKE '%(%';
COMMENT ON COLUMN partners.contact_name IS 'Contact person name for emails and communication';

-- =====================================================
-- MIGRATION 021: Referral Code Requests
-- =====================================================
CREATE TABLE IF NOT EXISTS referral_code_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMP,
  processed_by TEXT,
  batch_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_code_requests_partner ON referral_code_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_requests_status ON referral_code_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_referral_code_requests_created ON referral_code_requests(created_at DESC);

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

COMMENT ON TABLE referral_code_requests IS 'Partner requests for additional referral codes';

-- =====================================================
-- MIGRATION 022a: Partner Activity Log
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  performed_by_admin BOOLEAN DEFAULT true,
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_activity_log_partner_id ON partner_activity_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_activity_log_activity_type ON partner_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_partner_activity_log_created_at ON partner_activity_log(created_at DESC);

ALTER TABLE partner_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role access for partner_activity_log" ON partner_activity_log;
CREATE POLICY "Service role access for partner_activity_log" ON partner_activity_log FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE partner_activity_log IS 'Tracks all status changes and activity for partners';

-- =====================================================
-- MIGRATION 022b: Partner Referral Invites
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS referral_code_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_code_shares_code_id ON referral_code_shares(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_shares_partner_id ON referral_code_shares(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_shares_recipient_email ON referral_code_shares(recipient_email);

DROP TRIGGER IF EXISTS update_referral_code_shares_updated_at ON referral_code_shares;
CREATE TRIGGER update_referral_code_shares_updated_at
  BEFORE UPDATE ON referral_code_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE referral_code_shares IS 'Tracks when partners share their referral codes with potential customers via email';

-- =====================================================
-- MIGRATION 023: Memorial Renewal System
-- =====================================================
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS reminder_sent_90_days_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS reminder_sent_30_days_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS reminder_sent_7_days_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS grace_period_reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS data_deletion_scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS renewal_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE memorial_records ADD COLUMN IF NOT EXISTS renewal_token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS memorial_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorial_records(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    renewal_type TEXT NOT NULL CHECK (renewal_type IN ('1_year', '5_year', 'lifetime')),
    years_added INTEGER,
    amount_paid DECIMAL(10,2) NOT NULL,
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    previous_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    new_expires_at TIMESTAMP WITH TIME ZONE,
    was_expired BOOLEAN DEFAULT false,
    was_in_grace_period BOOLEAN DEFAULT false,
    days_remaining INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memorial_renewals_memorial_id ON memorial_renewals(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_renewals_stripe_session ON memorial_renewals(stripe_session_id);

ALTER TABLE memorial_records DROP CONSTRAINT IF EXISTS memorial_records_hosting_duration_check;
ALTER TABLE memorial_records ADD CONSTRAINT memorial_records_hosting_duration_check CHECK (hosting_duration IN (5, 10, 25, 999));

CREATE TABLE IF NOT EXISTS expiry_reminder_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorial_records(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('90_days', '30_days', '7_days', 'grace_period', 'final_warning')),
    sent_to_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pipedream_response TEXT,
    renewal_token TEXT
);

CREATE INDEX IF NOT EXISTS idx_expiry_reminder_log_memorial ON expiry_reminder_log(memorial_id);
CREATE INDEX IF NOT EXISTS idx_expiry_reminder_log_sent_at ON expiry_reminder_log(sent_at);

CREATE TABLE IF NOT EXISTS memorial_deletion_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL,
    memorial_slug TEXT NOT NULL,
    deceased_name TEXT NOT NULL,
    customer_email TEXT,
    hosting_expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deletion_reason TEXT DEFAULT 'expiry',
    photos_count INTEGER DEFAULT 0,
    videos_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memorial_deletion_log_deleted_at ON memorial_deletion_log(deleted_at);

CREATE OR REPLACE FUNCTION get_memorial_status(expires_at TIMESTAMP WITH TIME ZONE, hosting_duration INTEGER)
RETURNS TEXT AS $$
DECLARE
    days_left INTEGER;
    grace_end TIMESTAMP WITH TIME ZONE;
BEGIN
    IF hosting_duration = 999 OR expires_at IS NULL THEN
        RETURN 'lifetime';
    END IF;
    days_left := EXTRACT(DAY FROM (expires_at - NOW()));
    grace_end := expires_at + INTERVAL '30 days';
    IF NOW() < expires_at THEN
        IF days_left <= 7 THEN
            RETURN 'expiring_soon';
        ELSE
            RETURN 'active';
        END IF;
    ELSIF NOW() < grace_end THEN
        RETURN 'grace_period';
    ELSE
        RETURN 'expired';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION days_until_deletion(expires_at TIMESTAMP WITH TIME ZONE, hosting_duration INTEGER)
RETURNS INTEGER AS $$
DECLARE
    deletion_date TIMESTAMP WITH TIME ZONE;
BEGIN
    IF hosting_duration = 999 OR expires_at IS NULL THEN
        RETURN NULL;
    END IF;
    deletion_date := expires_at + INTERVAL '44 days';
    RETURN EXTRACT(DAY FROM (deletion_date - NOW()));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW memorials_needing_reminders AS
SELECT 
    mr.id,
    mr.memorial_slug,
    mr.deceased_name,
    mr.hosting_expires_at,
    mr.hosting_duration,
    mr.renewal_token,
    c.email as customer_email,
    c.full_name as customer_name,
    EXTRACT(DAY FROM (mr.hosting_expires_at - NOW())) as days_until_expiry,
    get_memorial_status(mr.hosting_expires_at, mr.hosting_duration) as status,
    CASE WHEN mr.reminder_sent_90_days_at IS NULL AND mr.hosting_expires_at - INTERVAL '90 days' <= NOW() AND mr.hosting_expires_at - INTERVAL '91 days' > NOW() THEN true ELSE false END as needs_90_day_reminder,
    CASE WHEN mr.reminder_sent_30_days_at IS NULL AND mr.hosting_expires_at - INTERVAL '30 days' <= NOW() AND mr.hosting_expires_at - INTERVAL '31 days' > NOW() THEN true ELSE false END as needs_30_day_reminder,
    CASE WHEN mr.reminder_sent_7_days_at IS NULL AND mr.hosting_expires_at - INTERVAL '7 days' <= NOW() AND mr.hosting_expires_at - INTERVAL '8 days' > NOW() THEN true ELSE false END as needs_7_day_reminder,
    CASE WHEN mr.grace_period_reminder_sent_at IS NULL AND NOW() > mr.hosting_expires_at AND NOW() < mr.hosting_expires_at + INTERVAL '30 days' THEN true ELSE false END as needs_grace_period_reminder
FROM memorial_records mr
LEFT JOIN customers c ON mr.customer_id = c.id
WHERE mr.hosting_duration != 999 AND mr.is_published = true AND c.email IS NOT NULL;

CREATE OR REPLACE VIEW memorials_ready_for_deletion AS
SELECT 
    mr.id,
    mr.memorial_slug,
    mr.deceased_name,
    mr.hosting_expires_at,
    mr.photos_json,
    mr.videos_json,
    c.email as customer_email
FROM memorial_records mr
LEFT JOIN customers c ON mr.customer_id = c.id
WHERE mr.hosting_duration != 999 AND mr.hosting_expires_at + INTERVAL '44 days' < NOW();

CREATE OR REPLACE FUNCTION rotate_renewal_token(memorial_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
BEGIN
    new_token := encode(gen_random_bytes(32), 'hex');
    UPDATE memorial_records
    SET renewal_token = new_token, renewal_token_expires_at = NOW() + INTERVAL '7 days'
    WHERE id = memorial_uuid;
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

UPDATE memorial_records SET renewal_token = encode(gen_random_bytes(32), 'hex'), renewal_token_expires_at = NOW() + INTERVAL '90 days' WHERE renewal_token IS NULL;

COMMENT ON TABLE memorial_renewals IS 'Tracks all hosting extension payments and the dates they modified';
COMMENT ON TABLE expiry_reminder_log IS 'Audit log of all reminder emails sent to customers';
COMMENT ON TABLE memorial_deletion_log IS 'Record of deleted memorials for compliance/auditing';
COMMENT ON VIEW memorials_needing_reminders IS 'Used by cron job to find memorials that need reminder emails';
COMMENT ON VIEW memorials_ready_for_deletion IS 'Used by cleanup cron to find memorials past 44-day post-expiry window';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
SELECT 'Migration completed successfully!' as result;
