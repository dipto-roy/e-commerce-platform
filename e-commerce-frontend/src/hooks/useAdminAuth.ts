'use client';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionExpiration } from './useSessionExpiration';

export function useAdminAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isSessionExpired } = useSessionExpiration();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If session expired, show expired message, otherwise just redirect
        const redirectUrl = isSessionExpired 
          ? '/login?expired=true&redirect=/dashboard/admin'
          : '/login?redirect=/dashboard/admin';
        router.push(redirectUrl);
        return;
      }

      if (user && user.role !== 'ADMIN') {
        // Non-admin users get redirected based on their role
        if (user.role === 'SELLER') {
          router.push('/dashboard/seller');
        } else {
          router.push('/dashboard/user');
        }
        return;
      }
    }
  }, [user, loading, isAuthenticated, isSessionExpired, router]);

  return {
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated,
    isSessionExpired
  };
}
