'use client';
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPopup from './NotificationPopup';

interface PopupNotification {
  id: string;
  notification: any;
  timestamp: number;
}

interface NotificationPopupManagerProps {
  enabled?: boolean;
  maxPopups?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  playSound?: boolean;
}

const NotificationPopupManager: React.FC<NotificationPopupManagerProps> = ({
  enabled = true,
  maxPopups = 3,
  defaultDuration = 5000,
  position = 'top-right',
  playSound = true
}) => {
  const { notifications } = useNotifications();
  const [popupNotifications, setPopupNotifications] = useState<PopupNotification[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Play notification sound
  const playNotificationSound = async (type: string) => {
    if (!playSound) return;

    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate different tones for different notification types
      const frequency = type === 'order' ? 800 : 
                       type === 'payment' ? 600 : 
                       type === 'urgent' ? 1000 : 500;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback for browsers without Web Audio API
      console.log('Audio not available:', error);
    }
  };

  // Handle new notifications
  useEffect(() => {
    if (!enabled) return;

    const newNotifications = notifications.slice(0, notifications.length - lastNotificationCount);
    
    if (newNotifications.length > 0) {
      newNotifications.forEach((notification) => {
        if (!notification.read) {
          // Check if popup for this notification already exists
          const existingPopup = popupNotifications.find(p => p.notification.id === notification.id);
          if (!existingPopup) {
            const popupNotification: PopupNotification = {
              id: `popup-${notification.id}-${Date.now()}`,
              notification,
              timestamp: Date.now()
            };

            setPopupNotifications(prev => {
              // Remove oldest if at max capacity
              const updated = prev.length >= maxPopups ? prev.slice(1) : prev;
              return [...updated, popupNotification];
            });

            // Play sound
            const soundType = (notification as any).urgent ? 'urgent' : notification.type;
            playNotificationSound(soundType);
          }
        }
      });
    }

    setLastNotificationCount(notifications.length);
  }, [notifications, enabled, maxPopups, lastNotificationCount, popupNotifications, playSound]);

  const handlePopupClose = (popupId: string) => {
    setPopupNotifications(prev => prev.filter(p => p.id !== popupId));
  };

  const handlePopupAction = (notification: any) => {
    // Navigate to appropriate page
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'order':
          window.location.href = '/seller/orders';
          break;
        case 'payment':
        case 'payout':
          window.location.href = '/seller/financial';
          break;
        case 'product':
          window.location.href = '/seller/products';
          break;
        case 'verification':
          window.location.href = '/seller/profile';
          break;
        default:
          window.location.href = '/seller/dashboard';
      }
    }
  };

  if (!enabled || popupNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {popupNotifications.map((popup, index) => (
        <div
          key={popup.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 9999 - index
          }}
        >
          <NotificationPopup
            notification={popup.notification}
            onClose={() => handlePopupClose(popup.id)}
            onAction={() => handlePopupAction(popup.notification)}
            autoClose={true}
            duration={defaultDuration}
            position={position}
          />
        </div>
      ))}
    </>
  );
};

export default NotificationPopupManager;