'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin-token')}` }
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar active="dashboard" />
      <main className="admin-main">
        <div className="loading-spinner"><div className="spinner" /></div>
      </main>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="admin-layout">
      <AdminSidebar active="dashboard" />
      <main className="admin-main" id="admin-dashboard">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Welcome back! Here&apos;s your store overview.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Revenue</div>
            <div className="stat-card-value">₹{stats.total_revenue?.toLocaleString('en-IN') || '0'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Total Orders</div>
            <div className="stat-card-value">{stats.total_orders || 0}</div>
            <div className="stat-card-change pending" style={{ color: 'var(--warning)' }}>{stats.pending_orders || 0} pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Customers</div>
            <div className="stat-card-value">{stats.total_customers || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Products</div>
            <div className="stat-card-value">{stats.total_products || 0}</div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {data?.lowStock?.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>⚠️ Low Stock Alerts</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.brand}</td>
                    <td>{item.stock_quantity}</td>
                    <td>{item.low_stock_threshold}</td>
                    <td><span className="status-badge low-stock">Low Stock</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Orders */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>View All →</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders || []).map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                  <td>{order.customer_name || 'Guest'}</td>
                  <td>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                  <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Staff Performance */}
        {data?.staffPerformance?.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Staff Sales Performance</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Total Orders</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {data.staffPerformance.map((s, i) => (
                  <tr key={i}>
                    <td>{s.username}</td>
                    <td>{s.Total_Orders}</td>
                    <td>₹{parseFloat(s.Total_Sales || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminSidebar({ active }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">Glamour</div>
      <ul className="admin-nav">
        <li><Link href="/admin" className={active === 'dashboard' ? 'active' : ''}>📊 Dashboard</Link></li>
        <li><Link href="/admin/products" className={active === 'products' ? 'active' : ''}>📦 Products</Link></li>
        <li><Link href="/admin/orders" className={active === 'orders' ? 'active' : ''}>🛒 Orders</Link></li>
        <li><Link href="/admin/users" className={active === 'users' ? 'active' : ''}>👥 Accounts</Link></li>
        <li><Link href="/shop" className="">🏪 View Store</Link></li>
        <li><Link href="/" className="">🏠 Home</Link></li>
        <li style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
            localStorage.removeItem('customer-token');
            localStorage.removeItem('customer-user');
            window.location.href = '/admin/login';
          }} style={{ color: 'var(--error)' }}>🚪 Sign Out</a>
        </li>
      </ul>
    </aside>
  );
}

export { AdminSidebar };
