-- Migration: Update inventory product types
-- Use 'qr' for QR Plates, 'nfc' for NFC Tags

-- Migrate any existing entries to new keys
UPDATE inventory SET product_type = 'qr' WHERE product_type IN ('qr_tags', 'plates');
UPDATE inventory SET product_type = 'nfc' WHERE product_type = 'nfc_tags';
DELETE FROM inventory WHERE product_type = 'frames';

-- Update the product_type constraint
ALTER TABLE inventory 
  DROP CONSTRAINT IF EXISTS inventory_product_type_check;

ALTER TABLE inventory 
  ADD CONSTRAINT inventory_product_type_check 
  CHECK (product_type IN ('qr', 'nfc', 'packaging', 'other'));
