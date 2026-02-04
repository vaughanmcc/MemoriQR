-- Migration: Update partner constraints
-- 1. Status constraint to allow active/suspended
-- 2. Partner type constraint to allow all business types

-- Drop the existing status constraint if it exists
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_status_check;

-- Add the updated status constraint with all needed statuses
ALTER TABLE partners ADD CONSTRAINT partners_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'suspended', 'rejected'));

-- Update any 'approved' status to 'active' for consistency
UPDATE partners SET status = 'active' WHERE status = 'approved';

-- Drop existing partner_type constraint and add expanded one
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_partner_type_check;
ALTER TABLE partners ADD CONSTRAINT partners_partner_type_check 
  CHECK (partner_type IN ('vet', 'funeral_director', 'funeral_home', 'cemetery', 'crematorium', 'pet_cremation', 'pet_store', 'retailer', 'groomer', 'other'));

-- Ensure pending partners have is_active = false
UPDATE partners SET is_active = false WHERE status = 'pending';
