'use client';
import React from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';

const TYPE_EMOJI: Record<string, string> = {
  order: '📦', payment: '💳', verification: '✅',
  payout: '💰', product: '🛍️', system: '⚙️', seller: '🏪',
};

function timeAgo(ts: Date): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Compact panel for embedding on the admin dashboard page. Shows last 5 unread. */
export default function AdminNotificationPanel() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications();

  const recent = notifications.filter((n) => !n.read).slice(0, 5);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/notifications')}
          className="text-xs font-semibold hover:underline"
          style={{ color: 'var(--accent-600)' }}
        >
          View All
        </button>
      </div>

      {/* List */}
      {recent.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No unread notifications
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {recent.map((n) => (
            <div
              key={n.id}
              className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors border-l-4 border-l-[var(--accent-500)]"
              style={{ background: 'var(--accent-50)' }}
              onClick={() => {
                markAsRead(n.id);
                if (n.actionUrl) router.push(n.actionUrl);
              }}
            >
              <span className="text-lg shrink-0 mt-0.5">{TYPE_EMOJI[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {n.title}
                </p>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                  {n.message}
                </p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(n.timestamp)}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                className="shrink-0 text-[var(--text-muted)] hover:text-red-500 transition-colors mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
