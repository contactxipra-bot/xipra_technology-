"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Users, Monitor, PenTool, CreditCard, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Category = 'graphics' | 'frontend' | 'fullstack';
type Subcategory = 'video' | 'poster' | null;

export default function Register() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory>(null);
  const [domain, setDomain] = useState<string>('');
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [members, setMembers] = useState([{ name: '', email: '', phone: '', college: '' }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentQr, setPaymentQr] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');

  // When category/subcategory changes, adjust max team size
  useEffect(() => {
    if (category === 'graphics') {
      setTeamSize(1);
      setMembers([{ name: '', email: '', phone: '', college: '' }]);
    } else if (category === 'frontend') {
      if (teamSize > 2) setTeamSize(2);
    } else if (category === 'fullstack') {
      if (teamSize > 4) setTeamSize(4);
    }
  }, [category, subcategory, teamSize]);

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addMember = () => {
    const max = category === 'graphics' ? 1 : category === 'frontend' ? 2 : 4;
    if (members.length < max) {
      setMembers([...members, { name: '', email: '', phone: '', college: '' }]);
      setTeamSize(members.length + 1);
    }
  };

  const removeMember = (index: number) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    setTeamSize(updated.length);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const processPayment = async () => {
    setIsSubmitting(true);
    
    // 1. Create Registration
    const fullCategory = category === 'graphics' ? `graphics-${subcategory}` : category;
    const generatedTeamNumber = 'HN-' + Math.floor(1000 + Math.random() * 9000);

    const { data: regData, error: regError } = await supabase.from('registrations').insert([{
      team_name: teamName,
      category: fullCategory,
      domain: domain,
      transaction_id: transactionId || 'N/A',
      payment_screenshot: paymentScreenshot,
      invoice_id: generatedTeamNumber
    }]).select();

    if (regError || !regData) {
      alert("Registration failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const regId = regData[0].id;

    // 2. Add Team Members
    const membersToInsert = members.map((m, index) => ({
      registration_id: regId,
      full_name: m.name,
      email: m.email,
      phone: m.phone,
      college: m.college,
      is_leader: index === 0
    }));

    const { error: memError } = await supabase.from('team_members').insert(membersToInsert);

    if (memError) {
      alert("Error saving team members.");
      setIsSubmitting(false);
      return;
    }

    // Success
    setInvoiceId(generatedTeamNumber);
    setIsPaymentSuccess(true);
    setStep(5);
    setIsSubmitting(false);
  };

  const downloadInvoice = async () => {
    const invoiceElement = document.getElementById('invoice');
    if (invoiceElement) {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin: 0.5,
          filename: `${invoiceId}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };
        html2pdf().from(invoiceElement).set(opt).save();
      } catch {
        window.print(); // Fallback
      }
    } else {
      window.print();
    }
  };

  const getAvailableDomains = () => {
    const catSearch = category === 'graphics' ? `graphics-${subcategory}` : category;
    return availableDomains.filter(d => d.category === catSearch).map(d => d.title);
  };

  const [dynamicFees, setDynamicFees] = useState({ graphics: 500, frontend: 800, fullstack: 1000 });
  const [cms, setCms] = useState({
    register: {
      hero: 'Register for WX Hackathon',
      subtext: 'Join the ultimate coding competition and showcase your skills.'
    }
  });

  useEffect(() => {
    async function loadData() {
      // Load fees
      const { data: settings } = await supabase.from('site_settings').select('fee_graphics, fee_frontend, fee_fullstack, payment_qr').limit(1).maybeSingle();
      if (settings) {
        setDynamicFees({
          graphics: settings.fee_graphics,
          frontend: settings.fee_frontend,
          fullstack: settings.fee_fullstack
        });
        if (settings.payment_qr) setPaymentQr(settings.payment_qr);
      }

      // Load CMS
      const { data: cmsData } = await supabase.from('site_content').select('*').eq('section', 'register').limit(1).maybeSingle();
      if (cmsData) {
        setCms(prev => ({...prev, register: cmsData.content}));
      }

      // Load Domains
      const { data: domData } = await supabase.from('domains').select('*');
      if (domData) setAvailableDomains(domData);
    }
    loadData();
  }, []);

  const getRegistrationFee = () => {
    if (category === 'graphics') return dynamicFees.graphics;
    if (category === 'frontend') return dynamicFees.frontend * members.length;
    if (category === 'fullstack') return dynamicFees.fullstack * members.length;
    return 0;
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
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="animate-fade-in">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{cms.register.hero}</h1>
          <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>{cms.register.subtext}</p>
        </div>

        <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          
          {step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--border-glass)', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 0, transition: 'all 0.3s ease' }}></div>
              
              {[1, 2, 3, 4].map((num) => (
                <div key={num} style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: step >= num ? 'var(--primary)' : 'var(--bg-dark)',
                  border: `2px solid ${step >= num ? 'var(--primary)' : 'var(--border-glass)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                  transition: 'all 0.3s ease',
                  color: step >= num ? 'white' : 'var(--text-muted)',
                  fontWeight: 'bold'
                }}>
                  {num}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Choose Your Category</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div 
                  className="glass-panel" 
                  style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: category === 'graphics' ? '2px solid var(--primary)' : '1px solid var(--border-glass)' }}
                  onClick={() => { setCategory('graphics'); setSubcategory(null); }}
                >
                  <PenTool size={32} style={{ margin: '0 auto 1rem', color: category === 'graphics' ? 'var(--primary)' : 'white' }} />
                  <h3>Graphics Design</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>1 Member</p>
                </div>
                
                <div 
                  className="glass-panel" 
                  style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: category === 'frontend' ? '2px solid var(--primary)' : '1px solid var(--border-glass)' }}
                  onClick={() => { setCategory('frontend'); setSubcategory(null); }}
                >
                  <Monitor size={32} style={{ margin: '0 auto 1rem', color: category === 'frontend' ? 'var(--primary)' : 'white' }} />
                  <h3>Frontend</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Up to 2 Members</p>
                </div>
                
                <div 
                  className="glass-panel" 
                  style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: category === 'fullstack' ? '2px solid var(--primary)' : '1px solid var(--border-glass)' }}
                  onClick={() => { setCategory('fullstack'); setSubcategory(null); }}
                >
                  <Users size={32} style={{ margin: '0 auto 1rem', color: category === 'fullstack' ? 'var(--primary)' : 'white' }} />
                  <h3>Fullstack</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Up to 4 Members</p>
                </div>
              </div>

              {category === 'graphics' && (
                <div className="animate-fade-in delay-100" style={{ marginBottom: '2rem' }}>
                  <label className="label">Select Subcategory</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button"
                      className={subcategory === 'video' ? 'btn-primary' : 'btn-outline'} 
                      style={{ flex: 1 }}
                      onClick={() => setSubcategory('video')}
                    >
                      Video Editing
                    </button>
                    <button 
                      type="button"
                      className={subcategory === 'poster' ? 'btn-primary' : 'btn-outline'} 
                      style={{ flex: 1 }}
                      onClick={() => setSubcategory('poster')}
                    >
                      Poster Design
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-primary" 
                  disabled={!category || (category === 'graphics' && !subcategory)}
                  style={{ opacity: (!category || (category === 'graphics' && !subcategory)) ? 0.5 : 1 }}
                  onClick={() => setStep(2)}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Domain Selection */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Select Problem Domain</h2>
              <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                These are the domains provided by the admins for {category} {subcategory ? `(${subcategory})` : ''}.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' }}>
                {getAvailableDomains().map((d) => (
                  <div 
                    key={d} 
                    className="glass-panel"
                    style={{ 
                      padding: '1.5rem', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: domain === d ? '2px solid var(--primary)' : '1px solid var(--border-glass)'
                    }}
                    onClick={() => setDomain(d)}
                  >
                    <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{d}</span>
                    {domain === d && <Check className="text-gradient" />}
                  </div>
                ))}
                
                {getAvailableDomains().length === 0 && (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="text-muted">No domains configured by admin yet.</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  disabled={!domain}
                  style={{ opacity: !domain ? 0.5 : 1 }}
                  onClick={() => setStep(3)}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Registration Form */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Team Details</h2>
              <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Category: <strong style={{color: 'white', textTransform: 'capitalize'}}>{category} {subcategory ? `(${subcategory})` : ''}</strong> | 
                Domain: <strong style={{color: 'white'}}>{domain}</strong>
              </p>

              <form onSubmit={submitForm}>
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)' }}>
                  <label className="label" style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.5rem' }}>Team Name *</label>
                  <input required className="input-field" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. CodeNinjas" style={{ background: 'rgba(0,0,0,0.4)' }} />
                </div>

                {members.map((member, index) => (
                  <div key={index} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.25rem', color: index === 0 ? 'var(--primary)' : 'white' }}>
                        {index === 0 ? (category === 'graphics' ? 'Participant Details' : 'Team Leader Details') : `Team Member ${index + 1}`}
                      </h4>
                      {index > 0 && (
                        <button type="button" onClick={() => removeMember(index)} style={{ color: 'var(--secondary)', background: 'transparent', fontSize: '0.875rem' }}>
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="label">Full Name *</label>
                        <input required className="input-field" type="text" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input required className="input-field" type="email" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="label">Phone Number *</label>
                        <input required className="input-field" type="tel" value={member.phone} onChange={(e) => handleMemberChange(index, 'phone', e.target.value)} placeholder="+91 9876543210" />
                      </div>
                      <div>
                        <label className="label">College Name *</label>
                        <input required className="input-field" type="text" value={member.college} onChange={(e) => handleMemberChange(index, 'college', e.target.value)} placeholder="University Name" />
                      </div>
                    </div>
                  </div>
                ))}

                {((category === 'frontend' && members.length < 2) || (category === 'fullstack' && members.length < 4)) && (
                  <button type="button" className="btn-outline" style={{ width: '100%', marginBottom: '2rem', borderStyle: 'dashed' }} onClick={addMember}>
                    + Add Team Member (Max {(category === 'frontend') ? 2 : 4})
                  </button>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn-outline" onClick={() => setStep(2)}>Back</button>
                  <button type="submit" className="btn-primary">
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Premium Payment Checkout */}
          {step === 4 && (
            <div className="animate-fade-in text-center">
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>Complete Registration</h2>
              <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '1.125rem' }}>Scan the QR code to secure your team&apos;s spot.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
                {/* Left side: Order Summary */}
                <div className="glass-panel" style={{ padding: '2.5rem', flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span className="text-muted">Team Name</span>
                    <span style={{ fontWeight: 600 }}>{teamName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span className="text-muted">Category</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span className="text-muted">Team Members</span>
                    <span style={{ fontWeight: 600 }}>{members.length}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                    <span>Total Amount</span>
                    <span className="text-gradient" style={{ fontWeight: 'bold' }}>₹{getRegistrationFee()}</span>
                  </div>
                </div>

                {/* Right side: QR & Verification */}
                <div className="glass-panel" style={{ padding: '2.5rem', flex: '1', minWidth: '300px', maxWidth: '400px', background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(99,102,241,0.05))', border: '1px solid rgba(236,72,153,0.2)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Scan to Pay</h3>
                  
                  <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    {paymentQr ? (
                      <img src={paymentQr} alt="Payment QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#888', borderRadius: '8px', textAlign: 'center', padding: '1rem' }}>
                        QR Code not configured by admin. Please contact support.
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <label className="label" style={{ fontSize: '0.875rem' }}>Upload Payment Screenshot</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPaymentScreenshot(ev.target?.result as string);
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
                    />
                    {/* Transaction ID removed as requested */}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn-outline" onClick={() => setStep(3)} style={{ padding: '0 2rem' }}>Back</button>
                <button 
                  className="btn-primary flex-center" 
                  onClick={processPayment} 
                  disabled={isSubmitting || !paymentScreenshot}
                  style={{ minWidth: '250px', padding: '1rem', fontSize: '1.125rem', visibility: paymentScreenshot ? 'visible' : 'hidden' }}
                >
                  {isSubmitting ? 'Verifying...' : <><Check size={20} style={{ marginRight: '8px' }}/> I have paid ₹{getRegistrationFee()}</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success & Invoice */}
          {step === 5 && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Check size={40} />
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Registration Under Review</h2>
                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                  Your team number is <strong style={{ color: '#fff', fontSize: '1.5rem' }}>{invoiceId}</strong><br/>
                  Please save this number to track your team&apos;s status in the Student Portal.
                </p>
                <p className="text-muted">Your team is officially registered for the hackathon.</p>
              </div>

              {/* Premium Corporate Invoice Template (Printable/Downloadable) */}
              <div id="invoice" style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', padding: '40px', background: '#ffffff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #4f46e5', paddingBottom: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <img src="/wiregen-logo.png" alt="Wiregen AI" style={{ height: '50px' }} crossOrigin="anonymous" />
                    <img src="/xipra-logo.png" alt="Xipra Technology" style={{ height: '50px' }} crossOrigin="anonymous" />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#1e293b', letterSpacing: '2px' }}>TAX INVOICE</h1>
                    <h3 style={{ margin: '5px 0 0 0', color: '#4f46e5', fontSize: '14px', letterSpacing: '1px' }}>REGISTRATION RECEIPT</h3>
                  </div>
                </div>

                {/* Company & Invoice Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Organized By:</h4>
                    <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '16px' }}>Wiregen AI & Xipra Technology</p>
                    <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#334155' }}>Ahmedabad, Gujarat, India</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>contactxipra@gmail.com</p>
                  </div>
                  <div style={{ textAlign: 'right', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <table style={{ textAlign: 'left', fontSize: '14px' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: '#64748b', paddingRight: '20px', paddingBottom: '5px' }}>Invoice No:</td>
                          <td style={{ fontWeight: 'bold' }}>{invoiceId}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', paddingRight: '20px', paddingBottom: '5px' }}>Date:</td>
                          <td style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', paddingRight: '20px' }}>Status:</td>
                          <td style={{ fontWeight: 'bold', color: '#eab308' }}>Pending Approval</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Billed To */}
                <div style={{ marginBottom: '30px', borderLeft: '4px solid #ec4899', paddingLeft: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Billed To:</h4>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>Team {teamName}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px' }}><strong>Lead:</strong> {members[0].name} ({members[0].email})</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px' }}><strong>College:</strong> {members[0].college}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px' }}><strong>Domain:</strong> {domain}</p>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                      <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '14px' }}>No.</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '14px' }}>Participant Name</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '14px' }}>Role</th>
                      <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '14px' }}>Fee (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 15px', fontSize: '14px', color: '#475569' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                        <td style={{ padding: '12px 15px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{m.name || 'Pending'}</td>
                        <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'center', color: '#475569' }}>{idx === 0 ? 'Leader' : 'Member'}</td>
                        <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right', color: '#0f172a' }}>₹{(getRegistrationFee() / members.length).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}></td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Subtotal:</td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#0f172a', borderBottom: '2px solid #e2e8f0' }}>₹{getRegistrationFee()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '15px' }}></td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>Total Amount:</td>
                      <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '20px', color: '#4f46e5' }}>₹{getRegistrationFee()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Notes & Signature */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '50px' }}>
                  <div style={{ maxWidth: '60%' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#0f172a' }}>Terms & Conditions</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
                      1. This is a computer-generated invoice and does not require a physical signature.<br/>
                      2. Registration fees are non-refundable.<br/>
                      3. Participation is subject to the final approval of the payment and identity verification.
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '10px', height: '40px' }}></div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Authorized Signatory</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Hacknexus Organizing Committee</p>
                  </div>
                </div>
              </div>

              {/* Hide these buttons when printing via CSS media print */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * { visibility: hidden; }
                  #invoice, #invoice * { visibility: visible; }
                  #invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
                }
              `}} />

              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn-outline flex-center" onClick={downloadInvoice}>
                  <Download size={20} style={{ marginRight: '8px' }} /> Download Invoice
                </button>
                <a 
                  href={`https://wa.me/919033387254?text=${encodeURIComponent(`Dear Sir,\n\nOur payment is done. Please approve our registration.\n\nTeam Name: ${teamName}\nTeam ID: ${invoiceId}\n\nPlease find our payment screenshot attached.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-center"
                  style={{ background: '#25D366', color: '#fff', border: 'none' }}
                >
                  Share Screenshot on WhatsApp
                </a>
                <Link href="/" className="btn-primary flex-center">Return to Home</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
