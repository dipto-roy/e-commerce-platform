'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { financialAPI } from '@/utils/api';

interface DashboardAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface ProductAnalytics {
  productViews: number;
  totalSales: number;
  averageRating: number;
  stockLevel: string;
  performanceScore: number;
}

export default function SellerAnalytics() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Safe number formatter
  const formatCurrency = (value: any): string => {
    const numValue = Number(value || 0);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  const formatNumber = (value: any, decimals: number = 1): string => {
    const numValue = Number(value || 0);
    return isNaN(numValue) ? '0' : numValue.toFixed(decimals);
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchAnalytics();
      
      // Auto-refresh analytics every 30 seconds for real-time updates
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, isAuthorized, selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoadingData(true);
    setError(null);
    try {
      // Fetch financial summary from the financial API
      const summaryResponse = await financialAPI.getMySummary();
      
      if (summaryResponse.data) {
        const financialData = summaryResponse.data as any; // Type assertion for API response
        
        // Map financial API data to analytics structure
        setAnalytics({
          totalProducts: financialData.totalProducts || 0,
          activeProducts: financialData.activeProducts || 0,
          totalOrders: financialData.totalOrders || 0,
          totalRevenue: financialData.totalRevenue || 0,
          pendingOrders: financialData.pendingOrders || 0,
          completedOrders: financialData.completedOrders || 0,
          averageOrderValue: financialData.averageOrderValue || 0,
          conversionRate: financialData.conversionRate || 0,
          topSellingProducts: financialData.topSellingProducts || [],
          monthlyStats: financialData.monthlyStats || [],
          recentActivity: financialData.recentActivity || []
        });
        
        // Set product analytics if available
        if (financialData.productAnalytics) {
          setProductAnalytics({
            productViews: financialData.productAnalytics.productViews || 0,
            totalSales: financialData.productAnalytics.totalSales || 0,
            averageRating: financialData.productAnalytics.averageRating || 0,
            stockLevel: financialData.productAnalytics.stockLevel || 'Unknown',
            performanceScore: financialData.productAnalytics.performanceScore || 0
          });
        }
      }

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      
      // Set empty data on error
      setAnalytics({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        topSellingProducts: [],
        monthlyStats: [],
        recentActivity: []
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Sales Analytics</h1>
              <p className="text-gray-400">Track your performance and growth</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={() => router.push('/seller/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingData ? (
          <div className="text-center py-8">
            <div className="text-white">Loading analytics...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-600 rounded-md">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">${formatCurrency(analytics?.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-600 rounded-md">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-white">{analytics.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-600 rounded-md">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Active Products</p>
                      <p className="text-2xl font-bold text-white">{analytics.activeProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-600 rounded-md">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Avg Order Value</p>
                      <p className="text-2xl font-bold text-white">${formatCurrency(analytics?.averageOrderValue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Status Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pending Orders</span>
                      <span className="text-yellow-400 font-medium">{analytics.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completed Orders</span>
                      <span className="text-green-400 font-medium">{analytics.completedOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Conversion Rate</span>
                      <span className="text-blue-400 font-medium">{formatNumber(analytics?.conversionRate, 1)}%</span>
                    </div>
                  </div>
                </div>

                {productAnalytics && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Product Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Views</span>
                        <span className="text-blue-400 font-medium">{productAnalytics.productViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Sales</span>
                        <span className="text-green-400 font-medium">{productAnalytics.totalSales}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Average Rating</span>
                        <span className="text-yellow-400 font-medium">{formatNumber(productAnalytics?.averageRating, 1)} ⭐</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Performance Score</span>
                        <span className="text-purple-400 font-medium">{formatNumber(productAnalytics?.performanceScore, 1)}/100</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top Selling Products */}
            {analytics && analytics.topSellingProducts.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-sm font-medium text-gray-400 pb-2">Product</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-2">Units Sold</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {analytics.topSellingProducts.map((product, index) => (
                        <tr key={product.productId} className="border-b border-gray-700">
                          <td className="py-3 text-gray-300">{product.productName}</td>
                          <td className="py-3 text-white font-medium">{product.totalSold}</td>
                          <td className="py-3 text-green-400 font-medium">${product.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/seller/orders')}
                  className="p-4 bg-blue-600 rounded-lg text-white text-center hover:bg-blue-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Manage Orders</div>
                  <div className="text-sm opacity-80">View and update order status</div>
                </button>
                <button
                  onClick={() => router.push('/seller/financial')}
                  className="p-4 bg-green-600 rounded-lg text-white text-center hover:bg-green-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Financial Dashboard</div>
                  <div className="text-sm opacity-80">Track earnings and payouts</div>
                </button>
                <button
                  onClick={() => router.push('/seller/products')}
                  className="p-4 bg-purple-600 rounded-lg text-white text-center hover:bg-purple-700 transition-colors"
                >
                  <div className="text-lg font-semibold">Manage Products</div>
                  <div className="text-sm opacity-80">Add or edit your listings</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}