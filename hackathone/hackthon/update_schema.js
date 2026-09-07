const { Client } = require('pg');
const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

async function run() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    await client.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_qr TEXT;`);
    console.log('✅ Added payment_qr to site_settings');
    
    await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transaction_id TEXT;`);
    console.log('✅ Added transaction_id to registrations');
    
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await client.end();
  }
}

run();
