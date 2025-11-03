'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { useNotifications } from '@/contexts/NotificationContext';

export default function TestNotifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, isConnected } = useNotifications();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const sendTestOrderNotification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/test-order-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderId: Math.floor(Math.random() * 1000),
          userId: user.id,
          totalAmount: 99.99,
          customerName: user.username,
          sellerId: user.role === 'SELLER' ? user.id : 2,
          sellerId2: 3,
        }),
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestAdminBroadcast = async () => {
    if (!user || user.role !== 'ADMIN') return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/test-admin-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: 'Test Admin Broadcast',
          message: 'This is a test broadcast message for all admins',
          urgent: true,
        }),
      });

      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please log in to test notifications</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Notification System Test</h1>
        
        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-300">Pusher Connection</div>
              <div className={`text-lg font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-300">User Role</div>
              <div className="text-lg font-semibold text-blue-400">{user.role}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-300">Unread Notifications</div>
              <div className="text-lg font-semibold text-yellow-400">{unreadCount}</div>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={sendTestOrderNotification}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Test Order Notification'}
            </button>
            
            {user.role === 'ADMIN' && (
              <button
                onClick={sendTestAdminBroadcast}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors ml-4"
              >
                {loading ? 'Sending...' : 'Test Admin Broadcast'}
              </button>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Result</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}

        {/* Recent Notifications */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Notifications</h2>
          {notifications.length === 0 ? (
            <div className="text-gray-400">No notifications yet</div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    notification.read
                      ? 'bg-gray-700 border-gray-500'
                      : 'bg-blue-900 border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      <p className="text-gray-300 text-sm">{notification.message}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      notification.type === 'order' ? 'bg-green-600' :
                      notification.type === 'system' ? 'bg-purple-600' :
                      'bg-blue-600'
                    } text-white`}>
                      {notification.type}
                    </div>
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
