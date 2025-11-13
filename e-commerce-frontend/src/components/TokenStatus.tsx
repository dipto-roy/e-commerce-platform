'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TokenStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function TokenStatus({ showDetails = false, className = '' }: TokenStatusProps) {
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'refreshing' | 'expired' | 'unknown'>('unknown');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    // Listen for token refresh events
    const handleTokenRefresh = () => {
      setTokenStatus('valid');
      setLastRefresh(new Date());
      setTimeUntilExpiry(15 * 60); // 15 minutes in seconds
    };

    const handleTokenExpiry = () => {
      setTokenStatus('expired');
      setTimeUntilExpiry(null);
    };

    const handleTokenRefreshing = () => {
      setTokenStatus('refreshing');
    };

    // Custom events (you can dispatch these from axios interceptors)
    window.addEventListener('token-refreshed', handleTokenRefresh as EventListener);
    window.addEventListener('token-expired', handleTokenExpiry as EventListener);
    window.addEventListener('token-refreshing', handleTokenRefreshing as EventListener);

    // Initial check
    checkTokenStatus();

    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('token-expired', handleTokenExpiry as EventListener);
      window.removeEventListener('token-refreshing', handleTokenRefreshing as EventListener);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeUntilExpiry === null || timeUntilExpiry <= 0) return;

    const interval = setInterval(() => {
      setTimeUntilExpiry(prev => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilExpiry]);

  const checkTokenStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        credentials: 'include',
      });

      if (response.ok) {
        setTokenStatus('valid');
        setLastRefresh(new Date());
        setTimeUntilExpiry(15 * 60); // Reset to 15 minutes
      } else {
        setTokenStatus('expired');
      }
    } catch (error) {
      setTokenStatus('unknown');
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = () => {
    switch (tokenStatus) {
      case 'valid':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Token Valid',
        };
      case 'refreshing':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Refreshing...',
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Token Expired',
        };
      default:
        return {
          icon: Shield,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Checking...',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (!showDetails) {
    // Minimal view - just an icon
    return (
      <div className={`relative ${className}`} title={config.text}>
        <Icon className={`w-5 h-5 ${config.color} ${tokenStatus === 'refreshing' ? 'animate-spin' : ''}`} />
        {timeUntilExpiry !== null && timeUntilExpiry < 60 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.color} ${tokenStatus === 'refreshing' ? 'animate-spin' : ''} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${config.color}`}>{config.text}</h3>
            {timeUntilExpiry !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className={timeUntilExpiry < 60 ? 'text-orange-600 font-semibold' : ''}>
                  {formatTime(timeUntilExpiry)}
                </span>
              </div>
            )}
          </div>
          
          {lastRefresh && (
            <p className="text-sm text-gray-600 mt-1">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          
          {tokenStatus === 'valid' && timeUntilExpiry !== null && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    timeUntilExpiry < 60 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(timeUntilExpiry / (15 * 60)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {tokenStatus === 'expired' && (
            <p className="text-sm text-red-600 mt-1">
              Please refresh the page or log in again
            </p>
          )}
          
          {tokenStatus === 'refreshing' && (
            <p className="text-sm text-blue-600 mt-1">
              Automatically refreshing your session...
            </p>
          )}
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={checkTokenStatus}
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Check Status
          </button>
        </div>
      )}
    </div>
  );
}

// Export helper to dispatch token events
export const tokenEvents = {
  refreshed: () => window.dispatchEvent(new Event('token-refreshed')),
  expired: () => window.dispatchEvent(new Event('token-expired')),
  refreshing: () => window.dispatchEvent(new Event('token-refreshing')),
};
