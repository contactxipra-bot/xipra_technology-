"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Palette, TerminalSquare, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Using dynamic slides from CMS now, fallback if empty

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

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [cms, setCms] = useState(defaultCMS);
  const [settings, setSettings] = useState<any>(null);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timerStatus, setTimerStatus] = useState<'LOADING' | 'WAITING' | 'LIVE' | 'ENDED'>('LOADING');

  useEffect(() => {
    if (!settings) return;
    
    if (!settings.hackathon_start || !settings.hackathon_end) {
      setTimerStatus('LOADING');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(settings.hackathon_start).getTime();
      const end = new Date(settings.hackathon_end).getTime();

      if (now > end) {
        setTimerStatus('ENDED');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else if (now >= start && now <= end) {
        setTimerStatus('LIVE');
        const distance = end - now;
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimerStatus('WAITING');
        const distance = start - now;
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]);

  useEffect(() => {
    async function loadData() {
      // Load projects
      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projData && projData.length > 0) {
        setProjects(projData);
      } else {
        // Fallback default projects if none exist yet
        setProjects([
          { id: '1', title: 'AI Analytics Dashboard', company: 'Wiregen AI', images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600'], link: 'https://wiregen.ai' },
          { id: '2', title: 'Enterprise Portal', company: 'Xipra Technology', images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'], link: 'https://xipratech.com' }
        ]);
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

      // Load Settings
      const { data: settingsData } = await supabase.from('site_settings').select('*').limit(1).single();
      if (settingsData) {
        setSettings(settingsData);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (cms.hero.slides?.length || 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [cms.hero.slides]);

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <div className="nav-logo text-gradient">
            {cms.global.logoImage ? <img src={cms.global.logoImage} alt="Logo" style={{height: '32px'}} /> : cms.global.logoText}
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/register" className="nav-link">Register</Link>
            <Link href="/portal" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Student Portal</Link>
            <Link href="/certificate" className="nav-link">Certificate</Link>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{
        backgroundImage: cms.hero.bgImage ? `url(${cms.hero.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: cms.hero.bgImage ? 'rgba(0,0,0,0.7)' : 'transparent'
      }}>
        {!cms.hero.bgImage && (
          <>
            <div className="hero-bg-glow"></div>
            <div className="hero-bg-glow-2"></div>
          </>
        )}
        
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in" dangerouslySetInnerHTML={{ __html: cms.hero.title }}></h1>
            <p className="hero-subtitle animate-fade-in delay-100">
              {cms.hero.subtitle}
            </p>
            

            
            <div className="hero-buttons animate-fade-in delay-200">
              <Link href="/register" className="btn-primary flex-center">
                Register Now <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Link>
              <a href="#categories" className="btn-outline flex-center">
                View Categories
              </a>
            </div>

            <div className="stats-container animate-fade-in delay-300" style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>{cms.global.prizePool}</h3>
                <p className="text-muted">Prize Pool</p>
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>{cms.global.categoriesCount}</h3>
                <p className="text-muted">Main Categories</p>
              </div>
            </div>
          </div>
          
          <div className="hero-slider animate-fade-in delay-200">
            <div className="slider-container">
              <div 
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {(cms.hero.slides || []).map((slide) => (
                  <div key={slide.id} className="slide">
                    <img src={slide.image || ''} alt={slide.title} className="slide-img" />
                    <div className="slide-overlay">
                      <h3 className="slide-title">{slide.title}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.8)' }}>{slide.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Slider Dots */}
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                {(cms.hero.slides || []).map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: currentSlide === idx ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="container" style={{ padding: '6rem 2rem' }}>
        {/* Hackathon Timeline Countdown */}
        {settings && (
          <div className="animate-fade-in delay-150" style={{ maxWidth: '600px', margin: '0 auto 4rem auto', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            {(!settings.hackathon_start || !settings.hackathon_end) ? (
              <h4 style={{ color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>
                Hackathon Dates To Be Announced Soon
              </h4>
            ) : (
              <>
                <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.875rem' }}>
                  {timerStatus === 'WAITING' ? 'Hackathon Starts In' : timerStatus === 'LIVE' ? 'Hackathon Ends In' : 'Hackathon Ended'}
                </h4>
                
                {timerStatus !== 'ENDED' && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Mins', value: timeLeft.minutes },
                      { label: 'Secs', value: timeLeft.seconds }
                    ].map((time, idx) => (
                      <div key={idx} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '1rem 0.5rem', borderRadius: '8px', textAlign: 'center', minWidth: '70px', maxWidth: '100px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#fff' }}>
                          {String(time.value).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', marginTop: '0.25rem' }}>{time.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {settings.result_date && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                      <strong>Result Declaration:</strong> <br/>
                      <span style={{ color: '#fff', fontSize: '1.1rem' }}>{new Date(settings.result_date).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Hackathon <span className="text-gradient">Categories</span></h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>Select your domain of expertise and compete with the best.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Palette size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Graphics Design</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{cms.categories.graphics.desc}</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prizes</h4>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#ffd700' }}>🏆</span> 1st: {cms.categories.graphics.prize1}</li>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#c0c0c0' }}>🥈</span> 2nd: {cms.categories.graphics.prize2}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#cd7f32' }}>🥉</span> 3rd: {cms.categories.graphics.prize3}</li>
              </ul>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '2rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronRight size={16} className="text-gradient"/> Video / Poster</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Code size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Frontend Development</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{cms.categories.frontend.desc}</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prizes</h4>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#ffd700' }}>🏆</span> 1st: {cms.categories.frontend.prize1}</li>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#c0c0c0' }}>🥈</span> 2nd: {cms.categories.frontend.prize2}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#cd7f32' }}>🥉</span> 3rd: {cms.categories.frontend.prize3}</li>
              </ul>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '2rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronRight size={16} className="text-gradient"/> Modern Web UI</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <TerminalSquare size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Fullstack Development</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{cms.categories.fullstack.desc}</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Prizes</h4>
              <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#ffd700' }}>🏆</span> 1st: {cms.categories.fullstack.prize1}</li>
                <li style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#c0c0c0' }}>🥈</span> 2nd: {cms.categories.fullstack.prize2}</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#cd7f32' }}>🥉</span> 3rd: {cms.categories.fullstack.prize3}</li>
              </ul>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '2rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronRight size={16} className="text-gradient"/> DB, API & Client</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Projects Slider Section */}
      <section className="container" style={{ padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our <span className="text-gradient">Projects</span></h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>A glimpse into the innovative solutions built by our companies.</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollbarWidth: 'none' }}>
          {projects.map(proj => (
            <Link 
              key={proj.id} 
              href={`/project/${proj.id}`}
              className="glass-panel" 
              style={{ minWidth: '350px', padding: '1rem', flexShrink: 0, textDecoration: 'none', display: 'block', transition: 'transform 0.2s ease', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={proj.images?.[0] || proj.image} alt={proj.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: proj.company === 'Wiregen AI' ? 'var(--primary)' : 'var(--secondary)' }}>{proj.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{proj.company}</p>
              <p className="text-muted" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click to view project <ArrowRight size={12} style={{display: 'inline', verticalAlign: 'middle'}}/></p>
            </Link>
          ))}
        </div>
      </section>

      {/* About Us / Company Details Section */}
      <section className="container" style={{ padding: '4rem 2rem 6rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{cms.global.company1}</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {settings?.about_wiregen || "Wiregen AI specializes in creating cutting-edge artificial intelligence solutions. Our mission is to automate complex workflows and provide actionable insights through advanced machine learning models."}
            </p>
            <div style={{ marginTop: 'auto' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Contact</p>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Email: {settings?.contact_wiregen || 'contact@wiregen.ai'}
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', borderLeft: '4px solid var(--secondary)' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{cms.global.company2}</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {settings?.about_xipra || "Xipra Technology builds robust, scalable enterprise software. We empower businesses with modern web architectures, secure infrastructures, and seamless digital transformations."}
            </p>
            <div style={{ marginTop: 'auto' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Contact</p>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Email: {settings?.contact_xipra || 'xipratechnology@gmail.com'}
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
