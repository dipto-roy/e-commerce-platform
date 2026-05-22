'use client';
import React, { useState, useMemo } from 'react';
import {
  Bell, CheckCheck, Trash2, Send, RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification, NotificationType } from '@/contexts/NotificationContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<string, string> = {
  order: '📦', payment: '💳', verification: '✅',
  payout: '💰', product: '🛍️', system: '⚙️', seller: '🏪',
};

const TYPE_LABELS: Record<string, string> = {
  order: 'Order', payment: 'Payment', verification: 'Verification',
  payout: 'Payout', product: 'Product', system: 'System', seller: 'Seller',
};

const TABS = ['all', 'unread', 'order', 'payment', 'system'] as const;
type Tab = typeof TABS[number];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002/api/v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: Date): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// ─── Broadcast Modal ──────────────────────────────────────────────────────────

function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [urgent, setUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await fetch(`${API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, title: title.trim(), message: message.trim(), urgent }),
      });
      setSent(true);
      setTimeout(onClose, 1500);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          📢 Broadcast to All Users
        </h2>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCheck className="w-10 h-10 mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-green-600">Broadcast sent!</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Type
              </label>
              <select className="input w-full" value={type} onChange={(e) => setType(e.target.value as NotificationType)}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
              <input className="input w-full" placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
              <textarea className="input w-full h-24 resize-none" placeholder="Write your message…" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="rounded" />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mark as urgent</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button
                onClick={send}
                disabled={sending || !title.trim() || !message.trim()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending…' : 'Send Broadcast'}
              </button>
              <button onClick={onClose} className="btn btn-ghost">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotifRow({
  notification: n,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-secondary)] ${
        !n.read ? 'border-l-4 border-l-[var(--accent-500)]' : 'border-l-4 border-l-transparent'
      }`}
      style={!n.read ? { background: 'var(--accent-50)' } : {}}
    >
      <span className="text-xl mt-0.5 shrink-0">{TYPE_EMOJI[n.type] ?? '🔔'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: 'var(--accent-50)', color: 'var(--accent-700)', border: '1px solid var(--accent-200)' }}
          >
            {TYPE_LABELS[n.type] ?? n.type}
          </span>
          {!!n.data?.urgent && <span className="badge badge-red text-[10px]">Urgent</span>}
          {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-500)' }} />}
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
        <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!n.read && (
          <button onClick={() => onRead(n.id)} className="btn btn-icon btn-ghost" title="Mark as read">
            <CheckCheck className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
          </button>
        )}
        <button onClick={() => onDelete(n.id)} className="btn btn-icon btn-ghost hover:text-red-500" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const {
    notifications, unreadCount, isConnected,
    markAsRead, markAllAsRead, clearNotification, clearAllNotifications, refresh,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let list = notifications;
    if (activeTab === 'unread') list = list.filter((n) => !n.read);
    else if (activeTab !== 'all') list = list.filter((n) => n.type === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
      );
    }
    return list;
  }, [notifications, activeTab, search]);

  const tabCount = (tab: Tab) => {
    if (tab === 'all') return notifications.length;
    if (tab === 'unread') return unreadCount;
    return notifications.filter((n) => n.type === tab).length;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage and broadcast notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: isConnected ? '#dcfce7' : '#fee2e2', color: isConnected ? '#15803d' : '#b91c1c' }}
          >
            {isConnected ? <><Wifi className="w-3.5 h-3.5" /> Live</> : <><WifiOff className="w-3.5 h-3.5" /> Offline</>}
          </span>
          <button onClick={handleRefresh} className="btn btn-ghost btn-sm flex items-center gap-1.5">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowBroadcast(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Send className="w-4 h-4" />
            Broadcast
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, color: 'var(--accent-600)' },
          { label: 'Unread', value: unreadCount, color: '#ef4444' },
          { label: 'Orders', value: notifications.filter((n) => n.type === 'order').length, color: '#f59e0b' },
          { label: 'System', value: notifications.filter((n) => n.type === 'system').length, color: '#6366f1' },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div
          className="px-5 py-3 border-b border-[var(--border)] flex flex-wrap items-center gap-3"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div className="flex gap-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeTab === tab ? 'text-white' : 'hover:bg-[var(--bg-primary)]'
                }`}
                style={activeTab === tab ? { background: 'var(--accent-600)' } : { color: 'var(--text-secondary)' }}
              >
                {tab === 'all' ? 'All' : TYPE_LABELS[tab] ?? tab}
                {tabCount(tab) > 0 && <span className="ml-1 opacity-75">({tabCount(tab)})</span>}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <input
            className="input text-xs py-1.5 px-3 w-44"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="btn btn-ghost btn-sm flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No notifications</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {search ? 'No matches for your search.' : 'All caught up!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((n) => (
              <NotifRow key={n.id} notification={n} onRead={markAsRead} onDelete={clearNotification} />
            ))}
          </div>
        )}
      </div>

      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}
    </div>
  );
}
