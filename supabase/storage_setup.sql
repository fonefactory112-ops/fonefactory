-- ============================================================
-- FoneFactory Storage Setup
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('accessory-images', 'accessory-images', true);

-- ============================================================
-- Storage Policies: shop-assets
-- ============================================================

-- Public read access
CREATE POLICY "public_read_shop_assets"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'shop-assets');

-- Approved admins can upload
CREATE POLICY "admin_upload_shop_assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'shop-assets'
        AND is_approved_admin()
    );

-- Approved admins can update
CREATE POLICY "admin_update_shop_assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'shop-assets'
        AND is_approved_admin()
    );

-- Approved admins can delete
CREATE POLICY "admin_delete_shop_assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'shop-assets'
        AND is_approved_admin()
    );

-- ============================================================
-- Storage Policies: service-images
-- ============================================================

CREATE POLICY "public_read_service_images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'service-images');

CREATE POLICY "admin_upload_service_images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'service-images'
        AND is_approved_admin()
    );

CREATE POLICY "admin_update_service_images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'service-images'
        AND is_approved_admin()
    );

CREATE POLICY "admin_delete_service_images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'service-images'
        AND is_approved_admin()
    );

-- ============================================================
-- Storage Policies: accessory-images
-- ============================================================

CREATE POLICY "public_read_accessory_images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'accessory-images');

CREATE POLICY "admin_upload_accessory_images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'accessory-images'
        AND is_approved_admin()
    );

CREATE POLICY "admin_update_accessory_images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'accessory-images'
        AND is_approved_admin()
    );

CREATE POLICY "admin_delete_accessory_images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'accessory-images'
        AND is_approved_admin()
    );
