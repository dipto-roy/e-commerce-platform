'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, ShoppingCart, Heart, User, Package,
  Home, LogOut, ChevronDown, Search, ShoppingBag,
} from 'lucide-react';
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

function roleBadgeClass(role: User['role']): string {
  if (role === 'ADMIN') return 'badge badge-green';
  if (role === 'SELLER') return 'badge badge-blue';
  return 'badge badge-gray';
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshCartCount = fetchCartCount;
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
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

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'text-[var(--accent-600)] bg-[var(--accent-50)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--accent-600)] hover:bg-[var(--accent-50)]'
    }`;

  if (loading) {
    return (
      <nav
        className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="container-app">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2 text-xl font-bold text-[var(--accent-600)]">
              <ShoppingBag className="h-5 w-5" />
              ShopNest
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand + Desktop nav */}
          <div className="flex items-center gap-8 shrink-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-xl font-bold text-[var(--accent-600)] hover:text-[var(--accent-700)] transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              ShopNest
            </button>

            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => router.push('/')} className={navLinkClass(pathname === '/')}>
                <Home className="h-4 w-4" />
                Home
              </button>
              <button onClick={() => router.push('/products')} className={navLinkClass(pathname === '/products' || pathname.startsWith('/products'))}>
                <Package className="h-4 w-4" />
                Products
              </button>
            </div>
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 rounded-full"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <button
              onClick={() => router.push('/cart')}
              className="btn btn-ghost btn-icon relative"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 badge badge-green text-[10px] min-w-[1.1rem] h-[1.1rem] px-0 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => router.push('/wishlist')}
              className="btn btn-ghost btn-icon"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Notifications */}
            {user && (
              <div className="relative z-40">
                <NotificationBell />
              </div>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-600)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--accent-50)]"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] py-1 z-50"
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{user.username}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      <span className={`${roleBadgeClass(user.role)} mt-1.5`}>{user.role}</span>
                    </div>

                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/user/profile'); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-600)] transition-colors"
                    >
                      Profile
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/dashboard/admin'); }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-600)] transition-colors flex items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Admin Dashboard
                      </button>
                    )}

                    {user.role === 'SELLER' && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/seller/dashboard'); }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-600)] transition-colors flex items-center gap-2"
                      >
                        <Package className="h-4 w-4" />
                        Seller Dashboard
                      </button>
                    )}

                    {user.role === 'USER' && (
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/user/dashboard'); }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-600)] transition-colors flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        My Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/orders'); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-600)] transition-colors"
                    >
                      Orders
                    </button>

                    <div className="border-t border-[var(--border)] mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-error)] hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push('/Singup')}
                  className="btn btn-primary btn-sm"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn btn-ghost btn-icon ml-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]">
          <div className="container-app py-4 space-y-2">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 rounded-full"
                />
              </div>
            </form>

            <button
              onClick={() => router.push('/')}
              className={`w-full text-left ${navLinkClass(pathname === '/')}`}
            >
              <Home className="h-5 w-5" />
              Home
            </button>

            <button
              onClick={() => router.push('/products')}
              className={`w-full text-left ${navLinkClass(pathname.startsWith('/products'))}`}
            >
              <Package className="h-5 w-5" />
              Products
            </button>

            {!user && (
              <div className="pt-3 border-t border-[var(--border)] space-y-2">
                <button
                  onClick={() => router.push('/login')}
                  className="btn btn-outline btn-full"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push('/Singup')}
                  className="btn btn-primary btn-full"
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
