'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationBellProps {
  className?: string;
  showDropdown?: boolean;
}

const TYPE_EMOJI: Record<string, string> = {
  order: '📦', payment: '💳', verification: '✅', payout: '💰', product: '🛍️', system: '⚙️',
};

function timeAgo(timestamp: Date): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '', showDropdown = true }) => {
  const { notifications, unreadCount, markAsRead, clearNotification, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
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
    if (notification.actionUrl) window.location.href = notification.actionUrl;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => showDropdown && setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className="w-5 h-5" style={{ color: unreadCount > 0 ? 'var(--accent-600)' : 'var(--text-secondary)' }} />

        {/* Connection dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          title={isConnected ? 'Connected' : 'Disconnected'} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && isOpen && (
        <div className="absolute right-0 mt-2 w-80 card overflow-hidden shadow-xl z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
            style={{ background: 'var(--bg-secondary)' }}>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-icon btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No notifications</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.slice(0, 10).map(n => (
                  <div key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${
                      !n.read ? 'border-l-4 border-l-[var(--accent-500)]' : ''
                    }`}
                    style={!n.read ? { background: 'var(--accent-50)' } : {}}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{TYPE_EMOJI[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {n.title}
                          </p>
                          <button onClick={e => { e.stopPropagation(); clearNotification(n.id); }}
                            className="shrink-0 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</span>
                          {n.data?.urgent && <span className="badge badge-red text-[10px]">Urgent</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-center"
              style={{ background: 'var(--bg-secondary)' }}>
              <button onClick={() => { setIsOpen(false); window.location.href = '/notifications'; }}
                className="text-xs font-semibold hover:underline" style={{ color: 'var(--accent-600)' }}>
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
