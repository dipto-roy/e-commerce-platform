'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LogoutButton from '@/components/LogoutButton';
import { userDashboardAPI } from '@/utils/api';
import { ShoppingCart, CheckCircle, Heart, DollarSign, RefreshCw, Package } from 'lucide-react';

interface UserStats {
  totalOrders: number; completedOrders: number; pendingOrders: number;
  cancelledOrders: number; totalAmount: string; totalSpent: string; recentOrders: any[];
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) fetchUserStats();
  }, [user, loading]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);
      const response = await userDashboardAPI.getDashboardStats();
      setStats(response.data as UserStats);
    } catch {
      setError('Failed to load dashboard statistics');
      setStats({ totalOrders: 0, completedOrders: 0, pendingOrders: 0, cancelledOrders: 0, totalAmount: '0.00', totalSpent: '0.00', recentOrders: [] });
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  const STATS = [
    { label: 'Total Orders',     value: stats?.totalOrders     ?? 0,      icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Completed',        value: stats?.completedOrders ?? 0,      icon: CheckCircle,  color: '#10b981' },
    { label: 'Wishlist Items',   value: 0,                                 icon: Heart,        color: '#f43f5e' },
    { label: 'Total Spent',      value: `$${stats?.totalSpent ?? '0.00'}`, icon: DollarSign,  color: '#8b5cf6' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">My Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user?.username}!
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchUserStats} disabled={statsLoading} className="btn btn-outline btn-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <LogoutButton variant="header" size="md" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {error && (
          <div className="alert alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3">
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
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Products', href: '/products',    primary: true },
                { label: 'My Orders',       href: '/orders',      primary: false },
                { label: 'Wishlist',        href: '/wishlist',    primary: false },
                { label: 'Profile',         href: '/user/profile', primary: false },
              ].map(({ label, href, primary }) => (
                <a key={label} href={href}
                  className={`btn btn-sm ${primary ? 'btn-primary' : 'btn-outline'} justify-center`}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Orders</h3>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="skeleton h-10 w-full" />)}
              </div>
            ) : (stats?.recentOrders?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {stats!.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center text-sm py-2 border-b border-[var(--border)]">
                    <span style={{ color: 'var(--text-primary)' }}>Order #{order.id}</span>
                    <span className="badge badge-green">{order.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No orders yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Get started by browsing our products.
                </p>
                <a href="/products" className="btn btn-primary btn-sm mt-4 inline-flex">Shop Now</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
