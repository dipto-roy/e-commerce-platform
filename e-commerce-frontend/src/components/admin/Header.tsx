'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import { Menu, ChevronDown, LogOut, User } from 'lucide-react';
import NotificationBell from '@/components/admin/NotificationBell';

interface HeaderProps { onSidebarToggle: () => void; }

export default function Header({ onSidebarToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setShowDropdown(false);
      await logout(); // AuthContext.logout() handles router.push('/login')
    } catch {
      // logout failed — force redirect
      router.push('/login');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header
      className="px-4 py-3 border-b border-[var(--border)] shrink-0"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left — sidebar toggle (mobile) + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="btn btn-icon btn-ghost lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-lg font-semibold hidden sm:block"
            style={{ color: 'var(--text-primary)' }}
          >
            Admin Dashboard
          </h1>
        </div>

        {/* Right — bell + avatar */}
        <div className="flex items-center gap-2">
          {/* Notification bell — connected to backend via NotificationContext */}
          <NotificationBell />

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: 'var(--accent-500)' }}
              >
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span
                className="hidden md:block text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.username || 'Admin'}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 hidden md:block"
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div
                  className="absolute right-0 mt-2 w-52 card py-1 z-50"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {user?.email}
                    </p>
                    <span className="badge badge-green mt-1.5">Admin</span>
                  </div>

                  {/* Profile */}
                  <button
                    onClick={() => { setShowDropdown(false); router.push('/user/profile'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  {/* Sign out */}
                  <div className="border-t border-[var(--border)] mt-1">
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-red-50 disabled:opacity-50"
                      style={{ color: 'var(--color-error)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      {signingOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
