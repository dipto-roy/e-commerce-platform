'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminGuard } from '@/hooks/useAuthGuard';
import NotificationBell from '@/components/NotificationBell';
import {
  Users, Store, Package, DollarSign, TrendingUp, Shield,
  FileText, BarChart3, UserCheck, UserX, Eye, Edit, Plus,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number; totalSellers: number; totalProducts: number;
  totalOrders: number; totalRevenue: number; pendingSellers: number;
  activeUsers: number; monthlyGrowth: number;
}

interface User {
  id: number; username: string; email: string;
  role: 'USER' | 'SELLER' | 'ADMIN'; isActive: boolean; createdAt: string;
  seller?: { businessName: string; isVerified: boolean };
}

const TABS = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'users',    name: 'Users',    icon: Users },
  { id: 'sellers',  name: 'Sellers',  icon: Store },
  { id: 'orders',   name: 'Orders',   icon: FileText },
] as const;

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'badge badge-red', SELLER: 'badge badge-green', USER: 'badge badge-blue',
};

export default function AdminDashboard() {
  const { user, loading, isAuthorized } = useAdminGuard();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('overview');

  const fmtCurrency = (v: any) => {
    const n = Number(v || 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  useEffect(() => { if (isAuthorized && user?.id) fetchAdminData(); }, [isAuthorized, user]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      const [statsRes, usersRes] = await Promise.allSettled([
        fetch('http://localhost:4002/admin/stats', { credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
        fetch('http://localhost:4002/users',        { credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const d = await usersRes.value.json();
        setRecentUsers((d.slice ? d.slice(0, 10) : d) as User[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoadingData(false);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      await fetch(`http://localhost:4002/users/${userId}/toggle-status`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      });
      await fetchAdminData();
    } catch { setError('Failed to update user status'); }
  };

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
        <div className="card p-10 max-w-sm text-center">
          <Shield className="w-14 h-14 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Admin privileges required.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount   = stats?.pendingSellers ?? recentUsers.filter(u => u.role === 'SELLER' && u.seller && !u.seller.isVerified).length;
  const activeCount    = stats?.activeUsers    ?? recentUsers.filter(u => u.isActive).length;
  const verifiedCount  = recentUsers.filter(u => u.role === 'SELLER' && u.seller?.isVerified).length;

  const STAT_CARDS = [
    { label: 'Total Users',    value: stats?.totalUsers    ?? recentUsers.length, icon: Users,      color: 'var(--accent-500)' },
    { label: 'Total Sellers',  value: stats?.totalSellers  ?? recentUsers.filter(u => u.role === 'SELLER').length, icon: Store, color: '#10b981' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0,                  icon: Package,    color: '#8b5cf6' },
    { label: 'Total Revenue',  value: `$${fmtCurrency(stats?.totalRevenue)}`,     icon: DollarSign, color: '#f59e0b' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Admin Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Manage your e-commerce platform
              </p>
            </div>
            <NotificationBell />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 border-b border-[var(--border)]">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[var(--accent-500)]'
                      : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                  style={{ color: activeTab === tab.id ? 'var(--accent-600)' : 'var(--text-secondary)' }}>
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {error && (
          <div className="alert alert-error mb-6"><span>{error}</span></div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { onClick: () => router.push('/dashboard/admin/sellers'), icon: UserCheck, color: 'var(--accent-500)', title: 'Verify Sellers',  desc: `${pendingCount} pending` },
                  { onClick: () => router.push('/dashboard/admin/users'),   icon: Users,     color: '#3b82f6',         title: 'Manage Users',    desc: `${activeCount} active` },
                  { onClick: () => router.push('/dashboard/admin'),         icon: TrendingUp, color: '#8b5cf6',        title: 'View Analytics',  desc: 'Platform insights' },
                ].map(({ onClick, icon: Icon, color, title, desc }) => (
                  <button key={title} onClick={onClick}
                    className="card p-4 flex items-center gap-3 card-interactive text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Users</h3>
              <button onClick={() => router.push('/dashboard/admin/users')} className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Manage All
              </button>
            </div>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <span className="spinner" style={{ width: '2rem', height: '2rem' }} />
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          {u.seller && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.seller.businessName}</p>}
                        </td>
                        <td><span className={ROLE_BADGE[u.role] || 'badge badge-gray'}>{u.role}</span></td>
                        <td>
                          <span className={u.isActive ? 'badge badge-green' : 'badge badge-red'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => router.push(`/admin/users/${u.id}`)}
                              className="btn btn-icon btn-ghost" style={{ color: 'var(--accent-600)' }}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                              className="btn btn-icon btn-ghost">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleUserStatus(u.id)}
                              className={`btn btn-icon btn-ghost ${u.isActive ? 'text-red-500' : 'text-emerald-600'}`}>
                              {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SELLERS */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Seller Management</h3>
              <button onClick={() => router.push('/dashboard/admin/sellers')} className="btn btn-primary btn-sm">
                Manage All Sellers
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Pending Verification', value: pendingCount, color: '#f59e0b', desc: 'Sellers awaiting approval' },
                { label: 'Verified Sellers',     value: verifiedCount, color: 'var(--accent-500)', desc: 'Active verified sellers' },
              ].map(({ label, value, color, desc }) => (
                <div key={label} className="card p-6">
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h4>
                  <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Order Management</h3>
              <button onClick={() => router.push('/dashboard/admin/orders')} className="btn btn-primary btn-sm">
                View All Orders
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Orders',   value: stats?.totalOrders   ?? 0,                     color: '#3b82f6', desc: 'All time' },
                { label: 'Total Revenue',  value: `$${fmtCurrency(stats?.totalRevenue)}`,        color: 'var(--accent-500)', desc: 'Platform revenue' },
                { label: 'Monthly Growth', value: `${stats?.monthlyGrowth ?? 0}%`,               color: '#8b5cf6', desc: 'Growth rate' },
              ].map(({ label, value, color, desc }) => (
                <div key={label} className="card p-6">
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h4>
                  <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
