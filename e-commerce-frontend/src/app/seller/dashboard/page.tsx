'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';
import { useNotifications } from '@/contexts/NotificationContext';
import { sellerDashboardAPI } from '@/utils/api';
import { Package, DollarSign, ShoppingCart, BarChart3, Mail, HelpCircle, Plus, AlertTriangle } from 'lucide-react';
import SellerNotificationBell from '@/components/SellerNotificationBell';
import NotificationPopupManager from '@/components/NotificationPopupManager';

interface DashboardStats {
  seller: { id: number; username: string; fullName: string; phone: string; isActive: boolean; joinedAt: string };
  analytics: {
    products: { totalProducts: number; activeProducts: number; inactiveProducts: number; totalStock: number };
    orders: {
      totalOrders: number; pendingOrders: number; confirmedOrders: number;
      shippedOrders: number; deliveredOrders: number; cancelledOrders: number;
      totalRevenue: number; averageOrderValue: number;
    };
    financial: { totalEarnings: number; pendingPayouts: number; completedPayouts: number; platformFees: number; monthlyEarnings: number };
  };
  recentOrders: any[];
}

const formatCurrency = (value: any) => {
  const n = Number(value || 0);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

const QUICK_LINKS = [
  { label: 'My Products',  desc: 'Manage product listings',        href: '/seller/products',    icon: Package,      key: 'products' },
  { label: 'Add Product',  desc: 'List new products for sale',     href: '/seller/products/new',icon: Plus,         key: 'add' },
  { label: 'Orders',       desc: 'View and manage your orders',    href: '/seller/orders',      icon: ShoppingCart, key: 'orders' },
  { label: 'Mail Center',  desc: 'Communicate with customers',     href: '/seller/mail',        icon: Mail,         key: 'mail' },
  { label: 'Analytics',   desc: 'View your sales analytics',      href: '/seller/analytics',   icon: BarChart3,    key: 'analytics' },
  { label: 'Support',     desc: 'Get help with selling',          href: '/support',            icon: HelpCircle,   key: 'support', noVerify: true },
];

export default function SellerDashboard() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const { logout } = useAuth();
  const { isConnected } = useNotifications();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchDashboardStats = async () => {
    if (!user?.isVerified) return;
    try {
      setStatsLoading(true);
      const response = await sellerDashboardAPI.getDashboardOverview();
      setDashboardStats(response.data as DashboardStats);
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  };

  useEffect(() => {
    if (user?.isVerified) {
      fetchDashboardStats();
      const interval = setInterval(fetchDashboardStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>You don't have permission to access this page.</p>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full">Go to Login</button>
        </div>
      </div>
    );
  }

  const stats = dashboardStats?.analytics;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Seller Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SellerNotificationBell />
                <span className={`text-xs font-semibold ${isConnected ? 'text-[var(--accent-600)]' : 'text-red-500'}`}>
                  ● {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              <button onClick={async () => { await logout(); router.push('/login'); }}
                className="btn btn-danger btn-sm">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8 space-y-6">
        {/* Verification alert */}
        {user && !user.isVerified && (
          <div className="alert alert-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm">
              Your seller account is being reviewed. You'll receive an email once verified.
            </p>
          </div>
        )}

        {/* Seller info */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Seller Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Username:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{user?.username}</span></p>
              <p><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Email:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{user?.email}</span></p>
              <p><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Full Name:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Not provided'}</span></p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Account:</span>
                <span className={user?.isActive ? 'badge badge-green' : 'badge badge-red'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Verification:</span>
                <span className={user?.isVerified ? 'badge badge-green' : 'badge badge-yellow'}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: stats?.products?.totalProducts, icon: Package,      color: 'var(--accent-500)' },
            { label: 'Total Revenue',  value: `$${formatCurrency(stats?.orders?.totalRevenue)}`, icon: DollarSign,  color: '#10b981' },
            { label: 'Pending Orders', value: stats?.orders?.pendingOrders,   icon: ShoppingCart, color: '#f59e0b' },
            { label: 'Total Orders',   value: stats?.orders?.totalOrders,     icon: BarChart3,    color: '#3b82f6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}1a` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {statsLoading ? '…' : (value ?? 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map(({ label, desc, href, icon: Icon, key, noVerify }) => {
            const locked = !noVerify && !user?.isVerified;
            return (
              <div key={key}
                className={`card p-5 flex flex-col ${locked ? 'opacity-60' : 'card-interactive cursor-pointer'}`}
                onClick={() => !locked && router.push(href)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--accent-50)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                {locked && (
                  <p className="text-xs mt-3 font-medium" style={{ color: '#f59e0b' }}>
                    ⚠ Verification required
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Overview */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Seller Overview</h2>
          {user?.isVerified ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Products Listed',  value: stats?.products?.totalProducts, color: 'var(--accent-600)' },
                { label: 'Orders Received',  value: stats?.orders?.totalOrders,     color: '#10b981' },
                { label: 'Total Revenue',    value: `$${formatCurrency(stats?.orders?.totalRevenue)}`, color: '#3b82f6' },
                { label: 'Recent Orders',    value: dashboardStats?.recentOrders?.length || 0, color: '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-3xl font-bold" style={{ color }}>
                    {statsLoading ? '…' : value}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-14 h-14 mx-auto mb-4" style={{ color: '#f59e0b' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Account Verification Pending
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your seller account is being reviewed. You'll receive an email once verified.
              </p>
            </div>
          )}
        </div>
      </div>

      <NotificationPopupManager enabled maxPopups={3} defaultDuration={6000} position="top-right" playSound />
    </div>
  );
}
