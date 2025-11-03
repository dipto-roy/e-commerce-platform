'use client';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthGuard(requiredRoles?: string[]) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = user?.role?.toLowerCase();
        const hasRequiredRole = requiredRoles.some(role => 
          role.toLowerCase() === userRole
        );

        if (!hasRequiredRole) {
          // Redirect to appropriate dashboard if user doesn't have required role
          switch (userRole) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'seller':
              router.push('/seller/dashboard');
              break;
            case 'user':
            default:
              router.push('/user/dashboard');
              break;
          }
          return;
        }
      }
    }
  }, [user, loading, isAuthenticated, requiredRoles, router]);

  return {
    user,
    loading,
    isAuthenticated,
    isAuthorized: isAuthenticated && (
      !requiredRoles || 
      requiredRoles.length === 0 || 
      requiredRoles.some(role => role.toLowerCase() === user?.role?.toLowerCase())
    ),
  };
}

export function useAdminGuard() {
  return useAuthGuard(['admin']);
}

export function useSellerGuard() {
  return useAuthGuard(['seller']);
}

export function useUserGuard() {
  return useAuthGuard(['user']);
}
