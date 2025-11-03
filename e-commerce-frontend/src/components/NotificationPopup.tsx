'use client';
import React, { useEffect, useState } from 'react';
import { X, Bell, Package, DollarSign, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface NotificationPopupProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    urgent?: boolean;
    timestamp: Date;
  };
  onClose: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  onClose,
  onAction,
  autoClose = true,
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto close
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <Package className="h-5 w-5" />;
      case 'payment':
      case 'payout':
        return <DollarSign className="h-5 w-5" />;
      case 'verification':
        return <CheckCircle className="h-5 w-5" />;
      case 'product':
        return <AlertTriangle className="h-5 w-5" />;
      case 'system':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    if (notification.urgent) {
      return {
        bg: 'bg-red-500',
        border: 'border-red-600',
        icon: 'text-white',
        text: 'text-white'
      };
    }

    switch (notification.type) {
      case 'order':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          icon: 'text-white',
          text: 'text-white'
        };
      case 'payment':
      case 'payout':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          icon: 'text-white',
          text: 'text-white'
        };
      case 'verification':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          icon: 'text-white',
          text: 'text-white'
        };
      case 'product':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          icon: 'text-yellow-900',
          text: 'text-yellow-900'
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-600',
          icon: 'text-white',
          text: 'text-white'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        fixed ${getPositionClasses()} z-[9999] max-w-sm w-full mx-4
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${colors.bg} ${colors.border} border-l-4 rounded-lg shadow-lg p-4
          backdrop-blur-sm bg-opacity-95
        `}
        role="alert"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${colors.icon}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm ${colors.text} truncate`}>
              {notification.title}
            </div>
            <div className={`text-sm ${colors.text} opacity-90 mt-1 line-clamp-2`}>
              {notification.message}
            </div>
            
            {/* Action button if callback provided */}
            {onAction && (
              <button
                onClick={onAction}
                className={`
                  mt-2 text-xs font-medium ${colors.text} underline hover:opacity-80
                  transition-opacity
                `}
              >
                View Details →
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 ${colors.text} hover:opacity-70 transition-opacity p-1 rounded
            `}
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-2 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white bg-opacity-50 rounded-full animate-pulse"
              style={{
                animation: `shrink ${duration}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;