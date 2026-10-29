"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      const { data } = await supabase.from('projects').select('*').eq('id', resolvedParams.id).single();
      if (data) {
        setProject(data);
      }
      setLoading(false);
    }
    loadProject();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh' }}>
        <p className="text-muted">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', textAlign: 'center', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem' }}>Project Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>We couldn&apos;t find the project you&apos;re looking for.</p>
        <button onClick={() => router.push('/')} className="btn-primary flex-center">
          <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Home
        </button>
      </div>
    );
  }

  const isWiregen = project.company === 'Wiregen AI';

  return (
    <>
      <nav className="navbar" style={{ position: 'relative' }}>
        <div className="container nav-content">
          <Link href="/" className="nav-logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <ArrowLeft size={18} /> Back
          </Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '2.5rem 1rem 4rem' }}>
        <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', overflow: 'hidden' }}>
          
          {project.images && project.images.length > 0 ? (
            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', scrollbarWidth: 'none', background: 'rgba(0,0,0,0.5)', WebkitOverflowScrolling: 'touch' }}>
              {project.images.map((img: string, idx: number) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${project.title} ${idx+1}`} 
                  style={{ width: project.images.length === 1 ? '100%' : 'min(90%, 650px)', height: 'clamp(240px, 45vw, 450px)', objectFit: 'cover', flexShrink: 0 }}
                />
              ))}
            </div>
          ) : (
            <img 
              src={project.image} 
              alt={project.title} 
              style={{ width: '100%', height: 'clamp(240px, 45vw, 450px)', objectFit: 'cover' }}
            />
          )}

          <div style={{ padding: 'clamp(1.25rem, 4vw, 3rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ 
                    background: isWiregen ? 'rgba(236,72,153,0.1)' : 'rgba(99,102,241,0.1)', 
                    color: isWiregen ? 'var(--primary)' : 'var(--secondary)', 
                    padding: '0.35rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Building2 size={14} /> {project.company}
                  </span>
                </div>
                
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{project.title}</h1>
              </div>

              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={isWiregen ? "btn-primary flex-center" : "btn-outline flex-center"}
                  style={{ whiteSpace: 'nowrap', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Visit Project <ExternalLink size={16} style={{ marginLeft: '6px' }} />
                </a>
              )}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>About this Project</h3>
              <p className="text-muted" style={{ lineHeight: 1.7, fontSize: '1rem' }}>
                {project.description || "No description provided for this project yet."}
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}