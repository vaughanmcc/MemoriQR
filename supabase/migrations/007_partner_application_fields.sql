-- Migration: Add partner application fields
-- Adds columns needed for self-service partner applications

-- Add new columns to partners table for applications
ALTER TABLE partners 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS application_message TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN partners.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN partners.website IS 'Partner business website URL';
COMMENT ON COLUMN partners.application_message IS 'Message submitted with partner application';
COMMENT ON COLUMN partners.approved_at IS 'Timestamp when partner was approved';
COMMENT ON COLUMN partners.rejected_at IS 'Timestamp when partner was rejected';
