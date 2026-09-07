-- (Appended Schema Update for Phase 7)

-- 12. Support for Image Arrays and Advanced CMS
-- Hero Slider Array: The `site_content` table's JSON blob should now support an array of slides in `hero.slides`.
-- Project Galleries: The `projects` table (or wherever projects are stored) should be updated to support an array of images.
-- `ALTER TABLE projects ADD COLUMN images text[];`

-- 13. Per-Member Certificates
-- In a real relational model, certificates should be linked to individual members.
-- CREATE TABLE member_certificates (
--     id uuid default uuid_generate_v4() primary key,
--     member_id uuid references team_members(id),
--     team_id uuid references teams(id),
--     certificate_url text,
--     created_at timestamp with time zone default timezone('utc'::text, now())
-- );

-- 14. Architecture Transition Roadmap
-- In the upcoming phases, we will introduce Supabase Auth and transition to:
-- - `auth.users` for participants
-- - `teams` and `team_members` for tracking relationships
-- - `submissions` for projects linked to teams
