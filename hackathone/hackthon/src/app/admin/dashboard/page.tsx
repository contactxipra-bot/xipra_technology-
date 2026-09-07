"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Users, Layers, LogOut, Plus, Trash2, Award, CheckCircle, FolderOpen, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Mock Initial Data
const INITIAL_DOMAINS = {
  'graphics-video': ['Promotional Video', 'Product Reveal', 'Event Teaser'],
  'graphics-poster': ['Tech Event Poster', 'Company Branding', 'Social Media Campaign'],
  'frontend': ['E-commerce UI', 'Portfolio Website', 'Dashboard Application'],
  'fullstack': ['Web3 Marketplace', 'Real-time Chat App', 'AI SaaS Platform']
};

// Mocks removed; using live state

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'domains' | 'registrations' | 'certificates' | 'projects' | 'cms' | 'settings'>('domains');
  const [domains, setDomains] = useState(INITIAL_DOMAINS);
  const [newDomain, setNewDomain] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('frontend');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [uploadedCertificates, setUploadedCertificates] = useState<Record<string, string>>({}); // memberName -> base64 string
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [approvingTeam, setApprovingTeam] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Projects State
  const [projects, setProjects] = useState<{id: string, title: string, company: string, images: string[], link: string, description: string}[]>([]);
  const [newProject, setNewProject] = useState<{title: string, company: string, images: string[], link: string, description: string}>({ title: '', company: 'Wiregen AI', images: [], link: '', description: '' });

  // Dynamic Settings State
  const [fees, setFees] = useState({ graphics: 500, frontend: 800, fullstack: 1000 });
  const [aboutWiregen, setAboutWiregen] = useState('');
  const [contactWiregen, setContactWiregen] = useState('');
  const [aboutXipra, setAboutXipra] = useState('');
  const [contactXipra, setContactXipra] = useState('');
  const [paymentQr, setPaymentQr] = useState('');
  
  // Timeline Settings
  const [hackathonStart, setHackathonStart] = useState('');
  const [hackathonEnd, setHackathonEnd] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  // Full CMS State
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
  const [cms, setCms] = useState(defaultCMS);

  useEffect(() => {
    async function loadData() {
      // Load settings
      const { data: settings } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (settings) {
        setFees({ graphics: settings.fee_graphics, frontend: settings.fee_frontend, fullstack: settings.fee_fullstack });
        setAboutWiregen(settings.about_wiregen);
        setContactWiregen(settings.contact_wiregen);
        setAboutXipra(settings.about_xipra);
        setContactXipra(settings.contact_xipra);
        setPaymentQr(settings.payment_qr || '');
        if (settings.hackathon_start) setHackathonStart(settings.hackathon_start.slice(0, 16));
        if (settings.hackathon_end) setHackathonEnd(settings.hackathon_end.slice(0, 16));
        if (settings.result_date) setResultDate(settings.result_date.slice(0, 16));
      } else {
        // Init row 1 if missing
        await supabase.from('site_settings').insert([{ id: 1 }]);
      }

      // Load CMS
      const { data: cmsData } = await supabase.from('site_content').select('*');
      if (cmsData && cmsData.length > 0) {
        let newCms = { ...defaultCMS };
        cmsData.forEach(row => {
          if (newCms[row.section as keyof typeof newCms]) {
            newCms[row.section as keyof typeof newCms] = row.content;
          }
        });
        setCms(newCms);
      }

      // Load Projects
      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projData) setProjects(projData);

      // Load Domains
      const { data: domData } = await supabase.from('domains').select('*');
      if (domData && domData.length > 0) {
        let newDomains = { 'graphics-video': [], 'graphics-poster': [], 'frontend': [], 'fullstack': [] } as any;
        domData.forEach(d => {
          if (newDomains[d.category]) newDomains[d.category].push(d.title);
        });
        setDomains(newDomains);
      } else {
        setDomains(INITIAL_DOMAINS); // Fallback to initial if db empty
      }

      // Load Registrations & Teams
      const { data: regData } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (regData) setRegistrations(regData);

      const { data: memData } = await supabase.from('team_members').select('*');
      if (memData && regData) {
        // Construct teams from registrations and team_members
        const structuredTeams = regData.map(reg => {
          const members = memData.filter(m => m.registration_id === reg.id);
          const lead = members.find(m => m.is_leader) || members[0];
          return {
            id: reg.id,
            invoice_id: reg.invoice_id,
            team_number: reg.team_number,
            teamName: reg.team_name || (lead ? `${lead.full_name}'s Team` : 'Unknown Team'),
            category: reg.category,
            domain: reg.domain,
            leadEmail: lead ? lead.email : '',
            is_approved: reg.is_approved,
            payment_screenshot: reg.payment_screenshot,
            transaction_id: reg.transaction_id,
            members: members.map(m => ({ id: m.id, name: m.full_name, role: m.is_leader ? 'Team Leader' : 'Member', email: m.email })),
            leadName: lead ? lead.full_name : 'N/A',
            memberCount: members.length,
            date: new Date(reg.created_at).toLocaleDateString()
          };
        });
        setTeams(structuredTeams);
      }
    }
    loadData();
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await supabase.from('site_settings').update({
        fee_graphics: fees.graphics,
        fee_frontend: fees.frontend,
        fee_fullstack: fees.fullstack,
        about_wiregen: aboutWiregen,
        contact_wiregen: contactWiregen,
        about_xipra: aboutXipra,
        contact_xipra: contactXipra,
        payment_qr: paymentQr,
        hackathon_start: hackathonStart ? new Date(hackathonStart).toISOString() : null,
        hackathon_end: hackathonEnd ? new Date(hackathonEnd).toISOString() : null,
        result_date: resultDate ? new Date(resultDate).toISOString() : null
      }).eq('id', 1);

      for (const section of Object.keys(cms)) {
        await supabase.from('site_content').update({ content: cms[section as keyof typeof cms] }).eq('section', section);
      }
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
    setIsSaving(false);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    
    await supabase.from('domains').insert([{ category: selectedCategory, title: newDomain }]);
    
    setDomains({
      ...domains,
      [selectedCategory]: [...domains[selectedCategory as keyof typeof domains], newDomain]
    });
    setNewDomain('');
  };

  const handleRemoveDomain = async (cat: string, index: number) => {
    const titleToRemove = domains[cat as keyof typeof domains][index];
    await supabase.from('domains').delete().eq('category', cat).eq('title', titleToRemove);
    
    const updated = [...domains[cat as keyof typeof domains]];
    updated.splice(index, 1);
    setDomains({
      ...domains,
      [cat]: updated
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || newProject.images.length === 0 || !newProject.link || !newProject.description) return;
    
    const { data, error } = await supabase.from('projects').insert([{
      title: newProject.title,
      company: newProject.company,
      image_url: newProject.images[0] || '', // fallback
      images: newProject.images,
      destination_link: newProject.link,
      description: newProject.description
    }]).select();

    if (data && data[0]) {
      setProjects([data[0], ...projects]);
    }
    
    setNewProject({ title: '', company: 'Wiregen AI', images: [], link: '', description: '' });
  };

  const handleRemoveProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
  };

  const handleDeleteAllData = async () => {
    if (window.confirm("Are you SURE you want to delete all registrations, teams, and projects? This action cannot be undone.")) {
      setIsDeletingData(true);
      try {
        // Delete member_certificates
        await supabase.from('member_certificates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete projects
        await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete team_members
        await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete registrations
        await supabase.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        alert("All project data has been successfully deleted.");
        window.location.reload(); // Refresh the page to reflect empty state
      } catch (err) {
        console.error('Error deleting data:', err);
        alert("Failed to delete some data. Check console.");
      }
      setIsDeletingData(false);
    }
  };

  const handleApprove = async (team: any) => {
    try {
      // 1. Temporarily set this team to render the invoice in the DOM
      setApprovingTeam(team);
      
      // 2. Wait for React to render the hidden #invoice template
      setTimeout(async () => {
        try {
          await supabase.from('registrations').update({ is_approved: true }).eq('id', team.id);
          setTeams(teams.map((t: any) => t.id === team.id ? { ...t, is_approved: true } : t));
          
          let baseCategory = team.category;
          if (baseCategory.startsWith('graphics')) baseCategory = 'graphics';
          
          let totalFee = fees[baseCategory as keyof typeof fees] || 0;
          if (baseCategory !== 'graphics') {
            totalFee = totalFee * (team.memberCount || 1);
          }
          const perMember = totalFee / (team.memberCount || 1);

          let pdfBase64 = '';
          const invoiceElement = document.getElementById('admin-invoice');
          
          if (invoiceElement) {
            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
              margin: 0,
              filename: `${team.invoice_id || team.id.substring(0,8)}.pdf`,
              image: { type: 'jpeg' as const, quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
            };
            pdfBase64 = await html2pdf().from(invoiceElement).set(opt).output('datauristring');
          }

          if (team.leadEmail) {
            // Send Registration Email (Invoice)
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'registration',
                email: team.leadEmail,
                name: team.leadName,
                teamName: team.teamName,
                teamNumber: team.invoice_id || team.id.substring(0,8), // Using short ID as Team ID
                domain: team.domain,
                memberCount: team.memberCount,
                totalFee,
                perMember,
                pdfBase64: pdfBase64 || null
              })
            });

            // Send Approval Email
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'approval',
                email: team.leadEmail,
                teamName: team.teamName,
                teamNumber: team.invoice_id || team.id.substring(0,8),
                domain: team.domain,
                memberCount: team.memberCount,
                totalFee,
                perMember,
                transactionId: team.transaction_id || 'N/A'
              })
            });
          }
          alert('Team approved and invoice emails sent automatically!');
          setApprovingTeam(null);
        } catch (err) {
          console.error(err);
          alert('Error during approval or email dispatch');
          setApprovingTeam(null);
        }
      }, 500);

    } catch (err) {
      alert('Error approving team');
      setApprovingTeam(null);
    }
  };

  const handleSendCertificate = async (member: any) => {
    const pdfBase64 = uploadedCertificates[member.name];
    if (!pdfBase64) return alert('Upload a certificate first!');
    
    if (!member.email) return alert('No email found for this member.');

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'certificate',
          email: member.email,
          name: member.name,
          pdfBase64: pdfBase64
        })
      });
      alert('Certificate sent to ' + member.email);
    } catch (err) {
      alert('Error sending certificate');
    }
  };

  const processImageUpload = (file: File, callback: (base64: string) => void) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => callback(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }
    
    // Image compression
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress heavily for localStorage
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        callback(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-glass)', padding: '2rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem' }}>WX Admin</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Hackathon Dashboard</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, padding: '0 1rem' }}>
          <button 
            className={`flex-center ${activeTab === 'domains' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('domains')}
          >
            <Layers size={20} style={{ marginRight: '1rem' }} /> Manage Domains
          </button>
          
          <button 
            className={`flex-center ${activeTab === 'registrations' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('registrations')}
          >
            <Users size={20} style={{ marginRight: '1rem' }} /> Registrations
          </button>
          
          <button 
            className={`flex-center ${activeTab === 'certificates' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={20} style={{ marginRight: '1rem' }} /> Certificates
          </button>
          
          <button 
            className={`flex-center ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('projects')}
          >
            <FolderOpen size={20} style={{ marginRight: '1rem' }} /> Manage Projects
          </button>
          
          <button 
            className={`flex-center ${activeTab === 'cms' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('cms')}
          >
            <FileText size={20} style={{ marginRight: '1rem' }} /> Content Editor (CMS)
          </button>
          
          <button 
            className={`flex-center ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ justifyContent: 'flex-start', border: 'none', padding: '1rem', width: '100%' }}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} style={{ marginRight: '1rem' }} /> Site Settings
          </button>
        </nav>

        <div style={{ padding: '0 1rem' }}>
          <Link 
            href="/admin/login" 
            onClick={() => sessionStorage.removeItem('wx_admin_auth')}
            className="btn-outline flex-center" 
            style={{ width: '100%', justifyContent: 'center', border: 'none', color: 'var(--secondary)' }}
          >
            <LogOut size={20} style={{ marginRight: '0.5rem' }} /> Logout
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <div className="animate-fade-in">
          
          {/* DOMAINS TAB */}
          {activeTab === 'domains' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Category Domains</h2>
              
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Add New Domain</h3>
                <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Category</label>
                    <select 
                      className="input-field" 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ appearance: 'none' }}
                    >
                      <option value="graphics-video" style={{ background: '#111' }}>Graphics (Video)</option>
                      <option value="graphics-poster" style={{ background: '#111' }}>Graphics (Poster)</option>
                      <option value="frontend" style={{ background: '#111' }}>Frontend</option>
                      <option value="fullstack" style={{ background: '#111' }}>Fullstack</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label className="label">Domain Title</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. HealthTech Dashboard" 
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 1.5rem' }}>
                    <Plus size={20} />
                  </button>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {Object.entries(domains).map(([cat, list]) => (
                  <div key={cat} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h4 style={{ textTransform: 'capitalize', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                      {cat.replace('-', ' ')}
                    </h4>
                    <ul style={{ listStyle: 'none' }}>
                      {list.length === 0 && <li className="text-muted" style={{ fontStyle: 'italic' }}>No domains added.</li>}
                      {list.map((d, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span>{d}</span>
                          <button onClick={() => handleRemoveDomain(cat, idx)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REGISTRATIONS TAB */}
          {activeTab === 'registrations' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Recent Registrations</h2>
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>ID</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Team Lead</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Category</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Domain</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Members</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Payment Info</th>
                      <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length === 0 && <tr><td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center' }}>No registrations found.</td></tr>}
                    {teams.map((team) => (
                      <tr key={team.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '1.5rem' }}>{team.invoice_id || team.id.substring(0,8)}</td>
                        <td style={{ padding: '1.5rem', fontWeight: 600 }}>{team.leadName}</td>
                        <td style={{ padding: '1.5rem', textTransform: 'capitalize' }}>
                          <span style={{ background: 'var(--bg-glass)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                            {team.category}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem' }}>{team.domain}</td>
                        <td style={{ padding: '1.5rem' }}>{team.memberCount}</td>
                        <td style={{ padding: '1.5rem' }}>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>UTR: {team.transaction_id || 'N/A'}</p>
                          {team.payment_screenshot && (
                            <button 
                              onClick={() => setPreviewImage(team.payment_screenshot)} 
                              style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                              View Screenshot
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          {team.is_approved ? (
                            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Approved ✅</span>
                          ) : (
                            <button className="btn-primary" onClick={() => handleApprove(team)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Approve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Certificates</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>Click on a team to expand it and upload specific certificates for each team member.</p>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {teams.length === 0 && <p className="text-muted">No teams found.</p>}
                {teams.map((team) => (
                  <div key={team.id} className="glass-panel" style={{ padding: '1.5rem', border: expandedTeamId === team.id ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Team: {team.teamName}</h3>
                        <p className="text-muted">{team.category} • {team.domain}</p>
                      </div>
                      <div style={{ color: expandedTeamId === team.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {expandedTeamId === team.id ? '▲ Collapse' : '▼ Expand Team Members'}
                      </div>
                    </div>
                    
                    {expandedTeamId === team.id && (
                      <div className="animate-fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {team.members.map((member: any, idx: number) => (
                            <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <h4 style={{ fontSize: '1rem', color: 'white' }}>{member.name}</h4>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>{member.role}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {uploadedCertificates[member.name] ? (
                                  <span style={{ color: '#4ade80', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                    <CheckCircle size={16} style={{ marginRight: '4px' }} /> Uploaded
                                  </span>
                                ) : (
                                  <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>Not Uploaded</span>
                                )}
                                <label className="btn-outline flex-center" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                  Upload PDF/Image
                                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      processImageUpload(e.target.files[0], async (base64) => {
                                        // Save to DB
                                        await supabase.from('member_certificates').insert([{
                                          member_id: member.id,
                                          team_name: team.teamName,
                                          certificate_url: base64
                                        }]);
                                        setUploadedCertificates({...uploadedCertificates, [member.name]: base64});
                                      });
                                    }
                                  }} />
                                </label>
                                {uploadedCertificates[member.name] && (
                                  <button 
                                    className="btn-primary" 
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    onClick={() => handleSendCertificate(member)}
                                  >
                                    Send via Email
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Portfolio Projects</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>These projects are displayed in the interactive slider on the home page.</p>
              
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Add New Project</h3>
                <form onSubmit={handleAddProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label">Project Title</label>
                    <input type="text" required className="input-field" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. AI Dashboard" />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <select className="input-field" value={newProject.company} onChange={(e) => setNewProject({...newProject, company: e.target.value})} style={{ appearance: 'none' }}>
                      <option value="Wiregen AI" style={{ background: '#111' }}>Wiregen AI</option>
                      <option value="Xipra Technology" style={{ background: '#111' }}>Xipra Technology</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Project Gallery (Upload Multiple Images)</label>
                    <input type="file" accept="image/*" multiple className="input-field" onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => {
                          processImageUpload(file, (base64) => {
                            setNewProject(prev => ({...prev, images: [...prev.images, base64]}));
                          });
                        });
                      }
                    }} />
                    {newProject.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                        {newProject.images.map((img, i) => (
                          <img key={i} src={img} alt={`upload-${i}`} style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">External Link (Optional URL)</label>
                    <input type="url" required className="input-field" value={newProject.link} onChange={(e) => setNewProject({...newProject, link: e.target.value})} placeholder="https://..." />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">Project Description</label>
                    <textarea required className="input-field" rows={3} value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} placeholder="Describe the project..."></textarea>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary flex-center">
                      <Plus size={20} style={{ marginRight: '8px' }} /> Add Project
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {projects.length === 0 && <p className="text-muted">No projects added yet.</p>}
                {projects.map((proj) => (
                  <div key={proj.id} className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
                      {proj.images?.map((img, i) => (
                        <img key={i} src={img} alt={proj.title} style={{ width: proj.images.length === 1 ? '100%' : '80%', height: '160px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{proj.title}</h4>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{proj.company}</span>
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--primary)', marginTop: '0.5rem', wordBreak: 'break-all' }}>{proj.link}</a>
                      </div>
                      <button onClick={() => handleRemoveProject(proj.id)} className="btn-outline flex-center" style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'transparent' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CMS TAB */}
          {activeTab === 'cms' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Content Management System (CMS)</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>Edit the text displayed across the entire website from here.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                
                {/* Global Content */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Global Text & Branding</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="label">Navbar Logo Text</label>
                      <input type="text" className="input-field" value={cms.global.logoText} onChange={(e) => setCms({...cms, global: {...cms.global, logoText: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Navbar Logo Image (Overrides Text)</label>
                      <input type="file" accept="image/*" className="input-field" onChange={(e) => {
                        if (e.target.files?.[0]) processImageUpload(e.target.files[0], (b) => setCms({...cms, global: {...cms.global, logoImage: b}}));
                      }} />
                      {cms.global.logoImage && <img src={cms.global.logoImage} alt="Logo" style={{height: '30px', marginTop: '0.5rem'}} />}
                    </div>
                    <div>
                      <label className="label">Host Company 1 Name</label>
                      <input type="text" className="input-field" value={cms.global.company1} onChange={(e) => setCms({...cms, global: {...cms.global, company1: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Host Company 2 Name</label>
                      <input type="text" className="input-field" value={cms.global.company2} onChange={(e) => setCms({...cms, global: {...cms.global, company2: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Total Prize Pool Display Text</label>
                      <input type="text" className="input-field" value={cms.global.prizePool} onChange={(e) => setCms({...cms, global: {...cms.global, prizePool: e.target.value}})} />
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Landing Page: Hero Section</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="label">Hero Main Title (Use HTML &lt;br/&gt; for line breaks)</label>
                      <input type="text" className="input-field" value={cms.hero.title} onChange={(e) => setCms({...cms, hero: {...cms.hero, title: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Hero Subtitle</label>
                      <textarea className="input-field" rows={3} value={cms.hero.subtitle} onChange={(e) => setCms({...cms, hero: {...cms.hero, subtitle: e.target.value}})}></textarea>
                    </div>
                    <div>
                      <label className="label">Hero Background Image</label>
                      <input type="file" accept="image/*" className="input-field" onChange={(e) => {
                        if (e.target.files?.[0]) processImageUpload(e.target.files[0], (b) => setCms({...cms, hero: {...cms.hero, bgImage: b}}));
                      }} />
                      {cms.hero.bgImage && <p style={{fontSize: '0.8rem', color: '#4ade80', marginTop: '0.25rem'}}>Background Image Set.</p>}
                    </div>
                  </div>

                  {/* Hero Slides Gallery */}
                  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label className="label" style={{ marginBottom: 0 }}>Hero Image Slider (Multiple Pics)</label>
                      <button 
                        className="btn-outline flex-center" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => {
                          const newSlide = { id: Date.now().toString(), title: 'New Slide', subtitle: 'Slide subtitle', image: '' };
                          setCms({...cms, hero: {...cms.hero, slides: [...(cms.hero.slides || []), newSlide]}});
                        }}
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} /> Add Slide
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                      {(cms.hero.slides || []).map((slide, idx) => (
                        <div key={slide.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', position: 'relative' }}>
                          <button 
                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem' }}
                            onClick={() => {
                              const updated = [...cms.hero.slides];
                              updated.splice(idx, 1);
                              setCms({...cms, hero: {...cms.hero, slides: updated}});
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          {slide.image ? (
                            <img src={slide.image} alt="slide" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              No Image Uploaded
                            </div>
                          )}
                          
                          <input type="file" accept="image/*" style={{ marginBottom: '0.5rem', width: '100%', fontSize: '0.75rem' }} onChange={(e) => {
                            if (e.target.files?.[0]) {
                              processImageUpload(e.target.files[0], (b) => {
                                const updated = [...cms.hero.slides];
                                updated[idx].image = b;
                                setCms({...cms, hero: {...cms.hero, slides: updated}});
                              });
                            }
                          }} />
                          
                          <input type="text" className="input-field" value={slide.title} placeholder="Title" style={{ marginBottom: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }} onChange={(e) => {
                            const updated = [...cms.hero.slides];
                            updated[idx].title = e.target.value;
                            setCms({...cms, hero: {...cms.hero, slides: updated}});
                          }} />
                          
                          <input type="text" className="input-field" value={slide.subtitle} placeholder="Subtitle" style={{ padding: '0.5rem', fontSize: '0.875rem' }} onChange={(e) => {
                            const updated = [...cms.hero.slides];
                            updated[idx].subtitle = e.target.value;
                            setCms({...cms, hero: {...cms.hero, slides: updated}});
                          }} />
                        </div>
                      ))}
                      {(!cms.hero.slides || cms.hero.slides.length === 0) && (
                        <p className="text-muted" style={{ gridColumn: '1 / -1' }}>No slides added yet. Click 'Add Slide' to upload multiple pictures.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories Content */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Landing Page: Category Specifics</h3>
                  
                  {/* Graphics */}
                  <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Graphics Design</h4>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="label">Description & Rules</label>
                      <input type="text" className="input-field" value={cms.categories.graphics.desc} onChange={(e) => setCms({...cms, categories: {...cms.categories, graphics: {...cms.categories.graphics, desc: e.target.value}}})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="label">1st Prize</label>
                        <input type="text" className="input-field" value={cms.categories.graphics.prize1} onChange={(e) => setCms({...cms, categories: {...cms.categories, graphics: {...cms.categories.graphics, prize1: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">2nd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.graphics.prize2} onChange={(e) => setCms({...cms, categories: {...cms.categories, graphics: {...cms.categories.graphics, prize2: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">3rd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.graphics.prize3} onChange={(e) => setCms({...cms, categories: {...cms.categories, graphics: {...cms.categories.graphics, prize3: e.target.value}}})} />
                      </div>
                    </div>
                  </div>

                  {/* Frontend */}
                  <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Frontend Development</h4>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="label">Description & Rules</label>
                      <input type="text" className="input-field" value={cms.categories.frontend.desc} onChange={(e) => setCms({...cms, categories: {...cms.categories, frontend: {...cms.categories.frontend, desc: e.target.value}}})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="label">1st Prize</label>
                        <input type="text" className="input-field" value={cms.categories.frontend.prize1} onChange={(e) => setCms({...cms, categories: {...cms.categories, frontend: {...cms.categories.frontend, prize1: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">2nd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.frontend.prize2} onChange={(e) => setCms({...cms, categories: {...cms.categories, frontend: {...cms.categories.frontend, prize2: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">3rd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.frontend.prize3} onChange={(e) => setCms({...cms, categories: {...cms.categories, frontend: {...cms.categories.frontend, prize3: e.target.value}}})} />
                      </div>
                    </div>
                  </div>

                  {/* Fullstack */}
                  <div>
                    <h4 style={{ marginBottom: '1rem' }}>Fullstack Development</h4>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="label">Description & Rules</label>
                      <input type="text" className="input-field" value={cms.categories.fullstack.desc} onChange={(e) => setCms({...cms, categories: {...cms.categories, fullstack: {...cms.categories.fullstack, desc: e.target.value}}})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="label">1st Prize</label>
                        <input type="text" className="input-field" value={cms.categories.fullstack.prize1} onChange={(e) => setCms({...cms, categories: {...cms.categories, fullstack: {...cms.categories.fullstack, prize1: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">2nd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.fullstack.prize2} onChange={(e) => setCms({...cms, categories: {...cms.categories, fullstack: {...cms.categories.fullstack, prize2: e.target.value}}})} />
                      </div>
                      <div>
                        <label className="label">3rd Prize</label>
                        <input type="text" className="input-field" value={cms.categories.fullstack.prize3} onChange={(e) => setCms({...cms, categories: {...cms.categories, fullstack: {...cms.categories.fullstack, prize3: e.target.value}}})} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Registration & Other Pages */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Registration Page</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="label">Page Title</label>
                      <input type="text" className="input-field" value={cms.register.hero} onChange={(e) => setCms({...cms, register: {...cms.register, hero: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Subtitle / Instructions</label>
                      <input type="text" className="input-field" value={cms.register.subtext} onChange={(e) => setCms({...cms, register: {...cms.register, subtext: e.target.value}})} />
                    </div>
                  </div>
                </div>

                {/* Certificates */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Certificate Assets</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="label">Certificate Background Image (Upload)</label>
                      <input type="file" accept="image/*" className="input-field" onChange={(e) => {
                        if (e.target.files?.[0]) processImageUpload(e.target.files[0], (b) => setCms({...cms, certificates: {...cms.certificates, bgImage: b}}));
                      }} />
                      {cms.certificates?.bgImage && <p style={{fontSize: '0.8rem', color: '#4ade80', marginTop: '0.25rem'}}>Background Image Set.</p>}
                    </div>
                    <div>
                      <label className="label">Certificate PDF Template (Upload)</label>
                      <input type="file" accept="application/pdf" className="input-field" onChange={(e) => {
                        if (e.target.files?.[0]) processImageUpload(e.target.files[0], (b) => setCms({...cms, certificates: {...cms.certificates, pdfTemplate: b}}));
                      }} />
                      {cms.certificates?.pdfTemplate && <p style={{fontSize: '0.8rem', color: '#4ade80', marginTop: '0.25rem'}}>PDF Template Set.</p>}
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save CMS Content'}
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Site Settings</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Registration Fees (₹)</h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Graphics Design</label>
                    <input type="number" className="input-field" value={fees.graphics} onChange={(e) => setFees({...fees, graphics: Number(e.target.value)})} />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Frontend</label>
                    <input type="number" className="input-field" value={fees.frontend} onChange={(e) => setFees({...fees, frontend: Number(e.target.value)})} />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Fullstack</label>
                    <input type="number" className="input-field" value={fees.fullstack} onChange={(e) => setFees({...fees, fullstack: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Company Info: {cms.global.company1}</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">About Details</label>
                    <textarea className="input-field" rows={4} value={aboutWiregen} onChange={(e) => setAboutWiregen(e.target.value)}></textarea>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Contact Email</label>
                    <input type="email" className="input-field" value={contactWiregen} onChange={(e) => setContactWiregen(e.target.value)} />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--secondary)' }}>Company Info: {cms.global.company2}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label className="label">About Details</label>
                      <textarea className="input-field" rows={4} value={aboutXipra} onChange={(e) => setAboutXipra(e.target.value)}></textarea>
                    </div>
                    <div>
                      <label className="label">Contact Email</label>
                      <input type="email" className="input-field" value={contactXipra} onChange={(e) => setContactXipra(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Payment Configuration</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Upload Payment QR Code</label>
                    <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>This QR code will be displayed to users in the final step of registration.</p>
                    {paymentQr && (
                      <div style={{ marginBottom: '1rem' }}>
                        <img src={paymentQr} alt="Payment QR" style={{ width: '200px', height: '200px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '10px' }} />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processImageUpload(e.target.files[0], (base64) => setPaymentQr(base64));
                        }
                      }} 
                    />
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Hackathon Timeline Settings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label className="label">Hackathon Start Date & Time</label>
                      <input type="datetime-local" className="input-field" value={hackathonStart} onChange={(e) => setHackathonStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Hackathon End Date & Time</label>
                      <input type="datetime-local" className="input-field" value={hackathonEnd} onChange={(e) => setHackathonEnd(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Result Declaration Date & Time</label>
                      <input type="datetime-local" className="input-field" value={resultDate} onChange={(e) => setResultDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* DANGER ZONE */}
                <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ef4444' }}>Danger Zone</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Delete All Project Data</h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        This will permanently delete all student registrations, team members, projects, and generated certificates. Site settings and domains will be preserved.
                      </p>
                    </div>
                    <button 
                      className="btn-primary" 
                      style={{ background: '#ef4444', border: 'none', color: '#fff' }} 
                      onClick={handleDeleteAllData}
                      disabled={isDeletingData}
                    >
                      {isDeletingData ? 'Deleting...' : 'Delete All Data'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden Invoice Template for Admin Approval */}
      {approvingTeam && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '50px 0' }}>
          <div style={{ position: 'absolute', top: '20px', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>Generating Invoice PDF... Do not close.</div>
          <div id="admin-invoice" style={{ width: '800px', background: '#ffffff', color: '#333', fontFamily: 'Arial, sans-serif', marginTop: '40px' }}>
          {/* Header Curve */}
          <div style={{ position: 'relative', background: '#084b83', overflow: 'hidden', height: '180px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(120deg, #043666, #09599a)' }}></div>
            <div style={{ position: 'absolute', bottom: '-40px', left: '-10%', width: '120%', height: '100px', background: '#ffffff', borderRadius: '50%', transform: 'rotate(-2deg)' }}></div>
            <div style={{ position: 'relative', zIndex: 1, padding: '40px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '42px', color: '#ffffff', letterSpacing: '2px' }}>INVOICE</h1>
              <p style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: 'bold' }}>NO: {approvingTeam.invoice_id || approvingTeam.id.substring(0,8)}</p>
            </div>
          </div>

          <div style={{ padding: '40px 50px' }}>
            {/* Bill To & From */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ width: '45%' }}>
                <h3 style={{ fontSize: '20px', color: '#475569', marginBottom: '10px' }}>Bill To:</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#64748b' }}>{approvingTeam.leadName}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#64748b' }}>{approvingTeam.leadEmail}</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>Team: {approvingTeam.teamName} ({approvingTeam.domain})</p>
              </div>
              <div style={{ width: '45%', textAlign: 'right' }}>
                <h3 style={{ fontSize: '20px', color: '#475569', marginBottom: '10px' }}>From:</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#64748b' }}>Wiregen AI & Xipra Technology</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#64748b' }}>Ahmedabad, Gujarat</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>contactxipra@gmail.com</p>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '16px', color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#09599a', color: '#ffffff' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'normal' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'normal' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'normal' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'normal' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {approvingTeam.members.map((m: any, idx: number) => {
                  let baseCategory = approvingTeam.category;
                  if (baseCategory.startsWith('graphics')) baseCategory = 'graphics';
                  let totalFee = fees[baseCategory as keyof typeof fees] || 0;
                  if (baseCategory !== 'graphics') {
                    totalFee = totalFee * (approvingTeam.memberCount || 1);
                  }
                  const perMember = totalFee / (approvingTeam.memberCount || 1);
                  
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#64748b' }}>Registration - {m.name || 'Member'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>1</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>₹{perMember.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>₹{perMember.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Sub Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
              <div style={{ width: '40%', background: '#09599a', color: '#ffffff', padding: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Sub Total</span>
                <span>₹{
                  (() => {
                    let bc = approvingTeam.category;
                    if (bc.startsWith('graphics')) bc = 'graphics';
                    let tf = fees[bc as keyof typeof fees] || 0;
                    if (bc !== 'graphics') tf = tf * (approvingTeam.memberCount || 1);
                    return tf.toFixed(2);
                  })()
                }</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ width: '45%' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Note:</h4>
                  <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', marginBottom: '5px', color: '#64748b', fontSize: '14px' }}>Registration completed.</div>
                  <div style={{ borderBottom: '1px solid #cbd5e1', height: '20px' }}></div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Payment Information:</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}><strong>Method:</strong> UPI / QR Scan</p>
                  <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px' }}><strong>Status:</strong> Verified & Approved</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}><strong>Email:</strong> contactxipra@gmail.com</p>
                </div>
              </div>
              <div style={{ width: '45%', textAlign: 'right' }}>
                <h2 style={{ fontSize: '42px', color: '#09599a', margin: 0 }}>Thank You!</h2>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ position: 'relative', background: 'var(--bg-dark)', padding: '2rem', borderRadius: '12px', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Payment Screenshot</h3>
            <img src={previewImage} alt="Payment Preview" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            <button className="btn-primary" onClick={() => setPreviewImage(null)} style={{ marginTop: '1.5rem', alignSelf: 'center' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
