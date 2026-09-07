const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createDummyTeam() {
  const teamNumber = 'HN-TECH01';
  
  // 1. Insert Registration
  const { data: regData, error: regError } = await supabase.from('registrations').insert([{
    team_name: 'TECH',
    category: 'graphics-poster',
    domain: 'Software',
    transaction_id: 'N/A',
    payment_screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    team_number: teamNumber,
    is_approved: true // Auto-approve so they can test upload
  }]).select();

  if (regError) {
    console.error("Error creating team:", regError);
    return;
  }

  const regId = regData[0].id;

  // 2. Insert Members
  const { error: memError } = await supabase.from('team_members').insert([
    {
      registration_id: regId,
      full_name: 'Parth',
      email: 'parth@example.com',
      phone: '9000000001',
      college: 'Tech University',
      is_leader: true
    },
    {
      registration_id: regId,
      full_name: 'Jay',
      email: 'jay@example.com',
      phone: '9000000002',
      college: 'Tech University',
      is_leader: false
    }
  ]);

  if (memError) {
    console.error("Error adding members:", memError);
    return;
  }

  console.log("========================================");
  console.log("SUCCESS! Dummy Team created.");
  console.log(`TEAM NUMBER: ${teamNumber}`);
  console.log("========================================");
}

createDummyTeam();
