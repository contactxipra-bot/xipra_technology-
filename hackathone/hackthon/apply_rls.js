const fs = require('fs');
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

async function applyRLS() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected! Reading SQL script...');
    
    const sql = fs.readFileSync('./enable_rls.sql', 'utf8');
    
    console.log('Executing RLS script...');
    await client.query(sql);
    console.log('✅ RLS successfully enabled and policies applied!');
    
  } catch (err) {
    console.error('❌ Failed to apply RLS:', err);
  } finally {
    await client.end();
  }
}

applyRLS();
