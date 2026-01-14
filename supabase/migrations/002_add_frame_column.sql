-- Add frame column to memorial_records
-- This allows users to select a decorative frame style for their photos

ALTER TABLE memorial_records
ADD COLUMN IF NOT EXISTS frame TEXT DEFAULT 'classic-gold';

-- Add edit_token for allowing memorial edits without authentication
-- Using gen_random_uuid() which is built into PostgreSQL 13+
ALTER TABLE memorial_records
ADD COLUMN IF NOT EXISTS edit_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Index for edit token lookups
CREATE INDEX IF NOT EXISTS idx_memorial_edit_token ON memorial_records(edit_token);
