'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '../page';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', brand: '', category: 'Skincare', price: '', stock_quantity: '', description: '' });

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
    const method = editProduct ? 'PUT' : 'POST';
    await fetch(url, { 
      method, 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
      }, 
      body: JSON.stringify(form) 
    });
    setShowModal(false);
    setEditProduct(null);
    setForm({ name: '', brand: '', category: 'Skincare', price: '', stock_quantity: '', description: '' });
    fetchProducts();
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, brand: p.brand, category: p.category, price: p.price, stock_quantity: p.stock_quantity, description: p.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/products/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin-token')}` }
    });
    fetchProducts();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="products" />
      <main className="admin-main" id="admin-products">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Products</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your product catalog</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setForm({ name: '', brand: '', category: 'Skincare', price: '', stock_quantity: '', description: '' }); setShowModal(true); }}>
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={p.image_url || '/images/products/prod-1.jpg'} alt="" style={{ width: 40, height: 50, objectFit: 'cover', background: 'var(--bg-cream)' }} />
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.brand}</td>
                  <td>{p.category}</td>
                  <td>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${p.stock_quantity <= (p.low_stock_threshold || 10) ? 'low-stock' : 'in-stock'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(p)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.75rem', fontSize: '0.85rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal */}
        <div className={`modal-overlay ${showModal ? 'open' : ''}`} onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Skincare</option>
                    <option>Makeup</option>
                    <option>Fragrance</option>
                    <option>Haircare</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">{editProduct ? 'Update Product' : 'Create Product'}</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
