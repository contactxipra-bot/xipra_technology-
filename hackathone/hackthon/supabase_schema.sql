-- Hackathon Website Supabase Schema

-- 1. Create a table for site settings (managed by Admin)
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    prize_pool TEXT DEFAULT '₹1,00,000+',
    company_1_logo TEXT NOT NULL,
    company_2_logo TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert initial settings
INSERT INTO site_settings (company_1_logo, company_2_logo) 
VALUES ('https://images.unsplash.com/photo-1677442136019-21780ecad995', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa');

-- 2. Create a table for domains/subcategories
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- e.g., 'graphics-video', 'frontend', 'fullstack'
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert initial mock domains
INSERT INTO domains (category, title) VALUES
('graphics-video', 'Promotional Video'),
('graphics-video', 'Product Reveal'),
('graphics-poster', 'Tech Event Poster'),
('frontend', 'E-commerce UI'),
('frontend', 'Portfolio Website'),
('fullstack', 'Web3 Marketplace'),
('fullstack', 'Real-time Chat App');

-- 3. Create a table for registrations
CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    subcategory TEXT,
    domain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create a table for team members linked to a registration
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT false,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL
);

-- Note: Ensure Row Level Security (RLS) is configured in your Supabase dashboard depending on your authentication strategy.
-- Typically, registrations table should allow INSERT for anon, but only SELECT for authenticated admins.
