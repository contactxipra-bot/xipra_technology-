const { Client } = require('pg');

const connectionString = 'postgresql://postgres:XipraTechnology%4012345@db.ylpcqgkjqaihkmmvtwnl.supabase.co:5432/postgres';

const graphicsDomains = [
  "Brand Advertisement", "Product Launch", "Festival Campaign", "Social Media Campaign",
  "Corporate Branding", "Motion Poster", "Cinematic Product Video", "Event Promotion",
  "Fashion Campaign", "Food Advertisement", "Travel Campaign", "Real Estate Campaign",
  "Automotive Advertisement", "Technology Advertisement", "Luxury Brand Campaign", "Sports Campaign",
  "Music Promotion", "Movie Promotion", "Educational Campaign", "Healthcare Campaign",
  "Sustainability Campaign", "Startup Promotion", "E-commerce Campaign", "Influencer Campaign",
  "Awareness Campaign", "Product Explainer", "Brand Story", "Company Profile Video",
  "Recruitment Campaign", "Corporate Event", "Product Showcase", "Before & After Campaign",
  "Customer Story", "Inspirational Campaign", "Minimalist Poster", "Retro Poster",
  "Futuristic Poster", "Luxury Poster", "Typography Poster", "3D Poster",
  "Isometric Poster", "Illustrated Poster", "Photo Manipulation", "Digital Collage",
  "Infographic Design", "Data Visualization", "Magazine Cover", "Album Cover",
  "Book Cover", "Packaging Campaign", "Billboard Design", "Outdoor Campaign",
  "Digital Billboard", "Instagram Campaign", "Instagram Reel", "YouTube Advertisement",
  "YouTube Thumbnail", "LinkedIn Campaign", "Product Teaser", "Brand Teaser",
  "Countdown Campaign", "Launch Countdown", "Festival Greeting", "Corporate Greeting",
  "Seasonal Campaign", "Sales Campaign", "Discount Campaign", "Awareness Reel",
  "Educational Reel", "Cinematic Reel", "Motion Typography", "Logo Animation",
  "Kinetic Typography", "Visual Storytelling", "Stop Motion", "VFX Advertisement",
  "AI Advertisement", "AI Product Visualization", "AI Brand Campaign", "Animated Infographic",
  "Animated Character", "Mascot Campaign", "Digital Invitation", "Event Invitation",
  "Wedding Campaign", "Restaurant Campaign", "Café Campaign", "Hotel Campaign",
  "Tourism Poster", "NGO Campaign", "Environmental Campaign", "Public Awareness Poster",
  "Cybersecurity Campaign", "Financial Campaign", "Banking Advertisement", "App Promotion",
  "Website Promotion", "Service Advertisement", "Personal Branding", "Future Vision Campaign"
];

const frontendDomains = [
  "Smart Dashboard", "E-commerce Store", "Portfolio Website", "Job Portal",
  "Learning Platform", "Food Delivery UI", "Travel Booking UI", "Hotel Booking UI",
  "Event Booking UI", "Fitness Dashboard", "Finance Dashboard", "Expense Tracker",
  "Task Manager", "Project Management UI", "CRM Dashboard", "Inventory Dashboard",
  "Analytics Dashboard", "HR Dashboard", "Employee Portal", "Student Portal",
  "Teacher Portal", "Hospital Dashboard", "Doctor Appointment UI", "Pharmacy Dashboard",
  "Restaurant Management UI", "POS Interface", "Real Estate Portal", "Property Dashboard",
  "Vehicle Marketplace", "Car Rental UI", "Social Media Platform", "Community Platform",
  "Chat Application", "Video Calling UI", "News Portal", "Blog Platform",
  "Magazine Website", "Streaming Platform", "Music Player", "Podcast Platform",
  "Online Library", "Digital Marketplace", "Subscription Platform", "SaaS Dashboard",
  "AI Assistant UI", "AI Chat Interface", "AI Image Generator UI", "AI Writing Assistant",
  "AI Resume Builder", "AI Study Assistant", "AI Interview Platform", "AI Analytics Dashboard",
  "Weather Dashboard", "Cryptocurrency Dashboard", "Stock Market Dashboard", "Banking Interface",
  "Digital Wallet UI", "Insurance Dashboard", "Investment Dashboard", "E-learning Dashboard",
  "Online Exam Portal", "Quiz Platform", "Course Marketplace", "Coding Platform",
  "Developer Dashboard", "GitHub Clone", "Cloud Storage UI", "File Management System",
  "Email Client", "Calendar Application", "Note Taking App", "Habit Tracker",
  "Meditation App", "Workout Planner", "Nutrition Dashboard", "Recipe Platform",
  "Fashion Store", "Furniture Store", "Electronics Store", "Beauty Store",
  "Grocery Store", "Pet Care Platform", "NGO Website", "Charity Platform",
  "Crowdfunding Platform", "Government Service Portal", "Complaint Management UI", "Customer Support Portal",
  "Helpdesk Dashboard", "Delivery Tracking UI", "Logistics Dashboard", "Smart Home Dashboard",
  "IoT Dashboard", "Cybersecurity Dashboard", "Accessibility Platform", "Multilingual Website",
  "AR Shopping Interface", "Voice-Controlled Interface", "Personal Productivity Hub", "Future Web Experience"
];

const fullstackDomains = [
  "E-commerce Platform", "Inventory Management System", "CRM System", "HR Management System",
  "Project Management System", "Learning Management System", "Hospital Management System", "Hotel Management System",
  "Restaurant Management System", "School Management System", "College Management System", "Library Management System",
  "Job Portal", "Recruitment Platform", "Freelance Marketplace", "Service Marketplace",
  "Real Estate Platform", "Property Management System", "Vehicle Rental Platform", "Travel Booking Platform",
  "Event Management Platform", "Ticket Booking System", "Food Delivery Platform", "Grocery Delivery Platform",
  "Pharmacy Platform", "Doctor Appointment System", "Fitness Management Platform", "Online Exam System",
  "Quiz Platform", "Course Marketplace", "Coding Practice Platform", "Online Auction Platform",
  "Crowdfunding Platform", "Donation Management System", "NGO Management Platform", "Subscription Management System",
  "SaaS Management Platform", "Customer Support System", "Helpdesk Platform", "Complaint Management System",
  "Feedback Management System", "Survey Platform", "Polling Platform", "Social Media Platform",
  "Community Platform", "Discussion Forum", "Chat Platform", "Collaboration Platform",
  "Video Meeting Platform", "File Sharing Platform", "Cloud Storage Platform", "Document Management System",
  "Digital Asset Management", "Email Management Platform", "Calendar Management System", "Task Management Platform",
  "Expense Management System", "Personal Finance Platform", "Investment Management Platform", "Banking Platform",
  "Digital Wallet", "Insurance Management System", "Invoice Management System", "Billing Platform",
  "POS Management System", "Accounting Platform", "Payroll Management System", "Attendance Management System",
  "Employee Self-Service Portal", "Delivery Management System", "Logistics Management Platform", "Fleet Management System",
  "Warehouse Management System", "Supply Chain Platform", "Manufacturing Management System", "Production Tracking System",
  "Quality Management System", "Vendor Management System", "Procurement Platform", "Customer Loyalty Platform",
  "Referral Management System", "Marketing Automation Platform", "Campaign Management System", "Affiliate Management Platform",
  "Content Management System", "Blog Management Platform", "News Management Platform", "AI Chatbot Platform",
  "AI Resume Platform", "AI Interview Platform", "AI Recommendation System", "AI Analytics Platform",
  "AI Document Processing System", "AI Knowledge Management Platform", "IoT Management Platform", "Smart Home Platform",
  "Cybersecurity Monitoring Platform", "Emergency Response Platform", "Community Utility Platform", "Smart City Platform"
];

async function seedDomains() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Clear old domains
    await client.query('DELETE FROM domains');
    console.log('Cleared existing domains.');

    const insertQuery = 'INSERT INTO domains (category, title) VALUES ($1, $2)';
    
    // Insert Graphics (we'll map it to both graphics-video and graphics-poster so it matches the frontend filters)
    for (const d of graphicsDomains) {
      await client.query(insertQuery, ['graphics-video', d]);
      await client.query(insertQuery, ['graphics-poster', d]);
    }
    console.log('Seeded graphics domains.');

    // Insert Frontend
    for (const d of frontendDomains) {
      await client.query(insertQuery, ['frontend', d]);
    }
    console.log('Seeded frontend domains.');

    // Insert Fullstack
    for (const d of fullstackDomains) {
      await client.query(insertQuery, ['fullstack', d]);
    }
    console.log('Seeded fullstack domains.');

    console.log('✅ Successfully replaced all domains!');
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await client.end();
  }
}

seedDomains();
