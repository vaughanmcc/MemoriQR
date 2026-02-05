-- Migration: Add fulfillment tracking columns to orders
-- Track when NFC is programmed and QR plate is printed

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS nfc_programmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_printed_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.nfc_programmed_at IS 'When the NFC tag was programmed for this order';
COMMENT ON COLUMN orders.qr_printed_at IS 'When the QR plate was printed for this order';
