-- Migration: Add NFC tags to inventory product types
-- Allows tracking NFC tag stock alongside QR tags

-- Update the product_type constraint to include nfc_tags
ALTER TABLE inventory 
  DROP CONSTRAINT IF EXISTS inventory_product_type_check;

ALTER TABLE inventory 
  ADD CONSTRAINT inventory_product_type_check 
  CHECK (product_type IN ('qr_tags', 'nfc_tags', 'plates', 'frames', 'packaging', 'other'));
