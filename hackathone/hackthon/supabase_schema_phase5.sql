-- 10. Add payment_qr column to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_qr TEXT;

-- Ensure there is at least one row in site_settings so the website doesn't crash
INSERT INTO site_settings (id, company_1_logo, company_2_logo)
SELECT 1, '', ''
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 1);
