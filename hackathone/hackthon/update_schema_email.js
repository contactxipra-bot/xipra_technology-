const { Client } = require('pg');
const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

async function run() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;`);
    console.log('✅ Added payment_screenshot to registrations');
    
    await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;`);
    console.log('✅ Added is_approved to registrations');
    
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await client.end();
  }
}

run();
