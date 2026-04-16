'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '../../page';

export default function AdminCreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'customer'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin/users');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="users" />
      <main className="admin-main">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure a new user and assign appropriate system roles.</p>
        </div>

        <div style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '4px', boxShadow: 'var(--shadow-sm)', maxWidth: '800px' }}>
          {error && <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">System Role *</label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                  <option value="customer">Customer (Storefront Access)</option>
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="staff">Staff (Limited Access)</option>
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Customer accounts are securely isolated from Admin profiles in the database.
                </p>
              </div>
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" required />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div>
                <label className="form-label">Account Password *</label>
                <input className="form-input" type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Secure Password" required minLength="6" />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '2.5rem' }}>
              <div>
                <label className="form-label">Phone Number (Optional)</label>
                <input className="form-input" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
              </div>
              {formData.role === 'customer' && (
                <div>
                  <label className="form-label">Billing Address (Optional)</label>
                  <input className="form-input" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, City" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <Link href="/admin/users" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
