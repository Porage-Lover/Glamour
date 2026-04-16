'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/customer/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setMessage(data.message);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <h3>Invalid Password Reset Link</h3>
        <p>No token provided. Please request a new password reset link.</p>
        <button onClick={() => router.push('/login')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem', background: 'var(--white)', border: '1px solid var(--border)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0' }}>New Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Enter a new password for your account.</p>
      </div>
      
      {message && <div style={{ background: '#e8f5e9', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{message}</div>}
      {error && <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}
      
      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar dark />
      <div className="page-header">
        <div className="container">
          <h1>Reset Password</h1>
        </div>
      </div>
      <section className="section" style={{ background: 'var(--bg-cream)', minHeight: '50vh' }}>
        <div className="container">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
      <Footer />
    </>
  );
}
