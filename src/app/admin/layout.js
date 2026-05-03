'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayoutWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If user is hitting the login component, we just render the children
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Standard admin check
    const token = localStorage.getItem('admin-token');
    const user = localStorage.getItem('admin-user');

    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    // Explicit server-side cryptographic validation
    fetch('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        router.push('/admin/login');
      }
    })
    .catch(() => {
      router.push('/admin/login');
    });
  }, [pathname, router]);

  // Optionally flash a spinner while validating their identity before streaming any visual dashboard chunks
  if (!isAuthenticated) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  return <>{children}</>;
}
