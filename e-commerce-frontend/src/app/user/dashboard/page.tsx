'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContextNew';
import { userDashboardAPI } from '@/utils/api';

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
      
      // Auto-refresh every 30 seconds for live count
      const interval = setInterval(() => {
        fetchUserStats();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, isAuthorized, loading]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await userDashboardAPI.getDashboardStats();
      setStats(response.data as UserStats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Set default values on error
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalAmount: '0.00',
        totalSpent: '0.00',
        recentOrders: []
      });
    } finally {
      setStatsLoading(false);
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

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.fullName || user.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div>
              <p><strong>Full Name:</strong> {user.fullName || 'Not provided'}</p>
              <p><strong>Account Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Browse Products */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Browse Products</h3>
            <p className="text-gray-400 mb-4">Explore our wide range of products</p>
            <button
              onClick={() => router.push('/products')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Products
            </button>
          </div>

          {/* My Orders */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">My Orders</h3>
            <p className="text-gray-400 mb-4">Track your order history and status</p>
            <button
              onClick={() => router.push('/user/orders')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              View Orders
            </button>
          </div>

          {/* Profile Settings */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Profile Settings</h3>
            <p className="text-gray-400 mb-4">Update your account information</p>
            <button
              onClick={() => router.push('/user/profile')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {statsLoading ? '...' : stats?.totalOrders || 0}
              </div>
              <div className="text-gray-400">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                ${statsLoading ? '0.00' : stats?.totalSpent || '0.00'}
              </div>
              <div className="text-gray-400">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-gray-400">Wishlist Items</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
