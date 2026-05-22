'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, Package, ClipboardList,
  BarChart3, Mail, Bell, ShoppingBag, X,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const NAV_LINKS = [
  { href: '/dashboard/admin',               label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/admin/users',          label: 'Users',         icon: Users },
  { href: '/dashboard/admin/sellers',        label: 'Sellers',       icon: Store },
  { href: '/dashboard/admin/products',       label: 'Products',      icon: Package },
  { href: '/dashboard/admin/orders',         label: 'Orders',        icon: ClipboardList },
  { href: '/dashboard/admin/reports',        label: 'Reports',       icon: BarChart3 },
  { href: '/dashboard/admin/emails',         label: 'Email System',  icon: Mail },
  { href: '/dashboard/admin/notifications',  label: 'Notifications', icon: Bell, badge: true },
] as const;

interface SidebarProps { isOpen: boolean; onToggle: () => void; }

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto w-64 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-50)' }}
            >
              <ShoppingBag className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </span>
          </div>
          <button onClick={onToggle} className="lg:hidden btn btn-icon btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon, ...rest }) => {
            const hasBadge = 'badge' in rest && rest.badge;
            const isActive = pathname === href;
            const badgeCount = hasBadge ? unreadCount : 0;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-[var(--accent-700)]' : 'hover:bg-[var(--bg-secondary)]'
                }`}
                style={
                  isActive
                    ? { background: 'var(--accent-50)', color: 'var(--accent-700)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={isActive ? { color: 'var(--accent-600)' } : {}}
                />

                <span className="flex-1">{label}</span>

                {/* Unread badge */}
                {hasBadge && badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}

                {/* Active dot */}
                {isActive && !badgeCount && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--accent-500)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            ShopNest Admin v1.0
          </p>
        </div>
      </div>
    </>
  );
}
