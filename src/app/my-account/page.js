'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MyAccountDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      const token = localStorage.getItem('customer-token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/my-account', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        
        if (!res.ok) {
          localStorage.removeItem('customer-token');
          localStorage.removeItem('customer-user');
          window.dispatchEvent(new Event('customer-auth-changed'));
          router.push('/login');
          throw new Error(d.error);
        }
        
        setData(d);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('customer-token');
    localStorage.removeItem('customer-user');
    window.dispatchEvent(new Event('customer-auth-changed'));
    router.push('/login');
  };

  if (loading) return (
    <>
      <Navbar dark />
      <div className="mkdf-container mkdf-default-page-template" style={{ padding: '6rem 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar dark />
      <div className="mkdf-title-holder mkdf-standard-type mkdf-title-va-header-bottom" style={{ height: '200px', backgroundColor: '#FAF7F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mkdf-title-wrapper">
          <div className="mkdf-title-inner text-center">
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '3rem', fontWeight: 400, marginTop: '80px' }}>Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mkdf-container mkdf-default-page-template" style={{ padding: '4rem 0', background: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '3rem' }}>
            
            {/* Sidebar Navigation */}
            <div style={{ paddingRight: '2rem', borderRight: '1px solid var(--border-light)' }}>
              <p className="mkdf-empty-cart-custom" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '2rem' }}>
                hello, {data?.user?.name?.split(' ')[0] || 'User'}
              </p>

              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}><a href="#" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Dashboard</a></li>
                <li style={{ marginBottom: '1rem' }}><a href="#orders" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orders</a></li>
                <li style={{ marginBottom: '1rem' }}><a href="#details" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Account details</a></li>
                <li style={{ marginTop: '2rem' }}>
                  <button onClick={handleLogout} className="btn" style={{ background: 'var(--error)', color: 'white', padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>

            {/* Main Content */}
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: '1rem' }}>Welcome Home</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
                </p>
              </div>

              <div id="orders" style={{ marginBottom: '4rem' }}>
                <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Recent Orders</h4>
                
                {data?.orders?.length > 0 ? (
                  <table className="admin-table" style={{ border: 'none', boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ color: 'var(--accent)', fontWeight: 600 }}>#{o.order_number}</td>
                          <td>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                          <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')} for {o.num_items} item{o.num_items > 1 ? 's' : ''}</td>
                          <td>
                            <button onClick={() => router.push(`/order-tracking?id=${o.order_number}&email=${encodeURIComponent(data.user.email)}`)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.65rem' }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ background: 'var(--bg-cream)', padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No order has been made yet.</p>
                    <button onClick={() => router.push('/shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</button>
                  </div>
                )}
              </div>

              <div id="details">
                <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Account Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</strong>
                    <p style={{ fontSize: '0.9rem' }}>{data?.user?.email}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone Number</strong>
                    <p style={{ fontSize: '0.9rem' }}>{data?.user?.phone || 'Not provided'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Billing Address</strong>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{data?.user?.address || 'You have not set up this type of address yet.'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
