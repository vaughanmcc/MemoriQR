-- Migration: Add edit verification codes table for MFA
-- This enables email-based verification before editing memorials

CREATE TABLE IF NOT EXISTS edit_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID NOT NULL REFERENCES memorial_records(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for fast lookups
    CONSTRAINT unique_active_code UNIQUE (memorial_id, code)
);

-- Index for cleanup queries
CREATE INDEX idx_verification_expires ON edit_verification_codes(expires_at);
CREATE INDEX idx_verification_memorial ON edit_verification_codes(memorial_id);

-- Function to clean up expired codes (can be called by a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM edit_verification_codes 
    WHERE expires_at < NOW() OR used_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE edit_verification_codes ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access verification codes
CREATE POLICY "Service role full access to verification codes"
    ON edit_verification_codes
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
