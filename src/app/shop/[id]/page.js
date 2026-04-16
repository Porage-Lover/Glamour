'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: parseFloat(product.price),
      image_url: product.image_url,
      category: product.category,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <>
      <Navbar dark />
      <div className="page-header"><div className="container"><h1>Loading...</h1></div></div>
      <div className="loading-spinner" style={{ padding: '6rem' }}><div className="spinner" /></div>
    </>
  );

  if (!product) return (
    <>
      <Navbar dark />
      <div className="page-header"><div className="container"><h1>Product Not Found</h1></div></div>
      <div className="empty-state">
        <h3>Product not found</h3>
        <p>The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
      <Footer />
    </>
  );

  const stockStatus = product.stock_quantity > product.low_stock_threshold ? 'In Stock' :
    product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock';

  return (
    <>
      <Navbar dark />

      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/shop">Shop</a><span>/</span>
            {product.name}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="product-detail" id="product-detail">
          <div className="product-detail-image">
            <img src={product.image_url || '/images/products/prod-1.jpg'} alt={product.name} />
          </div>
          <div className="product-detail-info">
            <div className="product-detail-brand">{product.brand}</div>
            <h1>{product.name}</h1>
            <div className="product-detail-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
            <div className="product-detail-desc">{product.description || 'A premium cosmetic product from our curated collection.'}</div>
            <div className="product-detail-meta">
              <span><strong>Category:</strong> {product.category}</span>
              <span><strong>Brand:</strong> {product.brand}</span>
              <span><strong>Availability:</strong>{' '}
                <span className={`status-badge ${stockStatus === 'In Stock' ? 'in-stock' : stockStatus === 'Low Stock' ? 'low-stock' : 'cancelled'}`}>{stockStatus}</span>
              </span>
              {product.supplier_name && <span><strong>Supplier:</strong> {product.supplier_name}</span>}
            </div>
            <div className="product-detail-actions">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="text" className="qty-value" value={quantity} readOnly />
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAdd} disabled={product.stock_quantity === 0}>
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
