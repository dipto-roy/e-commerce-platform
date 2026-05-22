'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

const notificationSound = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;

const NotificationIndicator: React.FC<{ onToggle?: () => void }> = ({ onToggle }) => {
  const router = useRouter();
  const { notifications, unreadCount, isConnected, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Animate + sound for new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      try { notificationSound?.play().catch(() => {}); } catch {}
      const timer = setTimeout(() => setHasNewNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.notification-container')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleToggle = useCallback(() => {
    setShowDropdown(prev => !prev);
    onToggle?.();
  }, [onToggle]);

  const handleNotificationClick = useCallback((notification: any) => {
    if (!notification.read) markAsRead(notification.id);
    if (notification.type === 'order') router.push(`/orders/${notification.data?.orderId}`);
    else if (notification.type === 'payment') router.push('/payments');
    else if (notification.type === 'product') router.push(`/products/${notification.data?.productId}`);
    setShowDropdown(false);
  }, [markAsRead, router]);

  return (
    <div className="relative inline-flex notification-container">
      <button
        className={`relative p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] focus:ring-offset-2 hover:bg-[var(--bg-secondary)] ${hasNewNotification ? 'animate-bounce' : ''}`}
        onClick={handleToggle}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" style={{ color: unreadCount > 0 ? 'var(--accent-600)' : 'var(--text-secondary)' }} />

        {/* Connection dot */}
        <span
          className={`absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${isConnected ? 'animate-pulse' : ''}`}
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5"
            title={`${unreadCount} unread`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 card overflow-hidden shadow-xl z-50 max-h-[32rem] flex flex-col"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
            style={{ background: 'var(--bg-secondary)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <span className="badge badge-green">{unreadCount} new</span>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)] flex items-start gap-3 ${
                      !notification.read ? 'bg-[var(--accent-50)]' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {notification.read
                        ? <CheckCircle className="h-5 w-5" style={{ color: '#10b981' }} />
                        : <AlertCircle className="h-5 w-5 animate-pulse" style={{ color: 'var(--accent-600)' }} />
                      }
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}
                        style={{ color: 'var(--text-primary)' }}>
                        {notification.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {notification.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <Bell className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No notifications yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>We'll notify you when something arrives</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border)] text-right"
              style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => router.push('/notifications')}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--accent-600)' }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIndicator;
