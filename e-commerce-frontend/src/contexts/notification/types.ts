export type NotificationType =
  | 'order'
  | 'payment'
  | 'seller'
  | 'product'
  | 'system'
  | 'verification'
  | 'payout';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
  userId?: number;
  actionUrl?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
  refresh: () => Promise<void>;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: number;
  userRole?: string;
}
