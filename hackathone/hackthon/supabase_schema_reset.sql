-- WARNING: This script will delete ALL transactional data and start the project fresh.
-- It preserves site settings, domains, and CMS content.

TRUNCATE TABLE member_certificates RESTART IDENTITY CASCADE;
TRUNCATE TABLE projects RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;
TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;

-- If you also want to remove mock domains, uncomment the following line:
-- TRUNCATE TABLE domains RESTART IDENTITY CASCADE;

-- Do NOT truncate site_settings or site_content to preserve configuration.
