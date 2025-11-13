'use client';
import React, { useEffect, useState } from 'react';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { notifications, unreadCount, isConnected } = useNotifications();

  // Auto-refresh dashboard when new order notifications arrive
  useEffect(() => {
    const orderNotifications = notifications.filter(n => 
      n.type === 'order' && 
      (new Date().getTime() - new Date(n.timestamp).getTime()) < 60000 // Last minute
    );
    
    if (orderNotifications.length > 0) {
      console.log('🔄 New order notification detected, refreshing dashboard stats...');
      fetchDashboardData();
    }
  }, [notifications]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the new getDashboardStats method that properly fetches real data
      const dashboardStats = await adminAPI.getDashboardStats();
      console.log('📊 Dashboard stats received:', dashboardStats.data);
      
      setStats({
        totalUsers: dashboardStats.data.totalUsers || 0,
        totalSellers: dashboardStats.data.totalSellers || 0,
        pendingSellers: dashboardStats.data.pendingSellers || 0,
        totalProducts: dashboardStats.data.totalProducts || 0,
        totalOrders: 0, // Will be implemented when order endpoints are available
        recentOrders: dashboardStats.data.recentOrders || []
      });
      
      addToast('Dashboard data updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addToast('Failed to load dashboard data', 'error');
      
      // Fallback to demo data if API calls fail
      setStats({
        totalUsers: 0,
        totalSellers: 0,
        pendingSellers: 0,
        totalProducts: 0,
        totalOrders: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Real-time notification bell */}
          <div className="flex items-center space-x-2">
            <NotificationBell />
            {isConnected ? (
              <span className="text-xs text-green-600 font-medium">● Live</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">● Offline</span>
            )}
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-medium text-sm">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-medium text-sm">🏪</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sellers</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalSellers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-medium text-sm">⏳</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Sellers</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.pendingSellers || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white font-medium text-sm">📦</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                <dd className="text-lg font-medium text-gray-900">{stats?.totalProducts || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {stats && (
        <>
          {/* Main Overview Bar Chart */}
          <div className="w-full">
            <StatsOverviewChart
              totalUsers={stats.totalUsers}
              totalSellers={stats.totalSellers}
              pendingSellers={stats.pendingSellers}
              totalProducts={stats.totalProducts}
            />
          </div>

          {/* Detailed Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution Pie Chart */}
            <UserDistributionChart
              totalUsers={stats.totalUsers}
              totalSellers={stats.totalSellers}
              pendingSellers={stats.pendingSellers}
            />

            {/* Seller Status Donut Chart */}
            <SellerStatusChart
              totalSellers={stats.totalSellers}
              pendingSellers={stats.pendingSellers}
            />
          </div>

          {/* Growth Trends Line Chart */}
          <div className="w-full">
            <StatsLineChart
              totalUsers={stats.totalUsers}
              totalSellers={stats.totalSellers}
              totalProducts={stats.totalProducts}
            />
          </div>
        </>
      )}

      {/* Payment Management Section */}
      <AdminPayments />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-900">Manage Users</div>
              <div className="text-xs text-gray-500">View and manage all users</div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium text-gray-900">Pending Sellers</div>
              <div className="text-xs text-gray-500">Review seller applications</div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📧</div>
              <div className="text-sm font-medium text-gray-900">Send Email</div>
              <div className="text-xs text-gray-500">Send notifications to users</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1 text-sm text-gray-600">New user registration: john@example.com</div>
            <div className="text-xs text-gray-400">2 hours ago</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1 text-sm text-gray-600">Seller application pending review</div>
            <div className="text-xs text-gray-400">4 hours ago</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1 text-sm text-gray-600">New product added: Gaming Mouse</div>
            <div className="text-xs text-gray-400">6 hours ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
