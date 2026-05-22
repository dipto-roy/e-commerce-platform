'use client';
import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Bell, X, Check, CheckCheck, Trash2,
  Package, CreditCard, Store, Settings,
} from 'lucide-react';

const TYPE_ICON: Record<string, React.ReactNode> = {
  order:   <Package    className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  seller:  <Store      className="w-4 h-4" />,
  product: <Package    className="w-4 h-4" />,
  system:  <Settings   className="w-4 h-4" />,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  order:   { bg: 'var(--accent-50)', color: 'var(--accent-600)' },
  payment: { bg: '#ecfdf5',          color: '#059669' },
  seller:  { bg: '#f5f3ff',          color: '#7c3aed' },
  product: { bg: '#fff7ed',          color: '#ea580c' },
  system:  { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
};

function formatTime(timestamp: Date): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const NotificationPanel: React.FC = () => {
  const {
    notifications, unreadCount, markAsRead, markAllAsRead,
    clearNotification, clearAllNotifications, isConnected,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const typeStyle = (type: string) => TYPE_COLOR[type] ?? TYPE_COLOR.system;

  return (
    <div className="relative inline-block" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" style={{ color: unreadCount > 0 ? 'var(--accent-600)' : 'var(--text-secondary)' }} />

        {/* Connection dot */}
        <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          title={isConnected ? 'Connected' : 'Disconnected'} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-80 card overflow-hidden shadow-xl z-[100]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
              style={{ background: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="badge badge-green">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Connection */}
                <span className="w-2 h-2 rounded-full mr-1"
                  style={{ background: isConnected ? '#10b981' : '#ef4444' }}
                  title={isConnected ? 'Connected' : 'Disconnected'} />

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-icon btn-ghost" title="Mark all read">
                    <CheckCheck className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifications} className="btn btn-icon btn-ghost text-red-500" title="Clear all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="btn btn-icon btn-ghost">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>No notifications</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    We'll notify you when something important happens.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map(n => {
                    const ts = typeStyle(n.type);
                    return (
                      <div key={n.id}
                        className={`px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)] ${!n.read ? 'bg-[var(--accent-50)]' : ''}`}>
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="p-1.5 rounded-full shrink-0"
                            style={{ background: ts.bg, color: ts.color }}>
                            {TYPE_ICON[n.type] ?? <Bell className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                {n.title}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {!n.read && (
                                  <button onClick={() => markAsRead(n.id)}
                                    className="text-[var(--text-muted)] hover:text-[var(--accent-600)] transition-colors"
                                    title="Mark as read">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button onClick={() => clearNotification(n.id)}
                                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                  title="Clear">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              {n.message}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              {formatTime(n.timestamp)}
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
              <div className="px-4 py-2 border-t border-[var(--border)] text-center"
                style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {isConnected ? 'Real-time notifications active' : 'Reconnecting…'}
                </p>
              </div>
            )}
          </div>

          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
