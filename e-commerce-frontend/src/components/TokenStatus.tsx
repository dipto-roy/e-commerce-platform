'use client';
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TokenStatusProps {
  showDetails?: boolean;
  className?: string;
}

type TStatus = 'valid' | 'refreshing' | 'expired' | 'unknown';

const STATUS_CONFIG: Record<TStatus, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  text: string;
}> = {
  valid: {
    icon: CheckCircle, color: '#059669',
    bg: '#ecfdf5', border: '#a7f3d0', text: 'Token Valid',
  },
  refreshing: {
    icon: RefreshCw, color: 'var(--accent-600)',
    bg: 'var(--accent-50)', border: '#a7f3d0', text: 'Refreshing…',
  },
  expired: {
    icon: AlertCircle, color: '#ef4444',
    bg: '#fef2f2', border: '#fecaca', text: 'Token Expired',
  },
  unknown: {
    icon: Shield, color: 'var(--text-secondary)',
    bg: 'var(--bg-secondary)', border: 'var(--border)', text: 'Checking…',
  },
};

export default function TokenStatus({ showDetails = false, className = '' }: TokenStatusProps) {
  const [tokenStatus, setTokenStatus] = useState<TStatus>('unknown');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    const onRefreshed  = () => { setTokenStatus('valid');     setLastRefresh(new Date()); setTimeUntilExpiry(15 * 60); };
    const onExpired    = () => { setTokenStatus('expired');   setTimeUntilExpiry(null); };
    const onRefreshing = () => { setTokenStatus('refreshing'); };

    window.addEventListener('token-refreshed',  onRefreshed  as EventListener);
    window.addEventListener('token-expired',    onExpired    as EventListener);
    window.addEventListener('token-refreshing', onRefreshing as EventListener);

    checkTokenStatus();

    return () => {
      window.removeEventListener('token-refreshed',  onRefreshed  as EventListener);
      window.removeEventListener('token-expired',    onExpired    as EventListener);
      window.removeEventListener('token-refreshing', onRefreshing as EventListener);
    };
  }, []);

  // Countdown
  useEffect(() => {
    if (!timeUntilExpiry || timeUntilExpiry <= 0) return;
    const id = setInterval(() => setTimeUntilExpiry(p => (p && p > 1 ? p - 1 : null)), 1000);
    return () => clearInterval(id);
  }, [timeUntilExpiry]);

  const checkTokenStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, { credentials: 'include' });
      if (res.ok) { setTokenStatus('valid'); setLastRefresh(new Date()); setTimeUntilExpiry(15 * 60); }
      else setTokenStatus('expired');
    } catch { setTokenStatus('unknown'); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const cfg = STATUS_CONFIG[tokenStatus];
  const Icon = cfg.icon;
  const nearExpiry = timeUntilExpiry !== null && timeUntilExpiry < 60;

  // Minimal icon view
  if (!showDetails) {
    return (
      <div className={`relative ${className}`} title={cfg.text}>
        <Icon className={`w-5 h-5 ${tokenStatus === 'refreshing' ? 'animate-spin' : ''}`} style={{ color: cfg.color }} />
        {nearExpiry && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
          </span>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`rounded-lg border p-4 ${className}`}
      style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${tokenStatus === 'refreshing' ? 'animate-spin' : ''}`}
          style={{ color: cfg.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: cfg.color }}>{cfg.text}</h3>
            {timeUntilExpiry !== null && (
              <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Clock className="w-4 h-4" />
                <span className={nearExpiry ? 'text-orange-600 font-semibold' : ''}>
                  {formatTime(timeUntilExpiry)}
                </span>
              </div>
            )}
          </div>

          {lastRefresh && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          )}

          {tokenStatus === 'valid' && timeUntilExpiry !== null && (
            <div className="mt-2 w-full rounded-full h-1.5" style={{ background: 'var(--bg-secondary)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${(timeUntilExpiry / (15 * 60)) * 100}%`,
                  background: nearExpiry ? '#f97316' : '#10b981',
                }}
              />
            </div>
          )}

          {tokenStatus === 'expired' && (
            <p className="text-xs mt-1 text-red-600">Please refresh the page or log in again</p>
          )}
          {tokenStatus === 'refreshing' && (
            <p className="text-xs mt-1" style={{ color: 'var(--accent-600)' }}>
              Automatically refreshing your session…
            </p>
          )}
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <button onClick={checkTokenStatus} className="text-xs hover:underline" style={{ color: 'var(--text-secondary)' }}>
            Check Status
          </button>
        </div>
      )}
    </div>
  );
}

export const tokenEvents = {
  refreshed:  () => window.dispatchEvent(new Event('token-refreshed')),
  expired:    () => window.dispatchEvent(new Event('token-expired')),
  refreshing: () => window.dispatchEvent(new Event('token-refreshing')),
};
