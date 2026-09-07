const { Client } = require('pg');

const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

const sql = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create site_settings (Legacy, but keeping for reference)
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    prize_pool TEXT DEFAULT '₹1,00,000+',
    company_1_logo TEXT NOT NULL,
    company_2_logo TEXT NOT NULL,
    fee_graphics INTEGER DEFAULT 500,
    fee_frontend INTEGER DEFAULT 800,
    fee_fullstack INTEGER DEFAULT 1000,
    about_wiregen TEXT DEFAULT 'Wiregen AI specializes in creating cutting-edge artificial intelligence solutions. Our mission is to automate complex workflows and provide actionable insights through advanced machine learning models.',
    contact_wiregen TEXT DEFAULT 'contact@wiregen.ai',
    about_xipra TEXT DEFAULT 'Xipra Technology builds robust, scalable enterprise software. We empower businesses with modern web architectures, secure infrastructures, and seamless digital transformations.',
    contact_xipra TEXT DEFAULT 'info@xipratech.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create domains
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, 
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    subcategory TEXT,
    domain TEXT NOT NULL,
    hackathon_completed BOOLEAN DEFAULT false,
    team_name TEXT,
    payment_status TEXT DEFAULT 'pending',
    invoice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create team_members
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT false,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL
);

-- 5. Create projects (Phase 4 & 7)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL, 
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  destination_link TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create site_content (Phase 5)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section VARCHAR(50) NOT NULL, 
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create member_certificates (Phase 7)
CREATE TABLE IF NOT EXISTS member_certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
    team_name TEXT,
    certificate_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert dummy site_content if not exists
INSERT INTO site_content (section, content)
SELECT 'global', '{"logoImage": "", "companyName": "WX Hackathon"}'
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE section = 'global');

INSERT INTO site_content (section, content)
SELECT 'hero', '{"title": "Innovate, Build, Conquer.", "subtitle": "Join the most anticipated hackathon", "slides": []}'
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE section = 'hero');
`;

async function migrate() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected! Executing schema...');
    
    await client.query(sql);
    console.log('✅ Schema migration completed successfully!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
