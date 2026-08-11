-- ============================================================
-- FoneFactory Seed Data
-- Run this AFTER schema.sql and rls_policies.sql
-- Use service_role or run in SQL Editor
-- ============================================================

-- ============================================================
-- Shop Settings (singleton row)
-- ============================================================
INSERT INTO shop_settings (
    id, shop_name, about_description, phone_number, email,
    address, working_hours, logo_url, founder_name,
    founder_description, founder_photo_url, footer_text
) VALUES (
    1,
    'Fone Factory',
    'Welcome to Fone Factory — your trusted destination for premium mobile phone repairs, accessories, and gadgets. With years of expertise in the mobile industry, we provide fast, reliable, and affordable solutions for all your smartphone needs. From display replacements to battery fixes, we use only genuine parts and deliver exceptional service quality.',
    '+91 XXXXXXXXXX',
    'fonefactory112@gmail.com',
    'Your Shop Address Here',
    'Mon - Sat: 10:00 AM - 8:00 PM | Sun: Closed',
    '',
    'Farhaan',
    'Farhaan is the visionary founder of Fone Factory. With a deep passion for mobile technology and customer service excellence, he established Fone Factory to provide top-quality phone repair services and accessories at affordable prices. His commitment to quality and customer satisfaction has made Fone Factory a trusted name in the mobile repair industry.',
    '',
    'Farhaan Pvt Presents'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Service Categories
-- ============================================================
INSERT INTO service_categories (name, description, display_order, is_active) VALUES
    ('Display Problem', 'Screen repair, replacement, and display-related services', 1, true),
    ('Battery Problem', 'Battery replacement, charging issues, and power-related services', 2, true),
    ('PIN Problem', 'Pattern unlock, PIN reset, software lock removal services', 3, true);

-- ============================================================
-- Sample Services
-- ============================================================

-- Get the Display Problem category ID and insert a sample service
INSERT INTO services (category_id, name, description, price, image_url, is_active)
SELECT
    sc.id,
    'Vivo Display Replacement',
    'Professional Vivo smartphone display replacement using genuine OEM parts. Includes screen testing, installation, and quality assurance. 6-month warranty on parts and labor.',
    2500.00,
    '',
    true
FROM service_categories sc WHERE sc.name = 'Display Problem'
LIMIT 1;

INSERT INTO services (category_id, name, description, price, image_url, is_active)
SELECT
    sc.id,
    'Samsung Screen Repair',
    'Expert Samsung Galaxy screen repair and replacement. AMOLED and LCD options available. Fast turnaround with warranty.',
    3500.00,
    '',
    true
FROM service_categories sc WHERE sc.name = 'Display Problem'
LIMIT 1;

INSERT INTO services (category_id, name, description, price, image_url, is_active)
SELECT
    sc.id,
    'Battery Replacement',
    'Genuine battery replacement for all major smartphone brands. Restore your phone''s battery life to like-new condition.',
    800.00,
    '',
    true
FROM service_categories sc WHERE sc.name = 'Battery Problem'
LIMIT 1;

INSERT INTO services (category_id, name, description, price, image_url, is_active)
SELECT
    sc.id,
    'Pattern/PIN Unlock',
    'Professional pattern and PIN unlock service. Safe data recovery when possible. Quick turnaround.',
    500.00,
    '',
    true
FROM service_categories sc WHERE sc.name = 'PIN Problem'
LIMIT 1;

-- ============================================================
-- Accessory Categories
-- ============================================================
INSERT INTO accessory_categories (name, description, display_order, is_active) VALUES
    ('Charger', 'Mobile phone chargers, adapters, and charging accessories', 1, true),
    ('Pouch', 'Phone pouches, cases, covers, and protective accessories', 2, true),
    ('Cables', 'USB cables, data cables, and charging cables', 3, true);

-- ============================================================
-- Sample Accessories
-- ============================================================
INSERT INTO accessories (category_id, name, description, price, image_url, availability, is_active)
SELECT
    ac.id,
    'Basic Pouch',
    'Universal smartphone pouch with soft inner lining. Fits most phones up to 6.7 inches. Available in multiple colors.',
    150.00,
    '',
    true,
    true
FROM accessory_categories ac WHERE ac.name = 'Pouch'
LIMIT 1;

INSERT INTO accessories (category_id, name, description, price, image_url, availability, is_active)
SELECT
    ac.id,
    'Fast Charge Cable',
    'Premium 1-meter USB Type-C fast charging cable. Supports up to 65W fast charging. Braided nylon design for durability.',
    299.00,
    '',
    true,
    true
FROM accessory_categories ac WHERE ac.name = 'Cables'
LIMIT 1;

INSERT INTO accessories (category_id, name, description, price, image_url, availability, is_active)
SELECT
    ac.id,
    'Cable',
    'Standard USB Type-C to USB-A charging and data transfer cable. 1.5-meter length. Compatible with all USB-C devices.',
    99.00,
    '',
    true,
    true
FROM accessory_categories ac WHERE ac.name = 'Cables'
LIMIT 1;

INSERT INTO accessories (category_id, name, description, price, image_url, availability, is_active)
SELECT
    ac.id,
    '20W Fast Charger',
    'Compact 20W USB-C fast charger adapter. Compatible with iPhone, Samsung, and other smartphones. BIS certified.',
    499.00,
    '',
    true,
    true
FROM accessory_categories ac WHERE ac.name = 'Charger'
LIMIT 1;
