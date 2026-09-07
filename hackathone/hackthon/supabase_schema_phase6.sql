-- 11. Add hackathon timeline settings to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hackathon_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hackathon_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS result_date TIMESTAMP WITH TIME ZONE;
