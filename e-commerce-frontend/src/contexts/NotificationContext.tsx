'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { useNotificationState } from './notification/useNotificationState';
import { useSseNotifications } from './notification/useSseNotifications';
import type {
  NotificationContextType,
  NotificationProviderProps,
} from './notification/types';

// Re-export types so existing imports keep working
export type { Notification, NotificationType } from './notification/types';

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  return ctx;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
}) => {
  const state = useNotificationState(userId);
  const { isConnected } = useSseNotifications(userId, state.addNotification);

  // Load persisted notifications on mount / user change
  useEffect(() => {
    state.fetchHistoricalNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    clearNotification: state.clearNotification,
    clearAllNotifications: state.clearAllNotifications,
    isConnected,
    refresh: state.fetchHistoricalNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
