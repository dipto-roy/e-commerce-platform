'use client';
import React, { useEffect, useState } from 'react';
import { Users, Store, Clock, Package, RefreshCw } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationBell from '@/components/NotificationBell';
import StatsOverviewChart from '@/components/admin/StatsOverviewChart';
import UserDistributionChart from '@/components/admin/UserDistributionChart';
import StatsLineChart from '@/components/admin/StatsLineChart';
import SellerStatusChart from '@/components/admin/SellerStatusChart';
import AdminPayments from '@/components/admin/AdminPayments';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  pendingSellers: number;
  totalProducts: number;
  totalOrders: number;
  recentOrders: any[];
}

const STAT_CARDS = [
  { key: 'totalUsers',    label: 'Total Users',     icon: Users,   color: 'var(--accent-500)' },
  { key: 'totalSellers',  label: 'Total Sellers',   icon: Store,   color: '#3b82f6' },
  { key: 'pendingSellers',label: 'Pending Sellers', icon: Clock,   color: '#f59e0b' },
  { key: 'totalProducts', label: 'Total Products',  icon: Package, color: '#8b5cf6' },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { notifications, isConnected } = useNotifications();

  useEffect(() => {
    const orderNotifs = notifications.filter(
      n => n.type === 'order' && (Date.now() - new Date(n.timestamp).getTime()) < 60000
    );
    if (orderNotifs.length > 0) fetchDashboardData();
  }, [notifications]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboardStats();
      const d = res.data;
      setStats({
        totalUsers: d.totalUsers || 0,
        totalSellers: d.totalSellers || 0,
        pendingSellers: d.pendingSellers || 0,
        totalProducts: d.totalProducts || 0,
        totalOrders: 0,
        recentOrders: d.recentOrders || [],
      });
      addToast('Dashboard updated', 'success');
    } catch {
      addToast('Failed to load dashboard data', 'error');
      setStats({ totalUsers: 0, totalSellers: 0, pendingSellers: 0, totalProducts: 0, totalOrders: 0, recentOrders: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-7 w-40" />
          <div className="skeleton h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-4 w-3/4 mb-3" />
              <div className="skeleton h-7 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="section-title">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className={`text-xs font-semibold ${isConnected ? 'text-[var(--accent-600)]' : 'text-red-500'}`}>
              ● {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button onClick={fetchDashboardData} className="btn btn-outline btn-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}1a` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats?.[key] ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {stats && (
        <>
          <div className="card p-4 overflow-hidden">
            <StatsOverviewChart
              totalUsers={stats.totalUsers}
              totalSellers={stats.totalSellers}
              pendingSellers={stats.pendingSellers}
              totalProducts={stats.totalProducts}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4 overflow-hidden">
              <UserDistributionChart
                totalUsers={stats.totalUsers}
                totalSellers={stats.totalSellers}
                pendingSellers={stats.pendingSellers}
              />
            </div>
            <div className="card p-4 overflow-hidden">
              <SellerStatusChart
                totalSellers={stats.totalSellers}
                pendingSellers={stats.pendingSellers}
              />
            </div>
          </div>

          <div className="card p-4 overflow-hidden">
            <StatsLineChart
              totalUsers={stats.totalUsers}
              totalSellers={stats.totalSellers}
              totalProducts={stats.totalProducts}
            />
          </div>
        </>
      )}

      {/* Payments */}
      <AdminPayments />

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: '👥', title: 'Manage Users', desc: 'View and manage all users', href: '/dashboard/admin/users' },
            { emoji: '🏪', title: 'Pending Sellers', desc: 'Review seller applications', href: '/dashboard/admin/sellers' },
            { emoji: '📧', title: 'Send Email', desc: 'Send notifications to users', href: '/dashboard/admin/emails' },
          ].map(({ emoji, title, desc, href }) => (
            <a key={href} href={href}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-300)] hover:bg-[var(--accent-50)] transition-all text-center block">
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        <div className="space-y-3">
          {[
            { dot: 'var(--accent-500)', text: 'New user registration: john@example.com', time: '2 hours ago' },
            { dot: '#f59e0b',            text: 'Seller application pending review',          time: '4 hours ago' },
            { dot: '#3b82f6',            text: 'New product added: Gaming Mouse',            time: '6 hours ago' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
              <span className="flex-1" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
