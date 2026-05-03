'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navbar({ dark = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customerAuth, setCustomerAuth] = useState(null);
  const { totalItems, mounted } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);

    const checkAuth = () => {
      const token = localStorage.getItem('customer-token');
      const userStr = localStorage.getItem('customer-user');
      if (token && userStr && userStr !== 'undefined') {
        try {
          setCustomerAuth(JSON.parse(userStr));
        } catch (e) {
          setCustomerAuth(null);
          localStorage.removeItem('customer-token');
          localStorage.removeItem('customer-user');
        }
      } else {
        setCustomerAuth(null);
      }
    };
    checkAuth();
    window.addEventListener('customer-auth-changed', checkAuth);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('customer-auth-changed', checkAuth);
    };
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${dark ? 'dark' : ''}`} id="main-navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">Glamour</Link>
          <ul className="navbar-nav">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/admin">Dashboard</Link></li>
            {mounted && customerAuth ? (
              <li>
                <a onClick={() => {
                  localStorage.removeItem('customer-token');
                  localStorage.removeItem('customer-user');
                  localStorage.removeItem('admin-token');
                  localStorage.removeItem('admin-user');
                  window.dispatchEvent(new Event('customer-auth-changed'));
                }} style={{ cursor: 'pointer', color: 'var(--error)' }}>
                  Sign Out ({customerAuth.name.split(' ')[0]})
                </a>
              </li>
            ) : (
              <li><Link href="/login">Log In</Link></li>
            )}
          </ul>
          <div className="navbar-actions">
            <Link href={customerAuth ? "/my-account" : "/login"} className="user-icon" title="My Account">
              👤
            </Link>
            <Link href="/order-tracking" className="track-icon" title="Track Order" style={{ marginLeft: '1rem', textDecoration: 'none' }}>
              📦
            </Link>
            <Link href="/cart" className="cart-icon" id="cart-icon">
              🛒
              {mounted && totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <span style={{ background: scrolled || dark ? '#2C2C2C' : '#fff' }}></span>
              <span style={{ background: scrolled || dark ? '#2C2C2C' : '#fff' }}></span>
              <span style={{ background: scrolled || dark ? '#2C2C2C' : '#fff' }}></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>×</button>
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        <Link href="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        {mounted && customerAuth ? (
          <a onClick={() => {
            localStorage.removeItem('customer-token');
            localStorage.removeItem('customer-user');
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
            window.dispatchEvent(new Event('customer-auth-changed'));
            setMenuOpen(false);
          }} style={{ cursor: 'pointer', color: 'var(--error)' }}>
            Sign Out
          </a>
        ) : (
          <Link href="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
        )}
      </div>
    </>
  );
}
