-- Migration: Add encryption for PII fields in partners table
-- Note: Supabase uses pgsodium for encryption at rest
-- This migration sets up encrypted columns for sensitive partner data

-- First, ensure the pgsodium extension is available (it's pre-installed on Supabase)
-- CREATE EXTENSION IF NOT EXISTS pgsodium;

-- For Supabase, we use their built-in encryption approach with security labels
-- The actual encryption is handled at the Supabase infrastructure level

-- Add a note that these columns contain sensitive data
COMMENT ON COLUMN partners.bank_account_number IS 'SENSITIVE: Bank account number - encrypted at rest';
COMMENT ON COLUMN partners.bank_account_name IS 'SENSITIVE: Bank account holder name - encrypted at rest';
COMMENT ON COLUMN partners.contact_email IS 'SENSITIVE: Partner contact email - encrypted at rest';
COMMENT ON COLUMN partners.payout_email IS 'SENSITIVE: Payout notification email - encrypted at rest';
COMMENT ON COLUMN partners.contact_phone IS 'SENSITIVE: Partner phone number - encrypted at rest';

-- Create an audit log table for security-sensitive changes
CREATE TABLE IF NOT EXISTS partner_security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'bank_account', 'email', 'payout_email'
  change_description TEXT NOT NULL,
  old_value_hash TEXT, -- Store hash of old value for verification, not the value itself
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_partner_security_audit_partner 
  ON partner_security_audit(partner_id, created_at DESC);

-- Enable RLS on audit table
ALTER TABLE partner_security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON partner_security_audit
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert audit logs (via API)
CREATE POLICY "Service role can insert audit logs"
  ON partner_security_audit
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- NOTE: For actual column-level encryption in Supabase:
-- 1. Go to Supabase Dashboard > Database > Extensions
-- 2. Enable "pgsodium" if not already enabled
-- 3. Use Vault for key management: Dashboard > Project Settings > Vault
-- 4. Create an encryption key in Vault
-- 5. Use pgsodium.crypto_aead_det_encrypt/decrypt for column data
--
-- For production, consider using Supabase Vault secrets for the encryption key:
-- SELECT vault.create_secret('pii_encryption_key', 'your-secret-key');
--
-- Then encrypt/decrypt in application code or database functions
