-- Add contact_name column to partners table
-- This stores the contact person's name separately from the business name
-- Previously it was embedded in partner_name as "BusinessName (ContactName)"

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Backfill contact_name from partner_name for existing records
-- Extract the name between parentheses: "BusinessName (ContactName)" -> "ContactName"
UPDATE partners
SET contact_name = substring(partner_name from '\(([^)]+)\)')
WHERE contact_name IS NULL 
  AND partner_name LIKE '%(%';

COMMENT ON COLUMN partners.contact_name IS 'Contact person name for emails and communication';
