'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Wifi, WifiOff, Send } from 'lucide-react';

const TYPE_BADGE: Record<string, string> = {
  order: 'badge badge-green', system: 'badge badge-blue', default: 'badge badge-gray',
};

export default function TestNotifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, isConnected } = useNotifications();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const sendTestOrderNotification = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/test-order-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          orderId: Math.floor(Math.random() * 1000), userId: user.id, totalAmount: 99.99,
          customerName: user.username, sellerId: user.role === 'SELLER' ? user.id : 2, sellerId2: 3,
        }),
      });
      setTestResult(JSON.stringify(await res.json(), null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally { setLoading(false); }
  };

  const sendTestAdminBroadcast = async () => {
    if (!user || user.role !== 'ADMIN') return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/test-admin-broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ title: 'Test Admin Broadcast', message: 'This is a test broadcast message for all admins', urgent: true }),
      });
      setTestResult(JSON.stringify(await res.json(), null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Login Required</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please log in to test notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <h1 className="section-title">Notification System Test</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Dev tool for testing real-time notifications
          </p>
        </div>
      </div>

      <div className="container-app py-8 space-y-6">
        {/* Connection status */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Connection Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Pusher Connection',
                value: isConnected ? 'Connected' : 'Disconnected',
                color: isConnected ? 'var(--accent-600)' : '#ef4444',
                icon: isConnected ? Wifi : WifiOff,
              },
              { label: 'User Role',             value: user.role,  color: '#3b82f6',    icon: Bell },
              { label: 'Unread Notifications',  value: unreadCount, color: '#f59e0b',   icon: Bell },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test actions */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Test Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={sendTestOrderNotification} disabled={loading} className="btn btn-primary">
              {loading ? <><span className="spinner" /> Sending…</> : <><Send className="w-4 h-4" /> Test Order Notification</>}
            </button>
            {user.role === 'ADMIN' && (
              <button onClick={sendTestAdminBroadcast} disabled={loading} className="btn btn-outline">
                {loading ? <><span className="spinner" /> Sending…</> : <><Send className="w-4 h-4" /> Test Admin Broadcast</>}
              </button>
            )}
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div className="card p-6">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Test Result</h2>
            <pre className="rounded-xl p-4 text-sm overflow-auto"
              style={{ background: 'var(--bg-secondary)', color: 'var(--accent-600)', fontFamily: 'monospace' }}>
              {testResult}
            </pre>
          </div>
        )}

        {/* Recent notifications */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Recent Notifications
          </h2>
          {notifications.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id}
                  className={`p-4 rounded-xl border-l-4 ${n.read ? '' : 'bg-[var(--accent-50)]'}`}
                  style={{
                    background: n.read ? 'var(--bg-secondary)' : undefined,
                    borderLeftColor: n.read ? 'var(--border)' : 'var(--accent-500)',
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {n.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={TYPE_BADGE[n.type] || TYPE_BADGE.default}>
                      {n.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
