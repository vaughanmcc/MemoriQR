-- PetLegacy Schema Creation
-- Creates a separate schema for PetLegacy within the same Supabase instance
-- Run this in the Supabase SQL Editor BEFORE running other migrations

-- =====================================================
-- CREATE PETLEGACY SCHEMA
-- =====================================================
CREATE SCHEMA IF NOT EXISTS petlegacy;

-- Grant usage to authenticated and anon roles
GRANT USAGE ON SCHEMA petlegacy TO authenticated;
GRANT USAGE ON SCHEMA petlegacy TO anon;
GRANT USAGE ON SCHEMA petlegacy TO service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA petlegacy
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA petlegacy
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA petlegacy
GRANT ALL ON TABLES TO service_role;

-- =====================================================
-- ENABLE RLS ON SCHEMA (set at table level)
-- =====================================================

-- Note: RLS policies will be created per-table in subsequent migrations
-- This migration just creates the schema container

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE petlegacy.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id TEXT
);

-- =====================================================
-- PARTNERS TABLE (Vets, Crematoriums, Pet Stores)
-- =====================================================
CREATE TABLE petlegacy.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    contact_name TEXT,
    partner_type TEXT CHECK (partner_type IN ('vet', 'crematorium', 'pet_store', 'breeder', 'shelter', 'other')),
    contact_email TEXT UNIQUE,
    contact_phone TEXT,
    address JSONB,
    
    -- Partner referral attribution
    partner_code TEXT UNIQUE NOT NULL, -- e.g., "HAPPYPAWS123"
    referral_qr_url TEXT, -- Full URL: petlegacy.co.nz/r/HAPPYPAWS123
    
    -- Commission tracking
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    total_referrals INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0.00,
    pending_commission DECIMAL(10,2) DEFAULT 0.00,
    
    -- Payout info
    bank_account_name TEXT,
    bank_account_number TEXT,
    last_payout_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'rejected')),
    rejection_reason TEXT,
    suspension_reason TEXT,
    
    -- Auth
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTNER REFERRALS TABLE (Attribution tracking)
-- =====================================================
CREATE TABLE petlegacy.partner_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES petlegacy.partners(id) ON DELETE SET NULL,
    partner_code TEXT NOT NULL,
    
    -- Session tracking
    session_id TEXT UNIQUE NOT NULL,
    referral_url TEXT,
    landing_page TEXT,
    
    -- Attribution window
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Conversion
    converted BOOLEAN DEFAULT false,
    converted_at TIMESTAMP WITH TIME ZONE,
    order_id UUID,
    commission_amount DECIMAL(10,2)
);

-- Index for quick partner code lookups
CREATE INDEX idx_partner_referrals_code ON petlegacy.partner_referrals(partner_code);
CREATE INDEX idx_partner_referrals_session ON petlegacy.partner_referrals(session_id);

-- =====================================================
-- PET MEMORIALS TABLE (Simplified - no QR/NFC provisioning)
-- =====================================================
CREATE TABLE petlegacy.memorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES petlegacy.customers(id) ON DELETE SET NULL,
    
    -- Memorial content
    memorial_slug TEXT UNIQUE NOT NULL,
    pet_name TEXT NOT NULL,
    species TEXT, -- dog, cat, bird, rabbit, horse, etc.
    breed TEXT,
    birth_date DATE,
    death_date DATE,
    memorial_text TEXT,
    
    -- Media
    photos_json JSONB DEFAULT '[]'::jsonb,
    videos_json JSONB DEFAULT '[]'::jsonb,
    profile_photo_url TEXT,
    
    -- Display
    theme TEXT DEFAULT 'classic',
    frame TEXT DEFAULT 'circle',
    is_published BOOLEAN DEFAULT false,
    
    -- Hosting
    hosting_duration INTEGER NOT NULL CHECK (hosting_duration IN (5, 10, 25, 99)), -- 99 = lifetime
    hosting_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewal_status TEXT DEFAULT 'active' CHECK (renewal_status IN ('active', 'expiring_soon', 'expired', 'renewed')),
    
    -- Analytics
    views_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX idx_memorials_slug ON petlegacy.memorials(memorial_slug);

-- =====================================================
-- ORDERS TABLE (Simplified - digital only, no physical products)
-- =====================================================
CREATE TABLE petlegacy.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES petlegacy.customers(id) ON DELETE SET NULL,
    memorial_id UUID REFERENCES petlegacy.memorials(id) ON DELETE SET NULL,
    
    -- Order details
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT DEFAULT 'direct' CHECK (order_type IN ('direct', 'partner_referral')),
    
    -- Product
    product_type TEXT DEFAULT 'digital_memorial',
    hosting_duration INTEGER CHECK (hosting_duration IN (5, 10, 25, 99)),
    
    -- Pricing
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NZD',
    
    -- Partner attribution
    partner_id UUID REFERENCES petlegacy.partners(id) ON DELETE SET NULL,
    partner_code TEXT,
    commission_amount DECIMAL(10,2),
    commission_paid BOOLEAN DEFAULT false,
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    
    -- Status
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for order lookups
CREATE INDEX idx_orders_number ON petlegacy.orders(order_number);
CREATE INDEX idx_orders_partner ON petlegacy.orders(partner_id);

-- =====================================================
-- RENEWALS TABLE
-- =====================================================
CREATE TABLE petlegacy.renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memorial_id UUID REFERENCES petlegacy.memorials(id) ON DELETE CASCADE,
    
    -- Renewal details
    previous_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    new_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    renewal_duration INTEGER NOT NULL CHECK (renewal_duration IN (5, 10, 25)),
    
    -- Payment
    amount DECIMAL(10,2) NOT NULL,
    stripe_payment_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE petlegacy.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memorial_id UUID REFERENCES petlegacy.memorials(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'created', 'viewed', 'updated', 'published', 
        'renewal_reminder', 'expired', 'renewed'
    )),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE petlegacy.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTNER PAYOUTS TABLE
-- =====================================================
CREATE TABLE petlegacy.partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES petlegacy.partners(id) ON DELETE CASCADE,
    
    -- Payout details
    amount DECIMAL(10,2) NOT NULL,
    orders_included UUID[] NOT NULL,
    
    -- Payment method
    payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'stripe')),
    payment_reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PRICING TABLE
-- =====================================================
CREATE TABLE petlegacy.pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hosting_duration INTEGER NOT NULL CHECK (hosting_duration IN (5, 10, 25, 99)),
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NZD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial pricing
INSERT INTO petlegacy.pricing (hosting_duration, price, currency) VALUES
(5, 49.00, 'NZD'),
(10, 79.00, 'NZD'),
(25, 129.00, 'NZD'),
(99, 199.00, 'NZD'); -- Lifetime

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE petlegacy.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.partner_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE petlegacy.pricing ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BASIC RLS POLICIES (Service role bypass)
-- =====================================================
-- Allow service_role full access (for API routes)
CREATE POLICY "Service role full access" ON petlegacy.customers FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.partners FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.partner_referrals FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.memorials FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.orders FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.renewals FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.activity_log FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.contact_submissions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.partner_payouts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access" ON petlegacy.pricing FOR ALL TO service_role USING (true);

-- Public read access for published memorials
CREATE POLICY "Public can view published memorials" ON petlegacy.memorials 
    FOR SELECT TO anon 
    USING (is_published = true);

-- Public read access for pricing
CREATE POLICY "Public can view pricing" ON petlegacy.pricing 
    FOR SELECT TO anon 
    USING (is_active = true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate unique partner code
CREATE OR REPLACE FUNCTION petlegacy.generate_partner_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION petlegacy.generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'PL-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
           lpad(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate memorial slug
CREATE OR REPLACE FUNCTION petlegacy.generate_memorial_slug(pet_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Clean the name
    base_slug := lower(regexp_replace(pet_name, '[^a-zA-Z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Add year
    base_slug := base_slug || '-' || to_char(NOW(), 'YYYY');
    
    -- Check for uniqueness
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM petlegacy.memorials WHERE memorial_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE
-- =====================================================
-- PetLegacy schema is ready!
-- 
-- Key differences from MemoriQR:
-- 1. No QR/NFC provisioning tables
-- 2. No activation codes
-- 3. Partner attribution via referral codes instead
-- 4. Simplified order flow (digital only)
-- 5. Pet-focused (no human memorials)
-- 6. Lifetime hosting option (99 years)
