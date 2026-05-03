'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '../page';

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin-token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
        else setError(data.error);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar active="users" />
      <main className="admin-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Users & Accounts</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage system admins, staff, and customer accounts.</p>
          </div>
          <Link href="/admin/users/create" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            + Create Account
          </Link>
        </div>

        {error && <div style={{ background: '#ffebee', color: 'var(--error)', padding: '1rem', marginBottom: '2rem' }}>{error}</div>}

        <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '4px', boxShadow: 'var(--shadow-sm)' }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-badge ${u.type === 'System' ? 'pending' : 'completed'}`} style={{ opacity: 0.9 }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.type}</td>
                    <td>{u.date}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No accounts found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
