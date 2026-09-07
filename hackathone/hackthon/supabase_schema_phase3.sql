-- (Appended Schema Update for Phase 3)

-- 7. Add columns to site_settings for dynamic fees
ALTER TABLE site_settings ADD COLUMN fee_graphics INTEGER DEFAULT 500;
ALTER TABLE site_settings ADD COLUMN fee_frontend INTEGER DEFAULT 800;
ALTER TABLE site_settings ADD COLUMN fee_fullstack INTEGER DEFAULT 1000;

-- 8. Add columns for Company Details & Contact Info
ALTER TABLE site_settings ADD COLUMN about_wiregen TEXT DEFAULT 'Wiregen AI specializes in creating cutting-edge artificial intelligence solutions. Our mission is to automate complex workflows and provide actionable insights through advanced machine learning models.';
ALTER TABLE site_settings ADD COLUMN contact_wiregen TEXT DEFAULT 'contact@wiregen.ai';
ALTER TABLE site_settings ADD COLUMN about_xipra TEXT DEFAULT 'Xipra Technology builds robust, scalable enterprise software. We empower businesses with modern web architectures, secure infrastructures, and seamless digital transformations.';
ALTER TABLE site_settings ADD COLUMN contact_xipra TEXT DEFAULT 'info@xipratech.com';
