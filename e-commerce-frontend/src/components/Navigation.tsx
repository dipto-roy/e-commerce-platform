'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Heart, User, Package, Home, LogOut, ChevronDown, Search } from 'lucide-react';
import { cartAPI } from '@/config/api';
import { useAuth } from '@/contexts/AuthContextNew';
import NotificationBell from './NotificationBell';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  isActive: boolean;
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth(); // Use centralized auth state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const fetchCartCount = async () => {
    if (user) {
      try {
        const count = await cartAPI.getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  // Expose refreshCartCount function globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshCartCount = fetchCartCount;
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout(); // Use the centralized logout from AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600">E-Commerce</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="text-xl font-bold text-blue-600 cursor-pointer"
              onClick={() => router.push('/')}
            >
              E-Commerce
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => router.push('/')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => router.push('/products')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/products'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Products</span>
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/wishlist')}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Heart className="h-6 w-6" />
              </button>

            {/* Notifications - Enhanced for different user roles */}
            {user && (
              <div className="relative z-40">
                <NotificationBell />
              </div>
            )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-6 w-6" />
                  <span className="hidden md:block text-sm font-medium">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/user/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/orders');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Orders
                    </button>

                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push('/Singup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </button>
            
            <button
              onClick={() => router.push('/products')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Products</span>
            </button>

            {!user && (
              <div className="pt-4 border-t space-y-2">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full px-4 py-2 text-gray-700 hover:text-blue-600 text-left font-medium transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push('/Singup')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
