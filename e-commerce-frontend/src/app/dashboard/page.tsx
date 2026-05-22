'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContextNew';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirectToDashboard();
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router, redirectToDashboard]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="flex flex-col items-center gap-4">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Loading dashboard…' : 'Redirecting…'}
        </p>
      </div>
    </div>
  );
}
