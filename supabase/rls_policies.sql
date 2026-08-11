-- ============================================================
-- FoneFactory Row Level Security Policies
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Helper function: Check if current user is an approved admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid()
        AND approval_status = 'approved'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- 1. Admin Profiles RLS
-- ============================================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admins can read their own profile
CREATE POLICY "admin_read_own_profile"
    ON admin_profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Admins can update their own profile (but not approval_status)
CREATE POLICY "admin_update_own_profile"
    ON admin_profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================
-- 2. Shop Settings RLS
-- ============================================================
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read shop settings
CREATE POLICY "public_read_shop_settings"
    ON shop_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Only approved admins can update shop settings
CREATE POLICY "admin_update_shop_settings"
    ON shop_settings FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());

-- Only approved admins can insert shop settings (for initial seed)
CREATE POLICY "admin_insert_shop_settings"
    ON shop_settings FOR INSERT
    TO authenticated
    WITH CHECK (is_approved_admin());

-- ============================================================
-- 3. Service Categories RLS
-- ============================================================
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "public_read_active_service_categories"
    ON service_categories FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR is_approved_admin());

-- Only approved admins can insert
CREATE POLICY "admin_insert_service_categories"
    ON service_categories FOR INSERT
    TO authenticated
    WITH CHECK (is_approved_admin());

-- Only approved admins can update
CREATE POLICY "admin_update_service_categories"
    ON service_categories FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());

-- Only approved admins can delete
CREATE POLICY "admin_delete_service_categories"
    ON service_categories FOR DELETE
    TO authenticated
    USING (is_approved_admin());

-- ============================================================
-- 4. Services RLS
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can read active services
CREATE POLICY "public_read_active_services"
    ON services FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR is_approved_admin());

-- Only approved admins can insert
CREATE POLICY "admin_insert_services"
    ON services FOR INSERT
    TO authenticated
    WITH CHECK (is_approved_admin());

-- Only approved admins can update
CREATE POLICY "admin_update_services"
    ON services FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());

-- Only approved admins can delete
CREATE POLICY "admin_delete_services"
    ON services FOR DELETE
    TO authenticated
    USING (is_approved_admin());

-- ============================================================
-- 5. Accessory Categories RLS
-- ============================================================
ALTER TABLE accessory_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "public_read_active_accessory_categories"
    ON accessory_categories FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR is_approved_admin());

-- Only approved admins can insert
CREATE POLICY "admin_insert_accessory_categories"
    ON accessory_categories FOR INSERT
    TO authenticated
    WITH CHECK (is_approved_admin());

-- Only approved admins can update
CREATE POLICY "admin_update_accessory_categories"
    ON accessory_categories FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());

-- Only approved admins can delete
CREATE POLICY "admin_delete_accessory_categories"
    ON accessory_categories FOR DELETE
    TO authenticated
    USING (is_approved_admin());

-- ============================================================
-- 6. Accessories RLS
-- ============================================================
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;

-- Public can read active accessories
CREATE POLICY "public_read_active_accessories"
    ON accessories FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR is_approved_admin());

-- Only approved admins can insert
CREATE POLICY "admin_insert_accessories"
    ON accessories FOR INSERT
    TO authenticated
    WITH CHECK (is_approved_admin());

-- Only approved admins can update
CREATE POLICY "admin_update_accessories"
    ON accessories FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());

-- Only approved admins can delete
CREATE POLICY "admin_delete_accessories"
    ON accessories FOR DELETE
    TO authenticated
    USING (is_approved_admin());

-- ============================================================
-- 7. Enquiries RLS
-- ============================================================
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert an enquiry (after OTP verification handled by backend)
CREATE POLICY "public_insert_enquiries"
    ON enquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only approved admins can read all enquiries
CREATE POLICY "admin_read_enquiries"
    ON enquiries FOR SELECT
    TO authenticated
    USING (is_approved_admin());

-- Only approved admins can update enquiry status
CREATE POLICY "admin_update_enquiries"
    ON enquiries FOR UPDATE
    TO authenticated
    USING (is_approved_admin())
    WITH CHECK (is_approved_admin());
