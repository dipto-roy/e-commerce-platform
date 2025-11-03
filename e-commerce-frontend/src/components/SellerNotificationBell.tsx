'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Package, DollarSign, Eye, Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface SellerNotificationBellProps {
  className?: string;
}

const SellerNotificationBell: React.FC<SellerNotificationBellProps> = ({
  className = ""
}) => {
  const { notifications, unreadCount, markAsRead, clearNotification, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔔 SellerNotificationBell updated:', {
      notificationsCount: notifications.length,
      unreadCount,
      isConnected,
      soundEnabled
    });
  }, [notifications.length, unreadCount, isConnected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Navigate to relevant page based on notification
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'order':
          window.location.href = '/seller/orders';
          break;
        case 'payment':
          window.location.href = '/seller/financial';
          break;
        case 'product':
          window.location.href = '/seller/products';
          break;
        default:
          window.location.href = '/seller/dashboard';
      }
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'payment':
        return '💰';
      case 'verification':
        return '✅';
      case 'payout':
        return '💳';
      case 'product':
        return '🛍️';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationLucideIcon = (type: string) => {
    switch (type) {
      case 'order':
        return Package;
      case 'payment':
      case 'payout':
        return DollarSign;
      case 'verification':
        return CheckCircle;
      case 'product':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (notification: any) => {
    if ((notification as any).urgent) return 'border-l-red-500 bg-red-50';
    if (!notification.read) return 'border-l-blue-500 bg-blue-50';
    return 'border-l-gray-300 bg-gray-50';
  };

  const getDisplayNotifications = () => {
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Show latest 10
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-3 rounded-full transition-all duration-200 group
          ${isConnected 
            ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-100' 
            : 'text-gray-400'
          }
          ${unreadCount > 0 ? 'animate-pulse' : ''}
        `}
        title={`${unreadCount} unread notifications`}
      >
        <Bell 
          className={`h-6 w-6 transition-colors ${
            unreadCount > 0 ? 'text-blue-600' : ''
          }`} 
        />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-full ${
                    soundEnabled ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
                  }`}
                  title={`Sound ${soundEnabled ? 'on' : 'off'}`}
                >
                  <Settings className="h-4 w-4" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {getDisplayNotifications().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">New orders and updates will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {getDisplayNotifications().map((notification) => {
                  const IconComponent = getNotificationLucideIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`
                        p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4
                        ${getNotificationColor(notification)}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`
                          p-2 rounded-full flex-shrink-0
                          ${(notification as any).urgent ? 'bg-red-100 text-red-600' : 
                            notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'}
                        `}>
                          <IconComponent className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium text-gray-900 ${
                                !notification.read ? 'font-bold' : ''
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 ml-2">
                              {(notification as any).urgent && (
                                <span className="inline-block h-2 w-2 bg-red-500 rounded-full"></span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 rounded"
                                title="Dismiss"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimeAgo(notification.timestamp)}
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
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    notifications.forEach(n => markAsRead(n.id));
                    setIsOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/seller/notifications';
                  }}
                  className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerNotificationBell;