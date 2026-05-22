'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { Menu, ChevronDown } from 'lucide-react';

interface HeaderProps { onSidebarToggle: () => void; }

export default function Header({ onSidebarToggle }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="px-4 py-3 border-b border-[var(--border)]"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onSidebarToggle}
            className="btn btn-icon btn-ghost lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl transition-colors hover:bg-[var(--bg-secondary)]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'var(--accent-500)' }}>
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.username || 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: 'var(--text-muted)' }} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-52 card py-1 z-50 shadow-[var(--shadow-lg)]">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowDropdown(false); router.push('/user/profile'); }}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    Profile Settings
                  </button>
                  <div className="px-4 py-2">
                    <LogoutButton variant="minimal" size="sm" className="w-full justify-start" />
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
