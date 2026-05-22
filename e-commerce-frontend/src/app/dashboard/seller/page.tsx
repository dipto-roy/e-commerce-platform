'use client';
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LogoutButton from '@/components/LogoutButton';
import { Package, ShoppingCart, DollarSign, Clock, Plus, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SellerDashboardPage() {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  const STATS = [
    { label: 'Total Products', value: '0', icon: Package,      color: '#10b981' },
    { label: 'Total Orders',   value: '—', icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Total Revenue',  value: '$0.00', icon: DollarSign, color: '#8b5cf6' },
    { label: 'Pending Orders', value: '0', icon: Clock,        color: '#f59e0b' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Seller Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user?.username}!
              </p>
            </div>
            <LogoutButton variant="header" size="md" />
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Pending review banner */}
        <div className="alert mb-6" style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '0.75rem',
          padding: '1rem',
        }}>
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
          <div>
            <p className="font-medium text-sm" style={{ color: '#92400e' }}>Account Under Review</p>
            <p className="text-sm mt-0.5" style={{ color: '#b45309' }}>
              Your seller account is being reviewed by admin. You'll be notified once approved.
            </p>
          </div>
        </div>

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
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
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
                { label: 'Add Product',      href: '/seller/products/new', primary: true },
                { label: 'Manage Products',  href: '/seller/products',    primary: false },
                { label: 'View Orders',      href: '/seller/orders',      primary: false },
                { label: 'Profile Settings', href: '/user/profile',       primary: false },
              ].map(({ label, href, primary }) => (
                <a key={label} href={href}
                  className={`btn btn-sm ${primary ? 'btn-primary' : 'btn-outline'} justify-center`}>
                  {primary && <Plus className="w-3.5 h-3.5" />}
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No activity yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Start by adding your first product.
              </p>
              <a href="/seller/products/new" className="btn btn-primary btn-sm mt-4 inline-flex">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
