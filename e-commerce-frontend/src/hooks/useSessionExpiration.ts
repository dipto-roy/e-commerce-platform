import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseSessionExpirationOptions {
  onExpired?: () => void;
  redirectTo?: string;
}

export function useSessionExpiration(options: UseSessionExpirationOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const expired = searchParams.get('expired');
    
    if (expired === 'true') {
      // Clear any existing authentication data
      if (typeof window !== 'undefined') {
        // Clear any local storage auth data if exists
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
      }
      
      // Call custom expiration handler if provided
      if (options.onExpired) {
        options.onExpired();
      }
      
      // Show notification or handle UI updates
      console.log('Session expired - user needs to log in again');
    }
  }, [searchParams, options.onExpired]);

  const handleSessionExpiration = () => {
    const redirectUrl = options.redirectTo || '/login?expired=true';
    
    // Clear any authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
    
    router.push(redirectUrl);
  };

  return {
    isSessionExpired: searchParams.get('expired') === 'true',
    handleSessionExpiration
  };
}
