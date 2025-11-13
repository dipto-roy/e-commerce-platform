import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseSessionExpirationOptions {
  onExpired?: () => void;
  redirectTo?: string;
}

export function useSessionExpiration(options: UseSessionExpirationOptions = {}) {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check URL for expired parameter on client side only
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const expired = params.get('expired');
      
      if (expired === 'true') {
        setIsExpired(true);
        
        // Clear any existing authentication data
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        
        // Call custom expiration handler if provided
        if (options.onExpired) {
          options.onExpired();
        }
        
        // Show notification or handle UI updates
        console.log('Session expired - user needs to log in again');
      }
    }
  }, [options.onExpired]);

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
    isSessionExpired: isExpired,
    handleSessionExpiration
  };
}
