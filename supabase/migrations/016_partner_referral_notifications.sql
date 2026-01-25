-- Add notification preference for referral code redemptions
-- Default is true (partners receive notifications by default)
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS notify_referral_redemption boolean DEFAULT true;

COMMENT ON COLUMN public.partners.notify_referral_redemption IS 'Whether partner receives email when a referral code is redeemed';
