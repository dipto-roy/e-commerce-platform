'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Package, DollarSign, ShoppingCart, Eye, Trash2, Star } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import Pusher from 'pusher-js';
interface NotificationPanelProps {
  className?: string;
}

const EnhancedSellerNotificationPanel: React.FC<NotificationPanelProps> = ({ className = '' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications, isConnected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging for notification panel
  useEffect(() => {
    console.log('🔔 SellerNotificationPanel - Notifications updated:', {
      total: notifications.length,
      unread: unreadCount,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: n.read,
        timestamp: n.timestamp
      }))
    });
  }, [notifications, unreadCount]);
  const [showAll, setShowAll] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
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

  // Play notification sound
  useEffect(() => {
    if (unreadCount > 0 && soundEnabled) {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [unreadCount, soundEnabled]);

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
      case 'seller':
      case 'verification':
        return <Star className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  

  return (
    <div>
      <h1>Seller Dashboard</h1>
      <h2>Notifications:</h2>
      <ul>
        {notifications.map((n, i) => (
          <li key={i}>{n.message}</li>
        ))}
      </ul>
    </div>
  );

  function getNotificationBgColor(type: string, read: boolean) {
        const baseOpacity = read ? 'bg-opacity-30' : 'bg-opacity-50';
        switch (type) {
            case 'order':
                return `bg-blue-900 ${baseOpacity} border-l-blue-500`;
            case 'payment':
                return `bg-green-900 ${baseOpacity} border-l-green-500`;
            case 'product':
                return `bg-purple-900 ${baseOpacity} border-l-purple-500`;
            case 'system':
                return `bg-gray-800 ${baseOpacity} border-l-gray-500`;
            case 'seller':
            case 'verification':
                return `bg-yellow-900 ${baseOpacity} border-l-yellow-500`;
            default:
                return `bg-yellow-900 ${baseOpacity} border-l-yellow-500`;
        }
    }

  const getNotificationPriority = (type: string) => {
    switch (type) {
      case 'order':
        return '🔥 High Priority';
      case 'payment':
        return '💰 Payment Alert';
      case 'product':
        return '📦 Inventory Alert';
      case 'verification':
        return '⭐ Account Update';
      default:
        return '📢 General';
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
    // Don't auto-mark as read - seller must explicitly mark as read
    // This ensures notifications stay visible until seller acknowledges them
    
    // Auto-navigate or perform action based on notification type
    if (notification.type === 'order' && notification.data?.orderId) {
      // Navigate to specific order
      window.location.href = `/seller/orders?highlight=${notification.data.orderId}`;
    } else if (notification.type === 'payment' && notification.data?.paymentId) {
      // Navigate to financials
      window.location.href = `/seller/financials`;
    } else if (notification.type === 'product' && notification.data?.productId) {
      // Navigate to product management
      window.location.href = `/seller/products?highlight=${notification.data.productId}`;
    }
  };

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(notificationId);
  };

  const displayNotifications = showAll ? notifications : notifications.slice(0, 10);

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Bell Icon Button with Enhanced Animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-700 rounded-full group focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`${unreadCount} new notifications`}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className={`w-6 h-6 transition-transform ${unreadCount > 0 ? 'animate-pulse scale-110' : 'group-hover:scale-105'}`} />
        
        {/* Enhanced Unread Count Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse shadow-lg ring-2 ring-red-400 ring-opacity-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            
            {/* Pulse Animation Ring */}
            <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-6 w-6 animate-ping opacity-30"></span>
            
            {/* Secondary Ring */}
            <span className="absolute -top-2 -right-2 bg-red-300 rounded-full h-8 w-8 animate-ping opacity-20 animation-delay-75"></span>
          </>
        )}
      </button>

      {/* Enhanced Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden backdrop-blur-lg">
          {/* Enhanced Header */}
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-750">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Seller Notifications
                </h3>
                <p className="text-gray-400 text-sm">
                  {unreadCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                      {unreadCount} unread messages
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      All caught up!
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1 rounded transition-colors ${soundEnabled ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-400'}`}
                  title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
                
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Read All
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
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

          {/* Enhanced Notifications List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Bell className="w-16 h-16 text-gray-600" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-400 font-medium mb-2">All caught up! 🎉</h4>
                    <p className="text-gray-500 text-sm">New orders and updates will appear here instantly.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-all duration-200 ${
                      !notification.read ? `border-l-4 ${getNotificationBgColor(notification.type, notification.read).split(' ')[1]}` : ''
                    } ${getNotificationBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Enhanced Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-2 rounded-full ${!notification.read ? 'bg-gray-700' : 'bg-gray-800'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Enhanced Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                                  NEW
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            
                            {/* Mark as Read Button - Only show for unread notifications */}
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-gray-600 ml-1"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Close/Dismiss Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-600"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Priority Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {getNotificationPriority(notification.type)}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-gray-200'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Enhanced Data Display */}
                        {notification.data && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {notification.data.orderId && (
                              <span className="bg-blue-700 text-blue-100 px-2 py-1 rounded-md flex items-center gap-1">
                                <ShoppingCart className="w-3 h-3" />
                                Order #{notification.data.orderId}
                              </span>
                            )}
                            {notification.data.amount && (
                              <span className="bg-green-700 text-green-100 px-2 py-1 rounded-md flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${notification.data.amount}
                              </span>
                            )}
                            {notification.data.productName && (
                              <span className="bg-purple-700 text-purple-100 px-2 py-1 rounded-md flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {notification.data.productName}
                              </span>
                            )}
                            {notification.data.customerName && (
                              <span className="bg-gray-700 text-gray-100 px-2 py-1 rounded-md">
                                👤 {notification.data.customerName}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {notification.type === 'order' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View Order Details
                            </button>
                          )}
                          
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show More/Less Controls */}
                {notifications.length > 10 && (
                  <div className="border-t border-gray-700 bg-gray-750">
                    {!showAll ? (
                      <button
                        onClick={() => setShowAll(true)}
                        className="w-full p-3 text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Show {notifications.length - 10} more notifications
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAll(false)}
                        className="w-full p-3 text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Show less
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .animation-delay-75 {
          animation-delay: 75ms;
        }
      `}</style>
    </div>
  );
};

export default EnhancedSellerNotificationPanel;