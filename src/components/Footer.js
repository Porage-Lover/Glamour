import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Glamour</div>
            <p className="footer-desc">
              A curated collection of premium beauty & cosmetic products. Discover the art of self-care with our handpicked range of skincare, makeup, fragrances, and haircare essentials.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop All</Link></li>
              <li><Link href="/cart">Shopping Cart</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Categories</h4>
            <ul className="footer-links">
              <li><Link href="/shop?category=Skincare">Skincare</Link></li>
              <li><Link href="/shop?category=Makeup">Makeup</Link></li>
              <li><Link href="/shop?category=Fragrance">Fragrance</Link></li>
              <li><Link href="/shop?category=Haircare">Haircare</Link></li>
            </ul>
          </div>
          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe to receive updates on new arrivals and exclusive offers.</p>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Glamour Cosmetics. DBMS Project — Cosmetic Shop Retail System.
        </div>
      </div>
    </footer>
  );
}
