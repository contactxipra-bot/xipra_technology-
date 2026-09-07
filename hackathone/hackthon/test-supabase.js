const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ylpcqgkjqaihkmmvtwnl.supabase.co';
const supabaseAnonKey = 'sb_publishable_a9KBZaEhU3lBCPCzCRWYDA_6QCnrZsg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  // We can test by fetching time or just checking if auth works
  const { data, error } = await supabase.from('site_content').select('*').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('✅ Connection Successful! (Table "site_content" does not exist yet, which is expected before migration)');
    } else {
      console.error('❌ Connection Error:', error.message, error);
    }
  } else {
    console.log('✅ Connection Successful! Data retrieved.');
  }
}

testConnection();
