-- Memorial Renewal System Migration
-- Adds support for expiry reminders, grace periods, and scheduled data cleanup

-- =====================================================
-- ADD REMINDER TRACKING COLUMNS
-- =====================================================
-- Track when each reminder email was sent
ALTER TABLE memorial_records
ADD COLUMN IF NOT EXISTS reminder_sent_90_days_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent_30_days_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent_7_days_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS grace_period_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- ADD RENEWAL TOKEN FOR SECURE ONE-CLICK RENEWAL
-- =====================================================
-- Signed token for email links - rotated on each use
ALTER TABLE memorial_records
ADD COLUMN IF NOT EXISTS renewal_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
ADD COLUMN IF NOT EXISTS renewal_token_expires_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- MEMORIAL RENEWALS TABLE
-- Track all renewal/extension transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS memorial_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorial_records(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Renewal details
    renewal_type TEXT NOT NULL CHECK (renewal_type IN ('1_year', '5_year', 'lifetime')),
    years_added INTEGER, -- NULL for lifetime
    amount_paid DECIMAL(10,2) NOT NULL,
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    
    -- Before/after dates
    previous_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    new_expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime
    
    -- State at time of renewal
    was_expired BOOLEAN DEFAULT false,
    was_in_grace_period BOOLEAN DEFAULT false,
    days_remaining INTEGER, -- Negative if expired
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for looking up renewals by memorial
CREATE INDEX IF NOT EXISTS idx_memorial_renewals_memorial_id ON memorial_renewals(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_renewals_stripe_session ON memorial_renewals(stripe_session_id);

-- =====================================================
-- UPDATE HOSTING DURATION CHECK CONSTRAINT
-- =====================================================
-- Remove old constraint and add new one that includes lifetime (999)
ALTER TABLE memorial_records 
DROP CONSTRAINT IF EXISTS memorial_records_hosting_duration_check;

ALTER TABLE memorial_records 
ADD CONSTRAINT memorial_records_hosting_duration_check 
CHECK (hosting_duration IN (5, 10, 25, 999));

-- =====================================================
-- EXPIRY REMINDER LOG TABLE
-- Track all reminder emails sent (for auditing)
-- =====================================================
CREATE TABLE IF NOT EXISTS expiry_reminder_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorial_records(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('90_days', '30_days', '7_days', 'grace_period', 'final_warning')),
    sent_to_email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pipedream_response TEXT, -- For debugging
    renewal_token TEXT -- Token included in the email
);

CREATE INDEX IF NOT EXISTS idx_expiry_reminder_log_memorial ON expiry_reminder_log(memorial_id);
CREATE INDEX IF NOT EXISTS idx_expiry_reminder_log_sent_at ON expiry_reminder_log(sent_at);

-- =====================================================
-- DATA DELETION LOG TABLE  
-- Track memorials that have been cleaned up
-- =====================================================
CREATE TABLE IF NOT EXISTS memorial_deletion_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL, -- Don't FK since record will be deleted
    memorial_slug TEXT NOT NULL,
    deceased_name TEXT NOT NULL,
    customer_email TEXT,
    hosting_expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deletion_reason TEXT DEFAULT 'expiry',
    -- Store some metadata for auditing
    photos_count INTEGER DEFAULT 0,
    videos_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memorial_deletion_log_deleted_at ON memorial_deletion_log(deleted_at);

-- =====================================================
-- HELPER FUNCTION: Check memorial expiry status
-- Returns: 'active', 'expiring_soon', 'grace_period', 'expired', 'lifetime'
-- =====================================================
CREATE OR REPLACE FUNCTION get_memorial_status(expires_at TIMESTAMP WITH TIME ZONE, hosting_duration INTEGER)
RETURNS TEXT AS $$
DECLARE
    days_left INTEGER;
    grace_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Lifetime memorials never expire
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

-- =====================================================
-- HELPER FUNCTION: Days until data deletion
-- Returns NULL for lifetime, negative if already deleted
-- =====================================================
CREATE OR REPLACE FUNCTION days_until_deletion(expires_at TIMESTAMP WITH TIME ZONE, hosting_duration INTEGER)
RETURNS INTEGER AS $$
DECLARE
    deletion_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Lifetime memorials never get deleted
    IF hosting_duration = 999 OR expires_at IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Deletion happens 44 days after expiry (30 day grace + 14 day preservation)
    deletion_date := expires_at + INTERVAL '44 days';
    
    RETURN EXTRACT(DAY FROM (deletion_date - NOW()));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW: Memorials needing reminders
-- Used by the cron job to find memorials to email
-- =====================================================
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
    -- Which reminders are due
    CASE 
        WHEN mr.reminder_sent_90_days_at IS NULL 
             AND mr.hosting_expires_at - INTERVAL '90 days' <= NOW()
             AND mr.hosting_expires_at - INTERVAL '91 days' > NOW()
        THEN true ELSE false 
    END as needs_90_day_reminder,
    CASE 
        WHEN mr.reminder_sent_30_days_at IS NULL 
             AND mr.hosting_expires_at - INTERVAL '30 days' <= NOW()
             AND mr.hosting_expires_at - INTERVAL '31 days' > NOW()
        THEN true ELSE false 
    END as needs_30_day_reminder,
    CASE 
        WHEN mr.reminder_sent_7_days_at IS NULL 
             AND mr.hosting_expires_at - INTERVAL '7 days' <= NOW()
             AND mr.hosting_expires_at - INTERVAL '8 days' > NOW()
        THEN true ELSE false 
    END as needs_7_day_reminder,
    CASE 
        WHEN mr.grace_period_reminder_sent_at IS NULL 
             AND NOW() > mr.hosting_expires_at
             AND NOW() < mr.hosting_expires_at + INTERVAL '30 days'
        THEN true ELSE false 
    END as needs_grace_period_reminder
FROM memorial_records mr
LEFT JOIN customers c ON mr.customer_id = c.id
WHERE mr.hosting_duration != 999  -- Exclude lifetime
  AND mr.is_published = true
  AND c.email IS NOT NULL;

-- =====================================================
-- VIEW: Memorials ready for deletion
-- Grace period (30 days) + preservation period (14 days) expired
-- =====================================================
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
WHERE mr.hosting_duration != 999  -- Exclude lifetime
  AND mr.hosting_expires_at + INTERVAL '44 days' < NOW();

-- =====================================================
-- FUNCTION: Generate new renewal token
-- =====================================================
CREATE OR REPLACE FUNCTION rotate_renewal_token(memorial_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
BEGIN
    new_token := encode(gen_random_bytes(32), 'hex');
    
    UPDATE memorial_records
    SET renewal_token = new_token,
        renewal_token_expires_at = NOW() + INTERVAL '7 days'
    WHERE id = memorial_uuid;
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Generate tokens for existing memorials
-- =====================================================
UPDATE memorial_records
SET renewal_token = encode(gen_random_bytes(32), 'hex'),
    renewal_token_expires_at = NOW() + INTERVAL '90 days'
WHERE renewal_token IS NULL;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE memorial_renewals IS 'Tracks all hosting extension payments and the dates they modified';
COMMENT ON TABLE expiry_reminder_log IS 'Audit log of all reminder emails sent to customers';
COMMENT ON TABLE memorial_deletion_log IS 'Record of deleted memorials for compliance/auditing';
COMMENT ON VIEW memorials_needing_reminders IS 'Used by cron job to find memorials that need reminder emails';
COMMENT ON VIEW memorials_ready_for_deletion IS 'Used by cleanup cron to find memorials past 44-day post-expiry window';
