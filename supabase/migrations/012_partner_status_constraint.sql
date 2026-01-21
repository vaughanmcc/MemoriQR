-- Migration: Update partner status constraint to allow active/suspended
-- The original migration 007 only allowed: pending, approved, rejected
-- We need: pending, active, suspended, rejected

-- Drop the existing constraint if it exists
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_status_check;

-- Add the updated constraint with all needed statuses
ALTER TABLE partners ADD CONSTRAINT partners_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'suspended', 'rejected'));

-- Update any 'approved' status to 'active' for consistency
UPDATE partners SET status = 'active' WHERE status = 'approved';
