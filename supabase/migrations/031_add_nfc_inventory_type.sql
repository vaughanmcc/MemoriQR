-- Migration: Add NFC tags to inventory product types
-- Allows tracking NFC tag stock alongside QR tags
-- Also removes 'plates' since qr_tags are the same product

-- Update the product_type constraint to include nfc_tags and remove plates
ALTER TABLE inventory 
  DROP CONSTRAINT IF EXISTS inventory_product_type_check;

ALTER TABLE inventory 
  ADD CONSTRAINT inventory_product_type_check 
  CHECK (product_type IN ('qr_tags', 'nfc_tags', 'frames', 'packaging', 'other'));
