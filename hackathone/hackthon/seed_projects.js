const { Client } = require('pg');

const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

async function seedProjects() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Seed 2 projects
    await client.query(`
      INSERT INTO projects (title, company, image_url, destination_link, description)
      VALUES 
      ('AI Assistant V2', 'Wiregen AI', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000', 'https://wiregen.ai', 'Next-generation AI assistant built for enterprise workflows.'),
      ('Enterprise Dashboard', 'Xipra Technology', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000', 'https://xipratech.com', 'A scalable enterprise architecture dashboard.')
    `);
    
    console.log('✅ Seeded 2 mock projects');
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await client.end();
  }
}

seedProjects();
