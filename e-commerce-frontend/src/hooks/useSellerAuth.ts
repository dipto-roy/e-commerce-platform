'use client';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSessionExpiration } from './useSessionExpiration';

export function useSellerAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isSessionExpired } = useSessionExpiration();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // If session expired, show expired message, otherwise just redirect
        const redirectUrl = isSessionExpired 
          ? '/login?expired=true&redirect=/seller/dashboard'
          : '/login?redirect=/seller/dashboard';
        router.push(redirectUrl);
        return;
      }

      if (user && user.role !== 'SELLER') {
        // Non-seller users get redirected based on their role
        if (user.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/user/dashboard');
        }
        return;
      }
    }
  }, [user, loading, isAuthenticated, isSessionExpired, router]);

  return {
    user,
    loading,
    isSeller: user?.role === 'SELLER',
    isAuthenticated,
    isSessionExpired,
    isVerified: user?.isVerified || false
  };
}
