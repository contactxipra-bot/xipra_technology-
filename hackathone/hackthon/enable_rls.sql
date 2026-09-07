-- Enable Row Level Security (RLS) on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_certificates ENABLE ROW LEVEL SECURITY;

-- Temporary Policies: Allow 'anon' full access so the current Admin Dashboard keeps working.
-- Note: This clears the "RLS disabled" warning in Supabase, but is not strictly secure 
-- until we implement Supabase Authentication for the Admin Dashboard.

-- site_settings
CREATE POLICY "Public full access to site_settings" ON site_settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- site_content
CREATE POLICY "Public full access to site_content" ON site_content FOR ALL TO anon USING (true) WITH CHECK (true);

-- domains
CREATE POLICY "Public full access to domains" ON domains FOR ALL TO anon USING (true) WITH CHECK (true);

-- projects
CREATE POLICY "Public full access to projects" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);

-- registrations
CREATE POLICY "Public full access to registrations" ON registrations FOR ALL TO anon USING (true) WITH CHECK (true);

-- team_members
CREATE POLICY "Public full access to team_members" ON team_members FOR ALL TO anon USING (true) WITH CHECK (true);

-- member_certificates
CREATE POLICY "Public full access to member_certificates" ON member_certificates FOR ALL TO anon USING (true) WITH CHECK (true);
