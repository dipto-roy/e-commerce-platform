'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

// Audio feedback for new notifications
const notificationSound = new Audio('/notification.mp3'); // You'll need to add this audio file

const NotificationIndicator: React.FC<{ onToggle?: () => void }> = ({ onToggle }) => {
  const router = useRouter();
  const { notifications, unreadCount, isConnected, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Play sound and show animation for new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      try {
        notificationSound.play().catch(() => {}); // Ignore autoplay restrictions
      } catch (e) {}
      
      // Reset animation after 2 seconds
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    setShowDropdown(prev => !prev);
    if (onToggle) onToggle();
  }, [onToggle]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: any) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'order') {
      router.push(`/orders/${notification.data?.orderId}`);
    } else if (notification.type === 'payment') {
      router.push('/payments');
    } else if (notification.type === 'product') {
      router.push(`/products/${notification.data?.productId}`);
    }

    setShowDropdown(false);
  }, [markAsRead, router]);

  return (
    <div className="relative inline-flex notification-container">
      <button
        className={`relative p-2 text-gray-700 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          hasNewNotification 
            ? 'animate-shake hover:text-blue-600'
            : 'hover:text-blue-600'
        }`}
        onClick={handleToggle}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <Bell className={`h-6 w-6 ${hasNewNotification ? 'animate-bounce' : ''}`} />
        
        {/* Connection Status with Pulse Animation */}
        <span 
          className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-white ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}
          title={isConnected ? 'Connected to notification service' : 'Disconnected - trying to reconnect'}
        />
        
        {/* Unread Badge with Smooth Animation */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform transition-transform duration-200 ease-out animate-pulse"
            title={`${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div 
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[32rem] flex flex-col"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notification-menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon based on type */}
                    <span className="flex-shrink-0 mt-1">
                      {notification.read ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-500 animate-pulse" />
                      )}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base">No notifications yet</p>
                <p className="text-sm">We'll notify you when something arrives</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 text-right border-t border-gray-200 rounded-b-lg">
              <button
                onClick={() => router.push('/notifications')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIndicator;