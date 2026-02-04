-- Migration: Add NFC tags to inventory product types
-- Allows tracking NFC tag stock alongside QR plates
-- Also removes 'plates' since qr_tags is the correct key for QR Plates

-- Migrate any existing 'plates' entries to 'qr_tags'
UPDATE inventory SET product_type = 'qr_tags' WHERE product_type = 'plates';

-- Update the product_type constraint to include nfc_tags and use correct types
ALTER TABLE inventory 
  DROP CONSTRAINT IF EXISTS inventory_product_type_check;

ALTER TABLE inventory 
  ADD CONSTRAINT inventory_product_type_check 
  CHECK (product_type IN ('qr_tags', 'nfc_tags', 'frames', 'packaging', 'other'));
