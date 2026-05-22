'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContextNew';
import {
  Bell, CheckCircle, AlertTriangle, XCircle, Info,
  RefreshCw, Plus, Trash2, Eye, X,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Notification {
  id: number; title: string; message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean; createdAt: string; userId?: number;
  user?: { username: string; email: string };
}

const TYPE_MAP: Record<string, { badgeClass: string; icon: React.ReactNode }> = {
  success: { badgeClass: 'badge badge-green',  icon: <CheckCircle  className="w-4 h-4" style={{ color: '#10b981' }} /> },
  warning: { badgeClass: 'badge badge-yellow', icon: <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} /> },
  error:   { badgeClass: 'badge badge-red',    icon: <XCircle      className="w-4 h-4" style={{ color: '#ef4444' }} /> },
  info:    { badgeClass: 'badge badge-blue',   icon: <Info         className="w-4 h-4" style={{ color: '#3b82f6' }} /> },
};

function NotificationsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();

  const [newNotification, setNewNotification] = useState({
    title: '', message: '', type: 'info' as Notification['type'],
    targetType: 'all' as 'all' | 'users' | 'sellers' | 'specific',
    targetEmails: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'ADMIN') {
        addToast('Access denied. Admin role required.', 'error');
        router.push(user.role === 'SELLER' ? '/seller/dashboard' : '/');
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => { fetchNotifications(); }, [currentPage, filterType]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') return null;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getNotifications(currentPage, 10);
      const d = res.data as any;
      setNotifications(d.notifications || d || []);
      setTotalPages(Math.ceil((d.total || 0) / 10) || 1);
    } catch { addToast('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: number) => {
    try {
      await adminAPI.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      addToast('Marked as read', 'success');
    } catch { addToast('Failed to mark as read', 'error'); }
  };

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch { addToast('Failed to mark all as read', 'error'); }
  };

  const deleteNotification = async (id: number) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await adminAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      addToast('Notification deleted', 'success');
    } catch { addToast('Failed to delete notification', 'error'); }
  };

  const createNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      addToast('Please fill in title and message', 'error'); return;
    }
    try {
      const data = {
        title: newNotification.title, message: newNotification.message, type: newNotification.type,
        ...(newNotification.targetType === 'specific'
          ? { recipients: newNotification.targetEmails.split(',').map(e => e.trim()) }
          : { targetType: newNotification.targetType }),
      };
      await adminAPI.createNotification(data);
      addToast('Notification created', 'success');
      setNewNotification({ title: '', message: '', type: 'info', targetType: 'all', targetEmails: '' });
      setShowCreateModal(false);
      fetchNotifications();
    } catch { addToast('Failed to create notification', 'error'); }
  };

  const openModal = (n: Notification) => {
    setSelectedNotification(n);
    setShowModal(true);
    if (!n.isRead) markAsRead(n.id);
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'read')   return n.isRead;
    if (filterType === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount   = notifications.filter(n => n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="section-title">Notifications</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
          <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Mark All Read
          </button>
          <button onClick={fetchNotifications} disabled={loading} className="btn btn-outline btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: notifications.length, icon: Bell,         color: '#3b82f6' },
          { label: 'Unread', value: unreadCount,          icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Read',   value: readCount,             icon: CheckCircle,   color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`btn btn-sm ${filterType === f ? 'btn-primary' : 'btn-outline'}`}>
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notifications ({filtered.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4 items-start">
                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map(n => {
              const tm = TYPE_MAP[n.type] || TYPE_MAP.info;
              return (
                <div key={n.id}
                  className={`px-5 py-4 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${
                    !n.isRead ? 'bg-[var(--accent-50)]' : ''
                  }`}
                  onClick={() => openModal(n)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">{tm.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {n.title}
                          </span>
                          <span className={tm.badgeClass}>
                            {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                          </span>
                          {!n.isRead && <span className="badge badge-red">New</span>}
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleString()}
                          {n.user && ` · ${n.user.username}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)}
                          className="text-xs transition-colors" style={{ color: 'var(--accent-600)' }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--border)]">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="btn btn-outline btn-sm">← Previous</button>
            <span className="text-sm px-3" style={{ color: 'var(--text-secondary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm">Next →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedNotification && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Details</h3>
                <button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {TYPE_MAP[selectedNotification.type]?.icon}
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedNotification.title}
                  </h4>
                  <span className={TYPE_MAP[selectedNotification.type]?.badgeClass}>
                    {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                  </span>
                </div>
                <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {selectedNotification.message}
                </div>
                <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <p><strong style={{ color: 'var(--text-secondary)' }}>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}</p>
                  <p><strong style={{ color: 'var(--text-secondary)' }}>Status:</strong> {selectedNotification.isRead ? 'Read' : 'Unread'}</p>
                  {selectedNotification.user && (
                    <p><strong style={{ color: 'var(--text-secondary)' }}>User:</strong> {selectedNotification.user.username} ({selectedNotification.user.email})</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Close</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Create Notification</h3>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-icon btn-ghost">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="input-group">
                  <label className="label">Title</label>
                  <input type="text" className="input" placeholder="Notification title"
                    value={newNotification.title}
                    onChange={e => setNewNotification(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="label">Message</label>
                  <textarea rows={4} className="input resize-none" placeholder="Notification message"
                    value={newNotification.message}
                    onChange={e => setNewNotification(p => ({ ...p, message: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="label">Type</label>
                    <select className="input"
                      value={newNotification.type}
                      onChange={e => setNewNotification(p => ({ ...p, type: e.target.value as any }))}>
                      {['info','success','warning','error'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="label">Target</label>
                    <select className="input"
                      value={newNotification.targetType}
                      onChange={e => setNewNotification(p => ({ ...p, targetType: e.target.value as any }))}>
                      <option value="all">All Users</option>
                      <option value="users">Regular Users</option>
                      <option value="sellers">Sellers Only</option>
                      <option value="specific">Specific Users</option>
                    </select>
                  </div>
                </div>
                {newNotification.targetType === 'specific' && (
                  <div className="input-group">
                    <label className="label">Email Addresses (comma-separated)</label>
                    <input type="text" className="input" placeholder="user1@email.com, user2@email.com"
                      value={newNotification.targetEmails}
                      onChange={e => setNewNotification(p => ({ ...p, targetEmails: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button onClick={createNotification} className="btn btn-primary btn-sm">
                  <Bell className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
