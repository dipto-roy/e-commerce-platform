'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';
import { userDashboardAPI } from '@/utils/api';
import { ShoppingBag, Package, DollarSign, Clock, LogOut, User, ArrowRight } from 'lucide-react';

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalAmount: string;
  totalSpent: string;
  recentOrders: any[];
}

export default function UserDashboard() {
  const { user, loading, isAuthorized } = useUserGuard();
  const { logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user && isAuthorized && !loading) {
      fetchUserStats();
      const interval = setInterval(fetchUserStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthorized, loading]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await userDashboardAPI.getDashboardStats();
      setStats(response.data as UserStats);
    } catch {
      setStats({ totalOrders: 0, completedOrders: 0, pendingOrders: 0, cancelledOrders: 0, totalAmount: '0.00', totalSpent: '0.00', recentOrders: [] });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized || !user) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full mt-4">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Orders',     value: stats?.totalOrders ?? 0,     icon: Package,     color: 'var(--accent-500)' },
    { label: 'Completed',        value: stats?.completedOrders ?? 0,  icon: ShoppingBag, color: '#10b981' },
    { label: 'Pending',          value: stats?.pendingOrders ?? 0,    icon: Clock,       color: '#f59e0b' },
    { label: 'Total Spent',      value: `$${parseFloat(stats?.totalSpent || '0').toFixed(2)}`, icon: DollarSign, color: '#3b82f6' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Browse Products',    desc: 'Explore thousands of items',           href: '/products',       icon: ShoppingBag, primary: true },
    { label: 'My Orders',          desc: 'Track your order history & status',    href: '/user/orders',    icon: Package,     primary: false },
    { label: 'Profile Settings',   desc: 'Update your account information',      href: '/user/profile',   icon: User,        primary: false },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Customer Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user.fullName || user.username}!
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger btn-sm self-start sm:self-auto">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {statsLoading ? '…' : value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Profile info */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Username',   value: user.username },
              { label: 'Email',      value: user.email },
              { label: 'Full Name',  value: user.fullName || '—' },
              { label: 'Status',     value: user.isActive ? 'Active' : 'Inactive', badge: true, ok: user.isActive },
            ].map(({ label, value, badge, ok }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{label}:</span>
                {badge
                  ? <span className={ok ? 'badge badge-green' : 'badge badge-red'}>{value}</span>
                  : <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map(({ label, desc, href, icon: Icon, primary }) => (
              <button key={href} onClick={() => router.push(href)}
                className={`card p-5 text-left flex items-start gap-4 card-interactive ${primary ? 'border-[var(--accent-200)]' : ''}`}
                style={primary ? { background: 'var(--accent-50)' } : {}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: primary ? 'var(--accent-100)' : 'var(--bg-secondary)' }}>
                  <Icon className="w-5 h-5" style={{ color: primary ? 'var(--accent-600)' : 'var(--text-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
