'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, Clock } from 'lucide-react';
import JSZip from 'jszip';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StudentPortal() {
  const [teamNumber, setTeamNumber] = useState('');
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const fetchTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error } = await supabase
      .from('registrations')
      .select('*, team_members(full_name)')
      .eq('invoice_id', teamNumber.trim())
      .single();

    if (error || !data) {
      setError('Team not found. Please check your team number.');
      setTeam(null);
    } else {
      setTeam(data);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !team) return;

    setUploading(true);
    setUploadProgress('Preparing files...');
    
    try {
      // 1. Bundle files into ZIP
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // @ts-ignore - webkitRelativePath exists on File objects from directory inputs
        const filePath = file.webkitRelativePath || file.name;
        zip.file(filePath, file);
      }
      
      setUploadProgress('Compressing folder...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Convert to Base64
      setUploadProgress('Encrypting for upload...');
      const reader = new FileReader();
      reader.readAsDataURL(zipBlob);
      
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        setUploadProgress('Uploading to Google Drive (This may take a minute)...');
        
        const safeTeamName = team.team_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const zipFileName = `${team.invoice_id}_${safeTeamName}_project.zip`;

        const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
        
        if (!scriptUrl) {
          alert("Admin has not configured the Google Apps Script URL yet.");
          setUploading(false);
          return;
        }

        const res = await fetch(scriptUrl, {
          method: 'POST',
          body: JSON.stringify({
            fileName: zipFileName,
            mimeType: 'application/zip',
            fileBase64: base64data
          })
        });

        const data = await res.json();
        
        if (data.success) {
          setUploadSuccess(true);
          // Save the drive link in database
          await supabase
            .from('registrations')
            .update({ project_url: data.webViewLink })
            .eq('id', team.id);
            
          setTeam({...team, project_url: data.webViewLink});
        } else {
          alert('Upload failed: ' + data.error);
        }
        setUploading(false);
      };
      
    } catch {
      alert('An error occurred during upload.');
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div className="container">
          <Link href="/" className="btn-outline flex-center" style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={18} style={{ marginRight: '6px' }}/> Back to Home
          </Link>
        </div>
      </header>

      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Student Portal
        </h1>

        {!team ? (
          <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.25rem', textAlign: 'center' }}>Enter Team Number</h2>
            <form onSubmit={fetchTeam}>
              <input
                type="text"
                placeholder="e.g. HN-1234"
                className="input-field"
                value={teamNumber}
                onChange={(e) => setTeamNumber(e.target.value)}
                style={{ marginBottom: '1.5rem', textTransform: 'uppercase' }}
                required
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Searching...' : 'Access Portal'}
              </button>
            </form>
            {error && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
          </div>
        ) : (
          <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 3rem)', width: '100%', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>{team.team_name}</h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Team Number: <strong style={{ color: '#fff' }}>{team.invoice_id}</strong></p>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Category: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{team.category}</strong></p>
              </div>
              <div>
                {team.is_approved ? (
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '0.4rem 0.85rem', borderRadius: '50px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <CheckCircle size={16} style={{ marginRight: '6px' }}/> Approved
                  </span>
                ) : (
                  <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.4rem 0.85rem', borderRadius: '50px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <Clock size={16} style={{ marginRight: '6px' }}/> Pending Review
                  </span>
                )}
              </div>
            </div>

            {!team.is_approved ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Clock size={44} style={{ color: '#eab308', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '0.75rem' }}>Your registration is under review</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>Our team is currently verifying your payment. Once approved, the hackathon instructions and project upload portal will be unlocked here.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>Hackathon Instructions</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}><strong style={{ color: '#cbd5e1' }}>Start Date:</strong> <span>To be announced</span></li>
                    <li style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}><strong style={{ color: '#cbd5e1' }}>End Date:</strong> <span>To be announced</span></li>
                    <li style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem' }}><strong style={{ color: '#cbd5e1' }}>Results Declaration:</strong> <span>To be announced</span></li>
                  </ul>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--secondary)' }}>Project Submission</h3>
                
                {team.project_url ? (
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', textAlign: 'center' }}>
                    <CheckCircle size={36} style={{ color: '#4ade80', margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#4ade80' }}>Project Uploaded Successfully</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Your project has been received and saved securely in Google Drive.</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpload} style={{ background: 'rgba(0,0,0,0.3)', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="label">Select Project Folder or Multiple Files</label>
                      <input 
                        type="file" 
                        onChange={(e) => setFiles(e.target.files)}
                        // @ts-ignore
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.5)', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
                        required
                      />
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        Your selected files will be automatically compressed into a single ZIP file for you.
                      </p>
                    </div>
                    <button type="submit" className="btn-primary flex-center" style={{ width: '100%' }} disabled={uploading || !files}>
                      {uploading ? (
                        <>{uploadProgress}</>
                      ) : (
                        <><Upload size={18} style={{ marginRight: '8px' }}/> Submit Project</>
                      )}
                    </button>
                    {uploadSuccess && <p style={{ color: '#4ade80', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>Uploaded successfully!</p>}
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}