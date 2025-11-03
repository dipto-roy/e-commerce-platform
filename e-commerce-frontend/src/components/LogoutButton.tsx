'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'default' | 'header' | 'sidebar' | 'minimal';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'default',
  className = '',
  showIcon = true,
  showText = true,
  size = 'md'
}) => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logout button clicked');
      await logout();
      console.log('✅ Logout successful, redirecting to home');
      router.push('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-200 font-medium';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm hover:shadow-md',
    header: 'bg-transparent hover:bg-red-600/10 text-red-400 hover:text-red-300 rounded-md border border-red-600/30 hover:border-red-500',
    sidebar: 'bg-transparent hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg w-full justify-start',
    minimal: 'bg-transparent hover:bg-red-600/10 text-red-400 hover:text-red-300 rounded'
  };

  const combinedStyles = `
    ${baseStyles} 
    ${sizeStyles[size]} 
    ${variantStyles[variant]} 
    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} 
    ${className}
  `.trim();

  if (!user) {
    return null; // Don't show logout button if not logged in
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={combinedStyles}
      title="Sign out"
    >
      {showIcon && (
        <svg 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      )}
      {showText && (
        <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
      )}
    </button>
  );
};

export default LogoutButton;