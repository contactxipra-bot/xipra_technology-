-- (Appended Schema Update for Phase 4)

-- 9. Create projects table to store portfolio projects
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL, -- e.g. 'Wiregen AI' or 'Xipra Technology'
  image_url TEXT NOT NULL,
  destination_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: RLS policies should be added later so only admins can insert/update/delete.
-- Public can select.
