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
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // Optionally flash a spinner while validating their identity before streaming any visual dashboard chunks
  if (!isAuthenticated) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );

  return <>{children}</>;
}
