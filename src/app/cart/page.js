'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, mounted } = useCart();

  if (!mounted) return null;

  return (
    <>
      <Navbar dark />

      <div className="page-header" id="cart-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>Cart
          </div>
        </div>
      </div>

      <section className="section" id="cart-section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="empty-state">
              <h3>Your cart is empty</h3>
              <p>Looks like you haven&apos;t added any products yet.</p>
              <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="cart-product-info">
                          <img
                            src={item.image_url || '/images/products/prod-1.jpg'}
                            alt={item.name}
                            className="cart-product-img"
                          />
                          <div>
                            <div className="cart-product-brand">{item.brand}</div>
                            <div className="cart-product-name">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td>
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <input type="text" className="qty-value" value={item.quantity} readOnly />
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                      <td>
                        <button className="cart-remove" onClick={() => removeFromCart(item.id)}>✕ Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', marginTop: '2rem' }}>
                <div>
                  <Link href="/shop" className="btn btn-outline">← Continue Shopping</Link>
                </div>
                <div className="cart-summary">
                  <h3>Cart Totals</h3>
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <Link href="/checkout" className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }}>
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
