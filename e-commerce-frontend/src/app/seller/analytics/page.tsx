'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { financialAPI } from '@/utils/api';
import {
  DollarSign, ShoppingCart, Package, BarChart3,
  Clock, CheckCircle, RefreshCw, XCircle,
} from 'lucide-react';

interface DashboardAnalytics {
  totalProducts: number; activeProducts: number; totalOrders: number;
  totalRevenue: number; pendingOrders: number; completedOrders: number;
  averageOrderValue: number; conversionRate: number;
  topSellingProducts: Array<{ productId: number; productName: string; totalSold: number; revenue: number }>;
  monthlyStats: Array<{ month: string; orders: number; revenue: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

interface ProductAnalytics {
  productViews: number; totalSales: number; averageRating: number;
  stockLevel: string; performanceScore: number;
}

const fmt = (v: any) => { const n = Number(v || 0); return isNaN(n) ? '0.00' : n.toFixed(2); };
const fmtN = (v: any, d = 1) => { const n = Number(v || 0); return isNaN(n) ? '0' : n.toFixed(d); };

export default function SellerAnalytics() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (user && isAuthorized) {
      fetchAnalytics();
      const id = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(id);
    }
  }, [user, isAuthorized, selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const res = await financialAPI.getMySummary();
      if (res.data) {
        const d = res.data as any;
        setAnalytics({
          totalProducts: d.totalProducts || 0, activeProducts: d.activeProducts || 0,
          totalOrders: d.totalOrders || 0, totalRevenue: d.totalRevenue || 0,
          pendingOrders: d.pendingOrders || 0, completedOrders: d.completedOrders || 0,
          averageOrderValue: d.averageOrderValue || 0, conversionRate: d.conversionRate || 0,
          topSellingProducts: d.topSellingProducts || [], monthlyStats: d.monthlyStats || [],
          recentActivity: d.recentActivity || [],
        });
        if (d.productAnalytics) setProductAnalytics({ productViews: d.productAnalytics.productViews || 0, totalSales: d.productAnalytics.totalSales || 0, averageRating: d.productAnalytics.averageRating || 0, stockLevel: d.productAnalytics.stockLevel || 'Unknown', performanceScore: d.productAnalytics.performanceScore || 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      setAnalytics({ totalProducts: 0, activeProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0, averageOrderValue: 0, conversionRate: 0, topSellingProducts: [], monthlyStats: [], recentActivity: [] });
    } finally { setLoadingData(false); }
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
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full mt-4">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Sales Analytics</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Track your performance and growth
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="input"
                style={{ width: 'auto' }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button onClick={fetchAnalytics} disabled={loadingData} className="btn btn-outline btn-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => router.push('/seller/dashboard')} className="btn btn-outline btn-sm">
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {loadingData && (
          <div className="flex justify-center py-16">
            <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
          </div>
        )}

        {error && !loadingData && (
          <div className="alert alert-error mb-6">
            <XCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button onClick={fetchAnalytics} className="btn btn-outline btn-sm mt-2">Retry</button>
            </div>
          </div>
        )}

        {!loadingData && analytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue',   value: `$${fmt(analytics.totalRevenue)}`,       icon: DollarSign,  color: '#10b981' },
                { label: 'Total Orders',    value: analytics.totalOrders,                    icon: ShoppingCart, color: '#3b82f6' },
                { label: 'Active Products', value: analytics.activeProducts,                 icon: Package,     color: '#8b5cf6' },
                { label: 'Avg Order Value', value: `$${fmt(analytics.averageOrderValue)}`,   icon: BarChart3,   color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
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

            {/* Order Status & Product Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Order Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Pending Orders',  value: analytics.pendingOrders,                   icon: Clock,         color: '#f59e0b' },
                    { label: 'Completed Orders', value: analytics.completedOrders,                 icon: CheckCircle,   color: '#10b981' },
                    { label: 'Conversion Rate', value: `${fmtN(analytics.conversionRate, 1)}%`,   icon: BarChart3,     color: '#3b82f6' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      </div>
                      <span className="font-semibold text-sm" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {productAnalytics && (
                <div className="card p-6">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Product Performance</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Views',        value: productAnalytics.productViews.toLocaleString(), color: '#3b82f6' },
                      { label: 'Total Sales',        value: productAnalytics.totalSales,                    color: '#10b981' },
                      { label: 'Average Rating',     value: `${fmtN(productAnalytics.averageRating, 1)} ⭐`, color: '#f59e0b' },
                      { label: 'Performance Score',  value: `${fmtN(productAnalytics.performanceScore, 1)}/100`, color: '#8b5cf6' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        <span className="font-semibold text-sm" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Selling Products */}
            {analytics.topSellingProducts.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top Selling Products</h3>
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topSellingProducts.map((product) => (
                        <tr key={product.productId}>
                          <td style={{ color: 'var(--text-primary)' }}>{product.productName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{product.totalSold}</td>
                          <td style={{ color: 'var(--accent-600)', fontWeight: 600 }}>
                            ${product.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Manage Orders',       sub: 'View and update order status',   href: '/seller/orders',    primary: false },
                  { label: 'Financial Dashboard', sub: 'Track earnings and payouts',     href: '/seller/financial', primary: true },
                  { label: 'Manage Products',     sub: 'Add or edit your listings',      href: '/seller/products',  primary: false },
                ].map(({ label, sub, href, primary }) => (
                  <a key={label} href={href}
                    className={`card p-4 text-center transition-all ${primary ? 'border-[var(--accent-400)]' : 'card-interactive'}`}
                    style={primary ? { background: 'var(--accent-50)', borderColor: 'var(--accent-400)' } : {}}>
                    <p className="font-semibold text-sm" style={{ color: primary ? 'var(--accent-700)' : 'var(--text-primary)' }}>
                      {label}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
