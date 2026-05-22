'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';

const TYPE_EMOJI: Record<string, string> = {
  order: '📦', payment: '💳', verification: '✅',
  payout: '💰', product: '🛍️', system: '⚙️', seller: '🏪',
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002/api/v1';

function timeAgo(ts: Date): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface AdminNotificationBellProps {
  className?: string;
}

export default function AdminNotificationBell({ className = '' }: AdminNotificationBellProps) {
  const router = useRouter();
  const {
    notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, isConnected, refresh,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleNotificationClick = (notification: { id: string; actionUrl?: string }) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (notification.actionUrl) router.push(notification.actionUrl);
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    try {
      await fetch(`${API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'system',
          title: 'Admin Announcement',
          message: broadcastMsg.trim(),
          urgent: false,
        }),
      });
      setBroadcastMsg('');
      setShowBroadcast(false);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
        title={`${unreadCount} unread notifications`}
      >
        <Bell
          className="w-5 h-5"
          style={{ color: unreadCount > 0 ? 'var(--accent-600)' : 'var(--text-secondary)' }}
        />

        {/* SSE connection dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{ background: isConnected ? '#10b981' : '#ef4444' }}
          title={isConnected ? 'Real-time connected' : 'Disconnected'}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 card overflow-hidden shadow-xl z-50" style={{ width: '22rem' }}>
          {/* Header */}
          <div
            className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--accent-600)' }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => refresh()}
                className="btn btn-icon btn-ghost"
                title="Refresh"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
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
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  No notifications
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${
                      !n.read ? 'border-l-4 border-l-[var(--accent-500)]' : ''
                    }`}
                    style={!n.read ? { background: 'var(--accent-50)' } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{TYPE_EMOJI[n.type] ?? '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {n.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                            className="shrink-0 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(n.timestamp)}
                          </span>
                          {!!n.data?.urgent && (
                            <span className="badge badge-red text-[10px]">Urgent</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — admin actions */}
          <div
            className="border-t border-[var(--border)]"
            style={{ background: 'var(--bg-secondary)' }}
          >
            {showBroadcast ? (
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Broadcast to all users
                </p>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-xs py-1.5 px-2"
                    placeholder="Type announcement…"
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                    autoFocus
                  />
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcasting || !broadcastMsg.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {broadcasting ? '…' : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => setShowBroadcast(false)}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="px-4 py-2.5 flex items-center justify-between">
                <button
                  onClick={() => { setIsOpen(false); router.push('/dashboard/admin/notifications'); }}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'var(--accent-600)' }}
                >
                  View All
                </button>
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Send className="w-3 h-3" />
                  Broadcast
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
