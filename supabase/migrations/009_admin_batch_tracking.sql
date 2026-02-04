-- =====================================================
-- MIGRATION 009: Admin Batch Tracking
-- Adds a simple batch identifier for admin-generated codes
-- =====================================================

-- Add generation_batch_id for admin-generated codes
-- This is separate from batch_id which references partner code_batches
ALTER TABLE retail_activation_codes 
  ADD COLUMN IF NOT EXISTS generation_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS generation_batch_name TEXT;

-- Index for batch queries
CREATE INDEX IF NOT EXISTS idx_retail_codes_generation_batch 
  ON retail_activation_codes(generation_batch_id) 
  WHERE generation_batch_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN retail_activation_codes.generation_batch_id IS 'UUID to group codes generated together by admin';
COMMENT ON COLUMN retail_activation_codes.generation_batch_name IS 'Human-readable batch name (e.g., "10B x 50 - Jan 20")';
