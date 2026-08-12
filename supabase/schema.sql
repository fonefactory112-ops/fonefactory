-- ============================================================
-- FoneFactory Database Schema
-- Run this in the Supabase SQL Editor (in order)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Admin Profiles
-- ============================================================
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    approval_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create admin profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_admin_user();

-- ============================================================
-- 2. Shop Settings (singleton row)
-- ============================================================
CREATE TABLE shop_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    shop_name TEXT NOT NULL DEFAULT 'Fone Factory',
    about_description TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    working_hours TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    founder_name TEXT DEFAULT '',
    founder_description TEXT DEFAULT '',
    founder_photo_url TEXT DEFAULT '',
    footer_text TEXT NOT NULL DEFAULT 'Farhaan Pvt Presents',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Service Categories
-- ============================================================
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. Services
-- ============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_active ON services(is_active);

-- ============================================================
-- 5. Accessory Categories
-- ============================================================
CREATE TABLE accessory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. Accessories
-- ============================================================
CREATE TABLE accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES accessory_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    availability BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accessories_category ON accessories(category_id);
CREATE INDEX idx_accessories_active ON accessories(is_active);

-- ============================================================
-- 7. Enquiries (unified for service & accessory)
-- ============================================================
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('service', 'accessory')),
    reference_id UUID NOT NULL,
    reference_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'verified'
        CHECK (verification_status IN ('verified', 'unverified')),
    enquiry_status TEXT NOT NULL DEFAULT 'new'
        CHECK (enquiry_status IN ('new', 'contacted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiries_type ON enquiries(type);
CREATE INDEX idx_enquiries_status ON enquiries(enquiry_status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);

-- ============================================================
-- Auto-update updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at
    BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessory_categories_updated_at
    BEFORE UPDATE ON accessory_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessories_updated_at
    BEFORE UPDATE ON accessories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
    BEFORE UPDATE ON enquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
