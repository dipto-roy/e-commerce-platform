'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/admin'); }, [router]);
  return (
    <div className="page-wrapper flex items-center justify-center">
      <div className="text-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px', margin: '0 auto' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Redirecting to admin dashboard…
        </p>
      </div>
    </div>
  );
}
