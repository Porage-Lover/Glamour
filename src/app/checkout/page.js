'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, mounted } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('customer-user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        } catch (e) {}
      }
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Create customer
      const custRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const custData = await custRes.json();
      if (!custRes.ok) throw new Error(custData.error || 'Failed to create customer');

      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: custData.id,
          payment_method: paymentMethod,
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      setSuccess(orderData);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <>
        <Navbar dark />
        <div className="page-header"><div className="container"><h1>Order Confirmed!</h1></div></div>
        <section className="section">
          <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ marginBottom: '1rem' }}>Thank you for your order!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Order Number: <strong>{success.orderNumber}</strong></p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Total: <strong>₹{parseFloat(success.totalAmount).toLocaleString('en-IN')}</strong></p>
            {success.receiptUrl && (
              <p style={{ marginTop: '-1rem', marginBottom: '2rem' }}>
                <a href={success.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: '500' }}>
                  Open Ethereal Email Receipt ↗
                </a>
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => router.push('/shop')}>Continue Shopping</button>
              <button className="btn btn-outline" onClick={() => router.push('/admin')}>View Dashboard</button>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar dark />

      <div className="page-header" id="checkout-header">
        <div className="container">
          <h1>Checkout</h1>
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span><a href="/cart">Cart</a><span>/</span>Checkout
          </div>
        </div>
      </div>

      <section className="section" id="checkout-section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="empty-state">
              <h3>Your cart is empty</h3>
              <p>Add some products before checking out.</p>
              <a href="/shop" className="btn btn-primary">Go to Shop</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="checkout-grid">
                <div>
                  <h3 style={{ marginBottom: '2rem' }}>Billing Details</h3>

                  {error && (
                    <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                      {error}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input type="tel" name="phone" className="form-input" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input type="text" name="address" className="form-input" value={form.address} onChange={handleChange} />
                    </div>
                  </div>

                  <h3 style={{ margin: '2rem 0 1rem' }}>Payment Method</h3>
                  <div className="payment-methods">
                    {['card', 'upi', 'cash'].map(m => (
                      <div
                        key={m}
                        className={`payment-method ${paymentMethod === m ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod(m)}
                      >
                        {m === 'card' ? '💳 Card' : m === 'upi' ? '📱 UPI' : '💵 Cash'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-summary-card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                  {cart.map(item => (
                    <div key={item.id} className="order-summary-item">
                      <div className="order-summary-item-name">
                        <span>{item.name}</span>
                        <span className="order-summary-item-qty">×{item.quantity}</span>
                      </div>
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="order-summary-item" style={{ fontWeight: 600 }}>
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-accent btn-full"
                    style={{ marginTop: '1.5rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
