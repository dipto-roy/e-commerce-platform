'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';
import { useNotifications } from '@/contexts/NotificationContext';
import { sellerDashboardAPI } from '@/utils/api';
import { Package, DollarSign, ShoppingCart, Users } from 'lucide-react';
import SellerNotificationBell from '@/components/SellerNotificationBell';
import NotificationPopupManager from '@/components/NotificationPopupManager';

interface DashboardStats {
  seller: {
    id: number;
    username: string;
    fullName: string;
    phone: string;
    isActive: boolean;
    joinedAt: string;
  };
  analytics: {
    products: {
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
      totalStock: number;
    };
    orders: {
      totalOrders: number;
      pendingOrders: number;
      confirmedOrders: number;
      shippedOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
    };
    financial: {
      totalEarnings: number;
      pendingPayouts: number;
      completedPayouts: number;
      platformFees: number;
      monthlyEarnings: number;
    };
  };
  recentOrders: any[];
}

export default function SellerDashboard() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const { logout } = useAuth();
  const { notifications, unreadCount, isConnected } = useNotifications();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Safe currency formatter
  const formatCurrency = (value: any): string => {
    const numValue = Number(value || 0);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  // Debug notification system
  useEffect(() => {
    console.log('🔔 Seller Dashboard - Notification Debug:', {
      userId: user?.id,
      userRole: user?.role,
      notificationCount: notifications.length,
      unreadCount,
      isConnected,
      recentNotifications: notifications.slice(0, 3).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        timestamp: n.timestamp
      }))
    });
  }, [user, notifications, unreadCount, isConnected]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!user || !user.isVerified) {
      console.log('❌ Cannot fetch dashboard stats: User not verified');
      return;
    }
    
    try {
      setStatsLoading(true);
      const response = await sellerDashboardAPI.getDashboardOverview();
      setDashboardStats(response.data as DashboardStats);
      console.log('📊 Dashboard stats loaded successfully');
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error.response?.status || error.message);
      
      if (error.response?.status === 403) {
        console.error('🚨 403 Forbidden - Check user permissions');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // Load dashboard data when component mounts and user is verified
  useEffect(() => {
    if (user && user.isVerified) {
      console.log('🔍 Seller Dashboard - Current User Info:', {
        id: user.id,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified
      });
      fetchDashboardStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
              <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.fullName || user?.username}!</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Enhanced Seller Notification Bell with Popup Messages */}
              <SellerNotificationBell 
                className="relative"
              />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900 border-b border-yellow-600 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-yellow-100 font-bold mb-2">🔧 Notification Debug Panel</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-yellow-800 p-2 rounded">
                <strong className="text-yellow-100">User ID:</strong>
                <p className="text-yellow-200">{user?.id || 'Not set'}</p>
              </div>
              <div className="bg-yellow-800 p-2 rounded">
                <strong className="text-yellow-100">Role:</strong>
                <p className="text-yellow-200">{user?.role || 'Not set'}</p>
              </div>
              <div className="bg-yellow-800 p-2 rounded">
                <strong className="text-yellow-100">Connection:</strong>
                <p className={`${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                  {isConnected ? '✅ Connected' : '❌ Disconnected'}
                </p>
              </div>
              <div className="bg-yellow-800 p-2 rounded">
                <strong className="text-yellow-100">Notifications:</strong>
                <p className="text-yellow-200">{notifications.length} total, {unreadCount} unread</p>
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="mt-2">
                <strong className="text-yellow-100">Recent Notifications:</strong>
                <div className="mt-1 space-y-1">
                  {notifications.slice(0, 3).map(n => (
                    <div key={n.id} className="text-xs text-yellow-200 bg-yellow-800 p-1 rounded">
                      [{n.type}] {n.title} - {new Date(n.timestamp).toLocaleTimeString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Status Alert */}
      {user && !user.isVerified && (
        <div className="bg-yellow-600 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-200">
                  Your seller account is being reviewed by our admin team. You'll receive an email notification once your account is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Info Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Seller Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Full Name:</strong> {user?.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p><strong>Account Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${user?.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p><strong>Verification Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${user?.isVerified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : dashboardStats?.analytics?.products?.totalProducts || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${statsLoading ? '...' : formatCurrency(dashboardStats?.analytics?.orders?.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : dashboardStats?.analytics?.orders?.pendingOrders || 0}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : dashboardStats?.analytics?.orders?.totalOrders || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* My Products */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">My Products</h3>
            <p className="text-gray-400 mb-4">Manage your product listings</p>
            <button
              onClick={() => router.push('/seller/products')}
              disabled={!user?.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user?.isVerified
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user?.isVerified ? 'Manage Products' : 'Verification Required'}
            </button>
          </div>

          {/* Add Product */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Add Product</h3>
            <p className="text-gray-400 mb-4">List new products for sale</p>
            <button
              onClick={() => router.push('/seller/products/new')}
              disabled={!user?.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user?.isVerified
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user?.isVerified ? 'Add Product' : 'Verification Required'}
            </button>
          </div>

          {/* Orders */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Orders</h3>
            <p className="text-gray-400 mb-4">View and manage your orders</p>
            <button
              onClick={() => router.push('/seller/orders')}
              disabled={!user?.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user?.isVerified
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user?.isVerified ? 'View Orders' : 'Verification Required'}
            </button>
          </div>

          {/* Mail Center */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Mail Center</h3>
            <p className="text-gray-400 mb-4">Communicate with your customers</p>
            <button
              onClick={() => router.push('/seller/mail')}
              disabled={!user?.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user?.isVerified
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user?.isVerified ? 'Send Messages' : 'Verification Required'}
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Analytics</h3>
            <p className="text-gray-400 mb-4">View your sales analytics</p>
            <button
              onClick={() => router.push('/seller/analytics')}
              disabled={!user?.isVerified}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                user?.isVerified
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {user?.isVerified ? 'View Analytics' : 'Verification Required'}
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Help & Support</h3>
            <p className="text-gray-400 mb-4">Get help with selling</p>
            <button
              onClick={() => router.push('/support')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Seller Overview</h2>
          {user?.isVerified ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {statsLoading ? '...' : dashboardStats?.analytics?.products?.totalProducts || 0}
                </div>
                <div className="text-gray-400">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {statsLoading ? '...' : dashboardStats?.analytics?.orders?.totalOrders || 0}
                </div>
                <div className="text-gray-400">Orders Received</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  ${statsLoading ? '...' : formatCurrency(dashboardStats?.analytics?.orders?.totalRevenue)}
                </div>
                <div className="text-gray-400">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {statsLoading ? '...' : dashboardStats?.recentOrders?.length || 0}
                </div>
                <div className="text-gray-400">Recent Orders</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-yellow-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Account Verification Pending</h3>
              <p className="text-gray-400">
                Your seller account is being reviewed by our admin team. 
                You'll receive an email notification once your account is verified.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Notification Popup Manager for React Popup Messages */}
      <NotificationPopupManager
        enabled={true}
        maxPopups={3}
        defaultDuration={6000}
        position="top-right"
        playSound={true}
      />
    </div>
  );
}
