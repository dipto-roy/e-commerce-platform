'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Package, DollarSign, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationPanelProps {
  className?: string;
}

const SellerNotificationPanel: React.FC<NotificationPanelProps> = ({ className = '' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-close panel when no notifications
  useEffect(() => {
    if (notifications.length === 0 && isOpen) {
      setIsOpen(false);
    }
  }, [notifications.length, isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-blue-400" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'product':
        return <Package className="w-5 h-5 text-purple-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    const baseOpacity = read ? 'bg-opacity-30' : 'bg-opacity-50';
    switch (type) {
      case 'order':
        return `bg-blue-900 ${baseOpacity}`;
      case 'payment':
        return `bg-green-900 ${baseOpacity}`;
      case 'product':
        return `bg-purple-900 ${baseOpacity}`;
      case 'system':
        return `bg-gray-800 ${baseOpacity}`;
      default:
        return `bg-yellow-900 ${baseOpacity}`;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Auto-navigate or perform action based on notification type
    if (notification.type === 'order' && notification.data?.orderId) {
      // Could navigate to specific order
      console.log(`Navigate to order ${notification.data.orderId}`);
    }
  };

  const displayNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-700 rounded-full group"
        title="Notifications"
      >
        <Bell className="w-6 h-6 group-hover:animate-pulse" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-5 w-5 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-750">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold text-lg">Notifications</h3>
                <p className="text-gray-400 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark All Read
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h4 className="text-gray-400 font-medium mb-2">No notifications</h4>
                <p className="text-gray-500 text-sm">You're all caught up! New notifications will appear here.</p>
              </div>
            ) : (
              <>
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-all duration-200 ${
                      !notification.read ? 'border-l-4 border-l-blue-500' : ''
                    } ${getNotificationBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Additional Data */}
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.data.orderId && (
                              <span className="bg-gray-700 px-2 py-1 rounded mr-2">
                                Order #{notification.data.orderId}
                              </span>
                            )}
                            {notification.data.amount && (
                              <span className="bg-green-700 px-2 py-1 rounded mr-2">
                                ${notification.data.amount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show More Button */}
                {notifications.length > 10 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full p-3 text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    Show {notifications.length - 10} more notifications
                  </button>
                )}
                
                {showAll && notifications.length > 10 && (
                  <button
                    onClick={() => setShowAll(false)}
                    className="w-full p-3 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                  >
                    Show less
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerNotificationPanel;