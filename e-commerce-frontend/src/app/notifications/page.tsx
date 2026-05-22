'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, Trash2, Clock, ChevronLeft, AlertCircle, RefreshCw,
} from 'lucide-react';

interface Notification {
  id: number; userId: number; type: string; title: string; message: string;
  read: boolean; urgent: boolean; actionUrl: string | null; data: any;
  createdAt: string; readAt: string | null;
}

interface PageData {
  notifications: Notification[]; total: number;
  page: number; limit: number; totalPages: number;
}

const TYPE_EMOJI: Record<string, string> = {
  order: '📦', payment: '💳', verification: '✅', seller: '🏪',
  payout: '💰', product: '🛍️', system: '⚙️',
};

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData]           = useState<PageData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all' | 'unread' | 'read'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError]         = useState<string | null>(null);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/notifications/my`, {
        credentials: 'include', headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      setData(await res.json());
      setError(null);
    } catch { setError('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(currentPage); }, [currentPage]);

  const markAsRead = async (id: number) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
    setData(prev => prev ? {
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ),
    } : prev);
  };

  const markAllAsRead = async () => {
    await fetch(`${API_URL}/notifications/my/read-all`, { method: 'POST', credentials: 'include' });
    fetchNotifications(currentPage);
  };

  const deleteOne = async (id: number) => {
    await fetch(`${API_URL}/notifications/${id}/delete`, { method: 'POST', credentials: 'include' });
    setData(prev => prev ? {
      ...prev, total: prev.total - 1,
      notifications: prev.notifications.filter(n => n.id !== id),
    } : prev);
  };

  const deleteRead = async () => {
    await fetch(`${API_URL}/notifications/my/delete-read`, { method: 'POST', credentials: 'include' });
    fetchNotifications(currentPage);
  };

  const onClickNotification = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const unreadCount = data?.notifications.filter(n => !n.read).length ?? 0;
  const filtered = (data?.notifications ?? []).filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read')   return n.read;
    return true;
  });

  if (loading && !data) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
          <p className="text-sm mb-4 text-red-600">{error}</p>
          <button onClick={() => fetchNotifications(currentPage)} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="btn btn-icon btn-ghost">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
                <div>
                  <h1 className="section-title">Notifications</h1>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {data?.total ?? 0} total{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fetchNotifications(currentPage)} disabled={loading} className="btn btn-outline btn-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                </button>
              )}
              <button onClick={deleteRead} className="btn btn-sm"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Read
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0 mt-4 border-b border-[var(--border)]">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'border-b-2 border-[var(--accent-500)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                style={{ color: filter === f ? 'var(--accent-600)' : 'var(--text-secondary)' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 badge badge-red" style={{ fontSize: '0.65rem' }}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No {filter !== 'all' ? filter + ' ' : ''}notifications
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'unread' ? "You're all caught up!" : 'No notifications to display.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => (
              <div
                key={n.id}
                onClick={() => onClickNotification(n)}
                className={`card p-5 cursor-pointer transition-all hover:shadow-md ${
                  !n.read ? 'border-l-4' : ''
                } ${n.urgent ? 'border-l-red-500' : !n.read ? 'border-l-[var(--accent-500)]' : ''}`}
                style={!n.read && !n.urgent ? { borderLeftColor: 'var(--accent-500)' } : {}}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">{TYPE_EMOJI[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {n.title}
                        </h3>
                        {!n.read && <span className="badge badge-green">New</span>}
                        {n.urgent && <span className="badge badge-red">Urgent</span>}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock className="w-3 h-3" /> {timeAgo(n.createdAt)}
                        </span>
                        <span className="badge badge-gray text-xs">{n.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} className="btn btn-icon btn-ghost"
                        title="Mark as read">
                        <CheckCheck className="w-4 h-4" style={{ color: 'var(--accent-600)' }} />
                      </button>
                    )}
                    <button onClick={() => deleteOne(n.id)} className="btn btn-icon btn-ghost text-red-500"
                      title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="btn btn-outline btn-sm">← Previous</button>
            <span className="text-sm px-3" style={{ color: 'var(--text-secondary)' }}>
              {currentPage} / {data.totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))} disabled={currentPage === data.totalPages}
              className="btn btn-outline btn-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
