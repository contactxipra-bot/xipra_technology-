"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'a123456Janak@@';
    
    setTimeout(() => {
      if (password === adminPassword) {
        // Set session state or token if needed
        sessionStorage.setItem('wx_admin_auth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password');
        setIsLoading(false);
      }
    }, 600);
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

      <div className="container flex-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Access</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Enter the dashboard password.</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label className="label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
              {error && <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
            </div>
            
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
