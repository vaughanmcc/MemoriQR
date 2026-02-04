-- Add Stripe payment fields to code_batches for partner code purchases
-- Partners pay upfront via Stripe before codes are generated

ALTER TABLE code_batches
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add index for looking up batches by Stripe session
CREATE INDEX IF NOT EXISTS idx_code_batches_stripe_session 
  ON code_batches(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- Comment for clarity
COMMENT ON COLUMN code_batches.stripe_session_id IS 'Stripe Checkout session ID for partner payment';
COMMENT ON COLUMN code_batches.stripe_payment_intent_id IS 'Stripe PaymentIntent ID after successful payment';
COMMENT ON COLUMN code_batches.paid_at IS 'When the partner payment was completed';
