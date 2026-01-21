-- Migration: Add expected sales columns to partners table
-- For partner application form

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS expected_qr_sales TEXT,
ADD COLUMN IF NOT EXISTS expected_nfc_sales TEXT;

COMMENT ON COLUMN partners.expected_qr_sales IS 'Expected monthly QR plate sales from application form';
COMMENT ON COLUMN partners.expected_nfc_sales IS 'Expected monthly NFC tag sales from application form';
