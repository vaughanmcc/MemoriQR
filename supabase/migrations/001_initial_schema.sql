-- MemoriQR Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_type TEXT CHECK (customer_type IN ('direct', 'retail')) DEFAULT 'direct'
);

-- =====================================================
-- PARTNERS TABLE (Vets, Crematoriums, Funeral Homes)
-- =====================================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_name TEXT NOT NULL,
    partner_type TEXT CHECK (partner_type IN ('vet', 'crematorium', 'funeral_home', 'pet_store')),
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    commission_rate DECIMAL(5,2) DEFAULT 20.00,
    api_key TEXT UNIQUE DEFAULT uuid_generate_v4()::text,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEMORIAL RECORDS TABLE
-- =====================================================
CREATE TABLE memorial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    memorial_slug TEXT UNIQUE NOT NULL,
    deceased_name TEXT NOT NULL,
    deceased_type TEXT CHECK (deceased_type IN ('pet', 'human')) DEFAULT 'pet',
    species TEXT, -- For pets: dog, cat, bird, etc.
    birth_date DATE,
    death_date DATE,
    memorial_text TEXT,
    photos_json JSONB DEFAULT '[]'::jsonb,
    videos_json JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    hosting_duration INTEGER NOT NULL CHECK (hosting_duration IN (5, 10, 25)),
    product_type TEXT NOT NULL CHECK (product_type IN ('nfc_only', 'qr_only', 'both')),
    base_price DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    hosting_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewal_status TEXT DEFAULT 'active' CHECK (renewal_status IN ('active', 'expired', 'renewed')),
    views_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,
    theme TEXT DEFAULT 'classic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated columns for expiry tracking
ALTER TABLE memorial_records ADD COLUMN is_hosting_active BOOLEAN 
    GENERATED ALWAYS AS (NOW() < hosting_expires_at) STORED;

ALTER TABLE memorial_records ADD COLUMN days_until_expiry INTEGER 
    GENERATED ALWAYS AS (EXTRACT(DAY FROM (hosting_expires_at - NOW()))::INTEGER) STORED;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    memorial_id UUID REFERENCES memorial_records(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT CHECK (order_type IN ('online', 'retail_activation')) DEFAULT 'online',
    product_type TEXT CHECK (product_type IN ('nfc_only', 'qr_only', 'both')),
    hosting_duration INTEGER CHECK (hosting_duration IN (5, 10, 25)),
    total_amount DECIMAL(10,2),
    stripe_payment_id TEXT,
    stripe_session_id TEXT,
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    engraving_text TEXT,
    qr_code_url TEXT,
    nfc_tag_id TEXT,
    tracking_number TEXT,
    shipping_carrier TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- RETAIL ACTIVATION CODES TABLE
-- =====================================================
CREATE TABLE retail_activation_codes (
    activation_code TEXT PRIMARY KEY,
    memorial_id UUID REFERENCES memorial_records(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    product_type TEXT CHECK (product_type IN ('nfc_only', 'qr_only', 'both')),
    hosting_duration INTEGER CHECK (hosting_duration IN (5, 10, 25)),
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SUPPLIER ORDERS TABLE
-- =====================================================
CREATE TABLE supplier_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    supplier_name TEXT CHECK (supplier_name IN ('Metal Image NZ', 'Seritag', 'Other')),
    order_details JSONB,
    supplier_status TEXT DEFAULT 'pending' CHECK (supplier_status IN ('pending', 'sent', 'in_production', 'shipped', 'received')),
    cost DECIMAL(10,2),
    supplier_order_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memorial_id UUID REFERENCES memorial_records(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'viewed', 'updated', 'renewal_reminder', 'expired', 'renewed', 'published')),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICING HISTORY TABLE
-- =====================================================
CREATE TABLE pricing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hosting_duration INTEGER NOT NULL CHECK (hosting_duration IN (5, 10, 25)),
    product_type TEXT NOT NULL CHECK (product_type IN ('nfc_only', 'qr_only', 'both')),
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NZD',
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CURRENT PRICING VIEW
-- =====================================================
CREATE VIEW current_pricing AS
SELECT DISTINCT ON (hosting_duration, product_type)
    hosting_duration,
    product_type,
    price,
    currency
FROM pricing_history
WHERE effective_from <= NOW()
  AND (effective_to IS NULL OR effective_to > NOW())
ORDER BY hosting_duration, product_type, effective_from DESC;

-- =====================================================
-- INSERT INITIAL PRICING (January 2026)
-- =====================================================
INSERT INTO pricing_history (hosting_duration, product_type, price, currency) VALUES
-- 5-Year Plans
(5, 'nfc_only', 99.00, 'NZD'),
(5, 'qr_only', 149.00, 'NZD'),
(5, 'both', 199.00, 'NZD'),
-- 10-Year Plans
(10, 'nfc_only', 149.00, 'NZD'),
(10, 'qr_only', 199.00, 'NZD'),
(10, 'both', 249.00, 'NZD'),
-- 25-Year Plans
(25, 'nfc_only', 199.00, 'NZD'),
(25, 'qr_only', 279.00, 'NZD'),
(25, 'both', 349.00, 'NZD');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_memorial_slug ON memorial_records(memorial_slug);
CREATE INDEX idx_memorial_customer ON memorial_records(customer_id);
CREATE INDEX idx_memorial_expiry ON memorial_records(hosting_expires_at);
CREATE INDEX idx_memorial_published ON memorial_records(is_published);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_activity_memorial ON activity_log(memorial_id);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activation_partner ON retail_activation_codes(partner_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- Public can view published memorials
CREATE POLICY "Public can view published memorials"
    ON memorial_records FOR SELECT
    USING (is_published = true AND is_hosting_active = true);

-- Public can view current pricing
CREATE POLICY "Public can view pricing"
    ON pricing_history FOR SELECT
    USING (effective_from <= NOW() AND (effective_to IS NULL OR effective_to > NOW()));

-- Service role has full access (for API operations)
CREATE POLICY "Service role full access to customers"
    ON customers FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to memorials"
    ON memorial_records FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to orders"
    ON orders FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to partners"
    ON partners FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to activation codes"
    ON retail_activation_codes FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to supplier orders"
    ON supplier_orders FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to activity log"
    ON activity_log FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate unique memorial slug
CREATE OR REPLACE FUNCTION generate_memorial_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from name
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := base_slug || '-' || to_char(NOW(), 'YYYY');
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM memorial_records WHERE memorial_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate activation code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    -- Generate 8-character alphanumeric code
    code := upper(substr(md5(random()::text), 1, 8));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM retail_activation_codes WHERE activation_code = code) LOOP
        code := upper(substr(md5(random()::text), 1, 8));
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MQR-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- Function to update memorial timestamp
CREATE OR REPLACE FUNCTION update_memorial_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER memorial_updated_at
    BEFORE UPDATE ON memorial_records
    FOR EACH ROW
    EXECUTE FUNCTION update_memorial_timestamp();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_memorial_views(slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE memorial_records 
    SET views_count = views_count + 1,
        last_viewed = NOW()
    WHERE memorial_slug = slug;
END;
$$ LANGUAGE plpgsql;
