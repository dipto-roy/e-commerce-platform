'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionExpiration } from './useSessionExpiration';

export function useUserAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isSessionExpired } = useSessionExpiration();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If session expired, show expired message, otherwise just redirect
        const redirectUrl = isSessionExpired 
          ? '/login?expired=true&redirect=/user/dashboard'
          : '/login?redirect=/user/dashboard';
        router.push(redirectUrl);
        return;
      }

      if (user && user.role !== 'USER') {
        // Non-user roles get redirected based on their role
        if (user.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (user.role === 'SELLER') {
          router.push('/seller/dashboard');
        }
        return;
      }
    }
  }, [user, loading, isAuthenticated, isSessionExpired, router]);

  return {
    user,
    loading,
    isUser: user?.role === 'USER',
    isAuthenticated,
    isSessionExpired
  };
}
