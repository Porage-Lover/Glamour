'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('customer-token', data.token);
      localStorage.setItem('customer-user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('customer-auth-changed'));
      
      router.push('/my-account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Auto-login after register
      submitLogin(e);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setMsg(null);
    try {
      const res = await fetch('/api/auth/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.testUrl) {
        setMsg(<span dangerouslySetInnerHTML={{ __html: `Sandbox mode: <a href="${data.testUrl}" target="_blank" style="text-decoration: underline; font-weight: 600;">Click to view simulated email.</a>` }} />);
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar dark />
      <div className="mkdf-title-holder mkdf-standard-type mkdf-title-va-header-bottom" style={{ height: '200px', backgroundColor: '#FAF7F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mkdf-title-wrapper">
          <div className="mkdf-title-inner text-center">
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '3rem', fontWeight: 400, marginTop: '80px' }}>My Account</h1>
          </div>
        </div>
      </div>

      <div className="mkdf-container mkdf-default-page-template" style={{ padding: '6rem 0', background: 'var(--white)' }}>
        <div className="container clearfix" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          
          <div className="woocommerce">
            {error && <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}
            {msg && <div style={{ background: '#e8f5e9', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{msg}</div>}

            {view === 'login' && (
              <>
                <p className="mkdf-empty-cart-custom" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                  welcome back
                </p>
                <h2 className="mkdf-empty-cart-title" style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>Login</h2>
                <h5 className="mkdf-empty-cart-text" style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 400 }}>Access your account to view orders and checkout.</h5>

                <form className="woocommerce-form woocommerce-form-login login" method="post" onSubmit={submitLogin}>
                  <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style={{ marginBottom: '1.5rem' }}>
                    <input type="email" required className="form-input" placeholder="Email address *" value={email} onChange={e => setEmail(e.target.value)} />
                  </p>
                  <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style={{ marginBottom: '1.5rem' }}>
                    <input className="form-input" type="password" required placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} />
                  </p>
                  
                  <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <input type="checkbox" style={{ appearance: 'none', width: '16px', height: '16px', border: '1px solid var(--border)', background: 'var(--white)' }} />
                      <span>Remember me</span>
                    </label>
                    <button type="submit" disabled={loading} className="btn btn-outline" style={{ border: '1px solid var(--text-primary)', padding: '0.875rem 2.5rem', width: 'auto' }}>
                      {loading ? 'Logging in...' : 'Log in'}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', fontSize: '0.85rem' }}>
                    <p className="woocommerce-LostPassword lost_password" style={{ margin: 0 }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); }} style={{ color: 'var(--text-secondary)' }}>Lost your password?</a>
                    </p>
                    <p style={{ margin: 0 }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setView('register'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</a>
                    </p>
                  </div>
                </form>
              </>
            )}

            {view === 'register' && (
              <>
                <p className="mkdf-empty-cart-custom" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                  join us
                </p>
                <h2 className="mkdf-empty-cart-title" style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>Register</h2>
                <h5 className="mkdf-empty-cart-text" style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 400 }}>Create a new account for faster checkout.</h5>

                <form className="woocommerce-form woocommerce-form-register register" onSubmit={submitRegister}>
                  <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style={{ marginBottom: '1.5rem' }}>
                    <input type="text" required className="form-input" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} />
                  </p>
                  <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style={{ marginBottom: '1.5rem' }}>
                    <input type="email" required className="form-input" placeholder="Email address *" value={email} onChange={e => setEmail(e.target.value)} />
                  </p>
                  <p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style={{ marginBottom: '2rem' }}>
                    <input className="form-input" type="password" required placeholder="Password *" minLength="6" value={password} onChange={e => setPassword(e.target.value)} />
                  </p>
                  
                  <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <button type="submit" disabled={loading} className="btn btn-outline" style={{ border: '1px solid var(--text-primary)', padding: '0.875rem 2.5rem' }}>
                      {loading ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                    <p style={{ margin: 0 }}>
                      Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Log In</a>
                    </p>
                  </div>
                </form>
              </>
            )}

            {view === 'forgot' && (
              <>
                <p className="mkdf-empty-cart-custom" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--error)', marginBottom: '0.5rem' }}>
                  reset credentials
                </p>
                <h2 className="mkdf-empty-cart-title" style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>Lost Password</h2>
                <h5 className="mkdf-empty-cart-text" style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 400 }}>Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.</h5>

                <form className="woocommerce-ResetPassword lost_reset_password" onSubmit={submitForgot}>
                  <p className="woocommerce-form-row woocommerce-form-row--first form-row form-row-first" style={{ marginBottom: '2rem' }}>
                    <input type="email" required className="form-input" placeholder="Email address *" value={email} onChange={e => setEmail(e.target.value)} />
                  </p>

                  <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <button type="submit" disabled={loading} className="btn btn-outline" style={{ border: '1px solid var(--text-primary)', padding: '0.875rem 2.5rem' }}>
                      {loading ? 'Sending...' : 'Reset password'}
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                    <p style={{ margin: 0 }}>
                      Remembered it? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Log In</a>
                    </p>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
