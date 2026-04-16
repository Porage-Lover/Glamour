'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to track order');
      setResult(data);
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
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '3rem', fontWeight: 400, marginTop: '80px' }}>Order Tracking</h1>
          </div>
        </div>
      </div>

      <div className="mkdf-container mkdf-default-page-template" style={{ padding: '6rem 0', background: 'var(--white)' }}>
        <div className="container clearfix" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          <div className="woocommerce">
            <p className="mkdf-empty-cart-custom" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
              perfect shades
            </p>
            <h2 className="mkdf-empty-cart-title" style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>Order Status</h2>
            <h5 className="mkdf-empty-cart-text" style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 400 }}>Enter your receipt details to view your shipment.</h5>

            {error && <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

            {!result ? (
              <form className="woocommerce-form woocommerce-form-track-order track_order" onSubmit={handleTrack}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                  To track your order please enter your Order ID in the box below and press the "Track" button. This was given to you on your receipt and in the confirmation email you should have received.
                </p>

                <p className="woocommerce-form-row woocommerce-form-row--first form-row form-row-first" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <label htmlFor="orderid" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Order ID</label>
                  <input className="form-input" type="text" name="orderid" id="orderid" placeholder="Found in your order confirmation email." value={orderId} onChange={e => setOrderId(e.target.value)} required />
                </p>
                <p className="woocommerce-form-row woocommerce-form-row--last form-row form-row-last" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                  <label htmlFor="order_email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Billing email</label>
                  <input className="form-input" type="email" name="order_email" id="order_email" placeholder="Email you used during checkout." value={email} onChange={e => setEmail(e.target.value)} required />
                </p>
                
                <p className="form-row" style={{ textAlign: 'left' }}>
                  <button type="submit" disabled={loading} className="btn btn-outline" style={{ border: '1px solid var(--text-primary)', padding: '0.875rem 2.5rem' }}>
                    {loading ? 'Tracking...' : 'Track'}
                  </button>
                </p>
              </form>
            ) : (
              <div style={{ textAlign: 'left', border: '1px solid var(--border-light)', padding: '2rem', background: '#faf9f9' }}>
                <h3 style={{ fontFamily: 'var(--serif)', marginBottom: '1rem' }}>Order #{result.order.order_number}</h3>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Date</span>
                    <strong>{new Date(result.order.created_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Status</span>
                    <strong style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{result.order.status}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Total Amount</span>
                    <strong>₹{result.order.total_amount}</strong>
                  </div>
                </div>

                <h4 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Details</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 500 }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>{item.product_name}</td>
                        <td style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>₹{item.unit_price}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" style={{ padding: '15px 0', fontWeight: 'bold' }}>Total Cart Cost:</td>
                      <td style={{ textAlign: 'right', padding: '15px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{result.order.total_amount}</td>
                    </tr>
                  </tfoot>
                </table>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                  <button className="btn btn-outline" onClick={() => setResult(null)} style={{ border: '1px solid var(--text-primary)', padding: '0.875rem 2.5rem' }}>Track another order</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
