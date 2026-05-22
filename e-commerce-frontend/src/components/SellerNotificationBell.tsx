'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, Package, DollarSign, Eye, Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface SellerNotificationBellProps {
  className?: string;
}

const TYPE_LUCIDE: Record<string, React.ElementType> = {
  order:        Package,
  payment:      DollarSign,
  payout:       DollarSign,
  verification: CheckCircle,
  product:      Package,
  default:      Bell,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  order:        { bg: 'var(--accent-50)',    color: 'var(--accent-600)' },
  payment:      { bg: '#ecfdf5',             color: '#059669' },
  payout:       { bg: '#ecfdf5',             color: '#059669' },
  verification: { bg: '#ecfdf5',             color: '#059669' },
  product:      { bg: '#fff7ed',             color: '#ea580c' },
};

function timeAgo(timestamp: Date): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SellerNotificationBell: React.FC<SellerNotificationBellProps> = ({ className = '' }) => {
  const { notifications, unreadCount, markAsRead, clearNotification, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    const url = notification.actionUrl ?? {
      order:   '/seller/orders',
      payment: '/seller/financial',
      product: '/seller/products',
    }[notification.type as string] ?? '/seller/dashboard';
    window.location.href = url;
  };

  const displayNotifications = notifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5" style={{ color: unreadCount > 0 ? 'var(--accent-600)' : 'var(--text-secondary)' }} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white"
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 card overflow-hidden shadow-xl z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
            style={{ background: 'var(--bg-secondary)' }}>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`btn btn-icon btn-ghost ${soundEnabled ? '' : 'opacity-50'}`}
                title={`Sound ${soundEnabled ? 'on' : 'off'}`}
              >
                <Settings className="h-4 w-4" style={{ color: soundEnabled ? 'var(--accent-600)' : 'var(--text-muted)' }} />
              </button>
              <button onClick={() => setIsOpen(false)} className="btn btn-icon btn-ghost">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>No notifications yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  New orders and updates will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {displayNotifications.map(notification => {
                  const Icon = TYPE_LUCIDE[notification.type] ?? TYPE_LUCIDE.default;
                  const ts = TYPE_COLOR[notification.type] ?? { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
                  const isUrgent = (notification as any).urgent;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] border-l-4 ${
                        isUrgent
                          ? 'border-l-red-500 bg-red-50'
                          : !notification.read
                          ? 'border-l-[var(--accent-500)] bg-[var(--accent-50)]'
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="p-1.5 rounded-full shrink-0"
                          style={isUrgent
                            ? { background: '#fee2e2', color: '#ef4444' }
                            : { background: ts.bg, color: ts.color }
                          }>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm line-clamp-1 ${!notification.read ? 'font-semibold' : 'font-medium'}`}
                              style={{ color: 'var(--text-primary)' }}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 shrink-0">
                              {isUrgent && <span className="w-2 h-2 rounded-full bg-red-500" />}
                              <button
                                onClick={e => { e.stopPropagation(); clearNotification(notification.id); }}
                                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                title="Dismiss"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {notification.message}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between"
              style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => { notifications.forEach(n => markAsRead(n.id)); setIsOpen(false); }}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--accent-600)' }}
              >
                Mark all as read
              </button>
              <button
                onClick={() => { setIsOpen(false); window.location.href = '/seller/notifications'; }}
                className="text-xs font-medium flex items-center gap-1 hover:underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Eye className="h-3.5 w-3.5" />
                View all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerNotificationBell;
