const { Client } = require('pg');

const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

const defaultCMS = {
  global: { 
    logoText: 'WX HACKATHON', 
    logoImage: '', 
    company1: 'Wiregen AI', 
    company2: 'Xipra Technology',
    prizePool: '₹1,00,000+', 
    categoriesCount: '3' 
  },
  hero: { 
    title: 'Innovate, Build, Conquer.', 
    subtitle: 'Join the most anticipated hackathon brought to you by Wiregen AI & Xipra Technology. Whether you are a master of UI/UX, a Frontend wizard, or a Fullstack guru, there\'s a place for you to shine.',
    bgImage: '',
    slides: [
      { id: '1', title: "Wiregen AI", subtitle: "Pioneering the future of Artificial Intelligence", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000" },
      { id: '2', title: "Xipra Technology", subtitle: "Building robust enterprise solutions", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" },
      { id: '3', title: "The Ultimate Hackathon", subtitle: "Showcase your skills and win big!", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000" }
    ]
  },
  certificates: {
    bgImage: '',
    pdfTemplate: ''
  },
  categories: {
    graphics: { 
      desc: 'Showcase your creativity through Video Editing or Poster Design. (Max 1 Member)', 
      prize1: '₹5,000', prize2: '₹3,000', prize3: '₹2,000' 
    },
    frontend: { 
      desc: 'Build stunning, responsive, and interactive user interfaces. (Up to 2 Members)', 
      prize1: '₹15,000', prize2: '₹10,000', prize3: '₹5,000' 
    },
    fullstack: { 
      desc: 'Architect and deploy complete end-to-end web applications. (Up to 4 Members)', 
      prize1: '₹30,000', prize2: '₹20,000', prize3: '₹10,000' 
    }
  },
  register: {
    hero: 'Register for WX Hackathon',
    subtext: 'Join the ultimate coding competition and showcase your skills.'
  }
};

const prefixes = {
  'graphics-video': ['Promotional Video for', 'Product Reveal:', 'Event Teaser for', 'Documentary cut:', 'Vlog edit for', 'Ad Campaign:', 'Music Video for', 'Trailer for'],
  'graphics-poster': ['Tech Event Poster:', 'Company Branding for', 'Social Media Campaign:', 'UI Concept for', 'Infographic:', 'Logo Design for', 'Marketing Flyer:', 'Billboard Concept:'],
  'frontend': ['E-commerce UI for', 'Portfolio Website for', 'Dashboard Application:', 'Landing Page for', 'Interactive Map UI:', 'Social Feed for', 'Booking System for', 'SaaS Platform UI:'],
  'fullstack': ['Web3 Marketplace for', 'Real-time Chat App for', 'AI SaaS Platform:', 'Inventory System for', 'Job Board Portal:', 'Healthcare App for', 'Fintech Dashboard:', 'EdTech Platform:']
};

const words = ['Quantum', 'Nexus', 'Aero', 'Synth', 'Cyber', 'Nova', 'Pulse', 'Hyper', 'Meta', 'Neo', 'Tech', 'Vision', 'Sphere', 'Logic', 'Code', 'Data'];

function generateDomains(category) {
  let domains = [];
  for (let i = 1; i <= 50; i++) {
    const prefix = prefixes[category][i % prefixes[category].length];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    domains.push(`${prefix} ${word1} ${word2} ${i}`);
  }
  return domains;
}

const mockTeamsData = [
  { team_name: 'Alpha Coders', cat: 'fullstack', dom: 'Real-time Chat App', size: 4 },
  { team_name: 'Beta Builders', cat: 'frontend', dom: 'E-commerce UI', size: 2 },
  { team_name: 'Gamma Graphics', cat: 'graphics-poster', dom: 'Tech Event Poster', size: 1 },
  { team_name: 'Delta Design', cat: 'graphics-video', dom: 'Promotional Video', size: 1 },
  { team_name: 'Epsilon Engineers', cat: 'fullstack', dom: 'Web3 Marketplace', size: 3 },
  { team_name: 'Zeta Zone', cat: 'frontend', dom: 'Dashboard Application', size: 1 },
  { team_name: 'Eta Experts', cat: 'fullstack', dom: 'AI SaaS Platform', size: 4 },
  { team_name: 'Theta Thinkers', cat: 'graphics-poster', dom: 'Company Branding', size: 1 },
  { team_name: 'Iota Innovators', cat: 'frontend', dom: 'Portfolio Website', size: 2 },
  { team_name: 'Kappa Kreatives', cat: 'graphics-video', dom: 'Event Teaser', size: 1 }
];

const memberFirstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Ravi', 'Kiran', 'Suresh', 'Anita', 'Vikas', 'Pooja', 'Anil', 'Sunita', 'Raj', 'Kavita', 'Mohit', 'Neha'];
const memberLastNames = ['Sharma', 'Patel', 'Kumar', 'Desai', 'Singh', 'Reddy', 'Rao', 'Gupta', 'Verma', 'Jain'];
const colleges = ['IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'SRM Institute', 'Delhi University', 'Anna University'];

async function seed() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected! Starting seeding...');
    
    // 1. Reset and Insert site_content
    await client.query('DELETE FROM site_content');
    console.log('Cleared existing site_content');
    
    for (const [section, content] of Object.entries(defaultCMS)) {
      await client.query(
        'INSERT INTO site_content (section, content) VALUES ($1, $2)',
        [section, JSON.stringify(content)]
      );
    }
    console.log('✅ Seeded site_content');

    // 2. Clear and Seed Domains
    await client.query('DELETE FROM domains');
    
    for (const cat of ['graphics-video', 'graphics-poster', 'frontend', 'fullstack']) {
      const domains = generateDomains(cat);
      for (const dom of domains) {
        await client.query(
          'INSERT INTO domains (category, title) VALUES ($1, $2)',
          [cat, dom]
        );
      }
    }
    console.log('✅ Seeded 200 domains (50 per category)');

    // 3. Clear and Seed Teams
    await client.query('DELETE FROM team_members');
    await client.query('DELETE FROM registrations');
    
    for (const team of mockTeamsData) {
      const regRes = await client.query(
        `INSERT INTO registrations (category, domain, team_name, payment_status) 
         VALUES ($1, $2, $3, 'paid') RETURNING id`,
        [team.cat, team.dom, team.team_name]
      );
      
      const regId = regRes.rows[0].id;
      
      for (let i = 0; i < team.size; i++) {
        const fname = memberFirstNames[Math.floor(Math.random() * memberFirstNames.length)];
        const lname = memberLastNames[Math.floor(Math.random() * memberLastNames.length)];
        const college = colleges[Math.floor(Math.random() * colleges.length)];
        const email = `${fname.toLowerCase()}.${lname.toLowerCase()}@example.com`;
        
        await client.query(
          `INSERT INTO team_members (registration_id, full_name, email, phone, college, is_leader)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [regId, `${fname} ${lname}`, email, '+919876543210', college, i === 0]
        );
      }
    }
    console.log('✅ Seeded 10 mock teams and members');
    
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seed();
