'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare'];
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('name');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, sort, search]);

  return (
    <>
      <Navbar dark />

      <div className="page-header" id="shop-header">
        <div className="container">
          <h1>Shop</h1>
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            Shop
            {category !== 'All' && <><span>/</span>{category}</>}
          </div>
        </div>
      </div>

      <section className="section" id="shop-section">
        <div className="container">
          <div className="shop-layout">
            {/* Sidebar */}
            <aside className="shop-sidebar" id="shop-sidebar">
              <div className="filter-group">
                <h4 className="filter-title">Search</h4>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="search-input"
                />
              </div>

              <div className="filter-group">
                <h4 className="filter-title">Categories</h4>
                {categories.map(c => (
                  <label key={c} className="filter-option">
                    <input
                      type="checkbox"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4 className="filter-title">Sort By</h4>
                {sortOptions.map(s => (
                  <label key={s.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={sort === s.value}
                      onChange={() => setSort(s.value)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </aside>

            {/* Products */}
            <div>
              <div className="shop-toolbar">
                <span className="shop-count">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
                <div className="shop-sort">
                  <select value={sort} onChange={e => setSort(e.target.value)}>
                    {sortOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : products.length > 0 ? (
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '10rem' }}><div className="spinner" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
