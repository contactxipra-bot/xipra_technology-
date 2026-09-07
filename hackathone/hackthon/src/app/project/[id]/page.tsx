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
      const { data, error } = await supabase.from('projects').select('*').eq('id', resolvedParams.id).single();
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
      <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>We couldn't find the project you're looking for.</p>
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
          <Link href="/" className="nav-logo text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} /> Back
          </Link>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', overflow: 'hidden' }}>
          
          {project.images && project.images.length > 0 ? (
            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', scrollbarWidth: 'none', background: 'rgba(0,0,0,0.5)' }}>
              {project.images.map((img: string, idx: number) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${project.title} ${idx+1}`} 
                  style={{ width: project.images.length === 1 ? '100%' : '90%', height: '450px', objectFit: 'cover', flexShrink: 0 }}
                />
              ))}
            </div>
          ) : (
            <img 
              src={project.image} 
              alt={project.title} 
              style={{ width: '100%', height: '450px', objectFit: 'cover' }}
            />
          )}

          <div style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ 
                    background: isWiregen ? 'rgba(236,72,153,0.1)' : 'rgba(99,102,241,0.1)', 
                    color: isWiregen ? 'var(--primary)' : 'var(--secondary)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.875rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Building2 size={14} /> {project.company}
                  </span>
                </div>
                
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{project.title}</h1>
              </div>

              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={isWiregen ? "btn-primary flex-center" : "btn-outline flex-center"}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Visit Project <ExternalLink size={18} style={{ marginLeft: '8px' }} />
                </a>
              )}
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this Project</h3>
              <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '1.125rem' }}>
                {project.description || "No description provided for this project yet."}
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
