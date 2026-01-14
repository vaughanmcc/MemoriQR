-- Add contact_email column to memorial_records for retail activations
-- Online orders get email from customer_profiles via customer_id
-- Retail activations need direct email storage

ALTER TABLE memorial_records
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add index for contact_email lookups
CREATE INDEX IF NOT EXISTS idx_memorial_records_contact_email 
ON memorial_records(contact_email) 
WHERE contact_email IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN memorial_records.contact_email IS 'Contact email for retail activations (when no customer_id exists)';
