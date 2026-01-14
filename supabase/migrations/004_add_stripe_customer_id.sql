-- Add stripe_customer_id column to customers table
-- This stores the Stripe Customer ID for prefilling shipping address at checkout

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id 
ON customers(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN customers.stripe_customer_id IS 'Stripe Customer ID for payment processing';
