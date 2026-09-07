"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Award, Download, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Removed MOCK_TEAMS

export default function CertificatePortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [teamData, setTeamData] = useState<any | null>(null);

  const [cms, setCms] = useState({
    global: { company1: 'Wiregen AI', company2: 'Xipra Technology' },
    certificates: { bgImage: '', pdfTemplate: '' }
  });

  useEffect(() => {
    async function loadData() {
      const { data: cmsData } = await supabase.from('site_content').select('*');
      if (cmsData) {
        const newCms = { global: { company1: 'Wiregen AI', company2: 'Xipra Technology' }, certificates: { bgImage: '', pdfTemplate: '' } };
        cmsData.forEach(row => {
          if (row.section === 'global') newCms.global = row.content;
          if (row.section === 'certificates') newCms.certificates = row.content;
        });
        setCms(newCms);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    // Search registrations
    const { data: regData } = await supabase.from('registrations').select('*').ilike('team_name', searchTerm).single();
    if (regData) {
      const { data: memData } = await supabase.from('team_members').select('*').eq('registration_id', regData.id);
      const { data: certData } = await supabase.from('member_certificates').select('*').eq('team_name', regData.team_name);
      
      if (memData) {
         setTeamData({
           teamName: regData.team_name,
           category: regData.category,
           members: memData.map(m => {
             const cert = certData?.find(c => c.member_id === m.id);
             return {
               name: m.full_name,
               role: m.is_leader ? 'Team Leader' : 'Member',
               customCertificate: cert?.certificate_url
             }
           })
         });
      }
    } else {
      setTeamData(null);
    }
  };

  const printCertificate = (memberName: string, category: string) => {
    // In a real app, this might open a new window with a pure PDF template or use a library like jsPDF.
    // For this mockup, we'll trigger a print action on a hidden template.
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate of Participation - ${memberName}</title>
            <style>
              body { font-family: 'Arial', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f0f0; -webkit-print-color-adjust: exact; }
              .certificate { 
                width: 800px; height: 600px; padding: 40px; 
                background: ${cms.certificates?.bgImage ? `url(${cms.certificates.bgImage}) center/cover no-repeat` : 'white'}; 
                border: ${cms.certificates?.bgImage ? 'none' : '15px solid #6366f1'}; 
                text-align: center; position: relative; box-sizing: border-box; 
              }
              .header { font-size: 32px; color: #6366f1; font-weight: bold; margin-bottom: 20px; }
              .sub-header { font-size: 20px; color: #333; margin-bottom: 40px; }
              .name { font-size: 40px; font-weight: bold; color: #ec4899; margin-bottom: 20px; border-bottom: 2px solid #ccc; display: inline-block; padding: 0 40px 10px; }
              .text { font-size: 18px; color: #555; margin-bottom: 40px; line-height: 1.6; }
              .logos { position: absolute; bottom: 40px; width: calc(100% - 80px); display: flex; justify-content: space-between; align-items: center; }
              .signature { border-top: 1px solid #333; padding-top: 10px; width: 200px; margin: 0 auto; margin-top: 60px;}
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="header">CERTIFICATE OF PARTICIPATION</div>
              <div class="sub-header">PROUDLY PRESENTED TO</div>
              
              <div class="name">${memberName}</div>
              
              <div class="text">
                For successfully participating in the WX Hackathon<br/>
                in the <strong>${category}</strong> category.<br/>
                We appreciate your dedication, skills, and innovative spirit!
              </div>

              <div class="signature">
                Admin Signature
              </div>

              <div class="logos">
                <h3 style="color:#333; margin:0; background: rgba(255,255,255,0.8); padding: 5px;">${cms.global.company1}</h3>
                <h3 style="color:#333; margin:0; background: rgba(255,255,255,0.8); padding: 5px;">${cms.global.company2}</h3>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <nav className="navbar" style={{ position: 'relative' }}>
        <div className="container nav-content">
          <Link href="/" className="nav-logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="container" style={{ padding: '4rem 2rem', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Award size={40} />
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Download <span className="text-gradient">Certificates</span></h1>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Enter your registered Team Name below to access the official participation certificates for all members.
          </p>
        </div>

        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 3rem', padding: '2rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. CodeNinjas" 
                style={{ paddingLeft: '3rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>

        {hasSearched && (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {teamData ? (
              <div className="glass-panel" style={{ padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{teamData.teamName}</h2>
                    <p className="text-muted">Category: <strong style={{ color: 'white' }}>{teamData.category}</strong></p>
                  </div>
                  <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Hackathon Completed
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {teamData.members.map((member: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{member.name}</h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>{member.role}</p>
                      </div>
                      
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        {member.customCertificate ? (
                          <a 
                            href={member.customCertificate}
                            download={`Certificate_${member.name}.pdf`}
                            className="btn-outline flex-center"
                            style={{ border: '1px solid var(--primary)', color: 'var(--text-main)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={18} style={{ marginRight: '8px', color: 'var(--primary)' }} /> View Uploaded
                          </a>
                        ) : (
                          <button 
                            className="btn-outline flex-center"
                            style={{ border: '1px solid var(--primary)', color: 'var(--text-main)' }}
                            onClick={() => printCertificate(member.name, teamData.category)}
                          >
                            <Download size={18} style={{ marginRight: '8px', color: 'var(--primary)' }} /> Print Generated
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Team Not Found</h3>
                <p className="text-muted">We couldn't find a team with that name. Please check the spelling or ensure the admin has generated your certificates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
