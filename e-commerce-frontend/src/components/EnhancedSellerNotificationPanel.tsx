'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, X, CheckCircle, Info, Package, DollarSign, ShoppingCart, Eye, Trash2, Star,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationPanelProps {
  className?: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  order:        <ShoppingCart className="w-4 h-4" />,
  payment:      <DollarSign   className="w-4 h-4" />,
  product:      <Package      className="w-4 h-4" />,
  system:       <Info         className="w-4 h-4" />,
  seller:       <Star         className="w-4 h-4" />,
  verification: <Star         className="w-4 h-4" />,
};

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  order:        { bg: 'var(--accent-50)',    color: 'var(--accent-600)' },
  payment:      { bg: '#ecfdf5',             color: '#059669' },
  product:      { bg: '#fff7ed',             color: '#ea580c' },
  system:       { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
  seller:       { bg: '#f5f3ff',             color: '#7c3aed' },
  verification: { bg: '#f5f3ff',             color: '#7c3aed' },
};

function formatTime(timestamp: Date): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const EnhancedSellerNotificationPanel: React.FC<NotificationPanelProps> = ({ className = '' }) => {
  const {
    notifications, unreadCount, markAsRead, markAllAsRead,
    clearNotification, clearAllNotifications, isConnected,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  // Auto-close when empty
  useEffect(() => {
    if (notifications.length === 0 && isOpen) setIsOpen(false);
  }, [notifications.length, isOpen]);

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'order' && notification.data?.orderId) {
      window.location.href = `/seller/orders?highlight=${notification.data.orderId}`;
    } else if (notification.type === 'payment') {
      window.location.href = '/seller/financial';
    } else if (notification.type === 'product' && notification.data?.productId) {
      window.location.href = `/seller/products?highlight=${notification.data.productId}`;
    }
  };

  const typeStyle = (type: string) => TYPE_COLOR[type] ?? TYPE_COLOR.system;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <div className={`relative inline-block ${className}`} ref={panelRef}>
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
          <div className="absolute right-0 mt-2 w-80 sm:w-96 card overflow-hidden shadow-xl z-[100]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
              style={{ background: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Seller Notifications
                </h3>
                {unreadCount > 0 && <span className="badge badge-green">{unreadCount}</span>}
              </div>
              <div className="flex items-center gap-1">
                {/* Connection */}
                <span className="w-2 h-2 rounded-full mr-1"
                  style={{ background: isConnected ? '#10b981' : '#ef4444' }}
                  title={isConnected ? 'Connected' : 'Disconnected'} />

                {/* Sound toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="btn btn-icon btn-ghost text-xs"
                  title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-icon btn-ghost" title="Mark all read">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
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
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All caught up! 🎉</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    New orders and updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {displayNotifications.map(n => {
                    const ts = typeStyle(n.type);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${
                          !n.read ? 'bg-[var(--accent-50)]' : ''
                        }`}
                      >
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
                                  <button
                                    onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                                    className="text-[var(--text-muted)] hover:text-[var(--accent-600)] transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); clearNotification(n.id); }}
                                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                  title="Dismiss"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              {n.message}
                            </p>

                            {/* Data tags */}
                            {n.data && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {n.data.orderId && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
                                    Order #{n.data.orderId}
                                  </span>
                                )}
                                {n.data.amount && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{ background: '#ecfdf5', color: '#059669' }}>
                                    ${n.data.amount}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              {formatTime(n.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show more/less */}
                  {notifications.length > 10 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full py-3 text-xs font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ color: 'var(--accent-600)' }}
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      {showAll ? 'Show less' : `Show ${notifications.length - 10} more`}
                    </button>
                  )}
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

export default EnhancedSellerNotificationPanel;
