'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const heroSlides = [
  {
    image: '/images/hero/hero-1.jpg',
    title: '"Discover the Art of True Beauty & Elegance."',
    cta: 'Shop Now',
  },
  {
    image: '/images/hero/hero-2.jpg',
    title: '"A Little Something for Every Look."',
    cta: 'Explore Collection',
  },
  {
    image: '/images/hero/hero-3.jpg',
    title: '"Where Skincare Meets Luxury."',
    cta: 'View Skincare',
  },
  {
    image: '/images/hero/hero-4.jpg',
    title: '"An Unrivaled Approach to Modern Beauty."',
    cta: 'Browse All',
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* Fullscreen Hero Slider */}
      <section className="hero-slider" id="hero-slider">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`}>
            <div className="hero-slide-bg" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className="hero-slide-overlay" />
            {i === currentSlide && (
              <div className="hero-slide-content">
                <h1>{slide.title}</h1>
                <Link href="/shop" className="hero-btn">{slide.cta}</Link>
              </div>
            )}
          </div>
        ))}
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="section" id="collections">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Curated Collections</span>
            <h2>Shop by Category</h2>
            <p>Explore our handpicked categories of premium beauty essentials</p>
          </div>
          <div className="collections-grid">
            <Link href="/shop?category=Skincare" className="collection-card">
              <img src="/images/products/prod-1.jpg" alt="Skincare" />
              <div className="collection-card-overlay">
                <h3>Skincare</h3>
                <span>Discover Collection</span>
              </div>
            </Link>
            <Link href="/shop?category=Makeup" className="collection-card">
              <img src="/images/products/prod-2.jpg" alt="Makeup" />
              <div className="collection-card-overlay">
                <h3>Makeup</h3>
                <span>Discover Collection</span>
              </div>
            </Link>
            <Link href="/shop?category=Fragrance" className="collection-card">
              <img src="/images/products/prod-6.jpg" alt="Fragrance" />
              <div className="collection-card-overlay">
                <h3>Fragrance</h3>
                <span>Discover Collection</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--bg-cream)' }} id="featured-products">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Bestsellers</span>
            <h2>Featured Products</h2>
            <p>Our most loved beauty essentials, handpicked for you</p>
          </div>
          {products.length > 0 ? (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading products...
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/shop" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="section" id="banner" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="section-subtitle">Why Choose Us</span>
          <h2 style={{ maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            &ldquo;Beauty begins the moment you decide to be yourself.&rdquo;
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '0.9rem' }}>
            At Glamour, we believe in authentic beauty. Every product in our collection is carefully sourced from trusted brands, ensuring quality, safety, and true elegance.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--accent)' }}>18+</div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Products</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--accent)' }}>4</div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Categories</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--accent)' }}>10+</div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Brands</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--accent)' }}>100%</div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Authentic</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
