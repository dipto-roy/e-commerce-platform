'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js';

// Define notification types
type NotificationType = 'order' | 'payment' | 'seller' | 'product' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  userId?: number;
  role?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
}

// Create context with undefined default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: number;
  userRole?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
  userRole,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Generic notification handler
  const handleNotification = useCallback((type: string, data: any) => {
    console.log(`🔔 Processing notification:`, { type, data, userId, userRole });
    
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type: (data.type || type) as NotificationType,
      title: data.title || 'Notification',
      message: data.message || 'You have a new notification',
      data: data.data || {},
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      userId: data.userId || userId,
      role: data.role || userRole,
    };

    console.log(`✅ Created notification:`, notification);
    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (error) {
        console.warn('⚠️ Failed to show browser notification:', error);
      }
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (!userId) return;

    // Initialize Pusher with provided credentials and cluster config
    const pusherConfig = {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || "15b1c61ffa0f4d470c2b",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1'
    };

    console.log(`🔧 Initializing Pusher connection...`, {
      key: `${pusherConfig.key.substring(0, 10)}...`,
      cluster: pusherConfig.cluster,
      userId,
      userRole,
      environment: process.env.NODE_ENV
    });

    // Enable detailed logging in development
    Pusher.logToConsole = process.env.NODE_ENV === 'development';
    
    // Create Pusher instance with proper configuration
    const pusherInstance = new Pusher(pusherConfig.key, {
      cluster: pusherConfig.cluster,
      enabledTransports: ['ws', 'wss'],
      forceTLS: true,
      wsHost: `ws-${pusherConfig.cluster}.pusher.com`,
      wsPort: 443,
      wssPort: 443,
      authEndpoint: `${pusherConfig.apiUrl}/pusher/auth`,
      auth: {
        headers: {
          'Content-Type': 'application/json',
        }
      },
      activityTimeout: 30000,
      pongTimeout: 15000
    });

    setPusher(pusherInstance);

    // Monitor all connection state changes
    pusherInstance.connection.bind('state_change', (states: { current: string; previous: string }) => {
      const stateInfo = {
        from: states.previous,
        to: states.current,
        userId,
        userRole,
        socketId: pusherInstance.connection.socket_id || 'none',
        channels: Object.keys(pusherInstance.channels.channels || {}),
        timestamp: new Date().toISOString()
      };
      console.log('📡 Pusher connection state changed:', stateInfo);

      // Implement state-specific logic
      if (states.current === 'connecting') {
        console.log('🔄 Attempting to establish connection...', stateInfo);
      } else if (states.current === 'connected') {
        console.log('✅ Connection established successfully', stateInfo);
      } else if (states.current === 'unavailable') {
        console.warn('⚠️ Connection unavailable - will retry', stateInfo);
      }
    });

    // Handle successful connection
    pusherInstance.connection.bind('connected', () => {
      const connectionInfo = {
        userId,
        userRole,
        socketId: pusherInstance.connection.socket_id,
        channels: Object.keys(pusherInstance.channels.channels || {}),
        timestamp: new Date().toISOString()
      };
      console.log('✅ Successfully connected to Pusher', connectionInfo);
      setIsConnected(true);
    });

    // Handle disconnection with retry logic
    pusherInstance.connection.bind('disconnected', () => {
      const disconnectInfo = {
        userId,
        userRole,
        lastSocketId: pusherInstance.connection.socket_id,
        timestamp: new Date().toISOString()
      };
      console.log('⚠️ Disconnected from Pusher', disconnectInfo);
      
      // Implement exponential backoff for reconnection
        const reconnectWithBackoff = (attempt: number = 1, maxAttempts: number = 5) => {
            // Stop if max attempts reached or component unmounted
            if (attempt > maxAttempts) {
              console.error('❌ Max reconnection attempts reached', { 
                attempt, 
                maxAttempts,
                cluster: pusherInstance.config.cluster,
                lastState: pusherInstance.connection.state,
                timestamp: new Date().toISOString()
              });
              return;
            }
  
            // Calculate backoff with jitter to prevent thundering herd
            const baseDelay = 1000; // Start with 1s
            const maxDelay = 16000; // Cap at 16s
            const jitter = Math.random() * 1000; // Add up to 1s random jitter
            const backoffTime = Math.min(baseDelay * Math.pow(2, attempt - 1) + jitter, maxDelay);
  
            console.log(`🔄 Scheduling reconnection attempt ${attempt}/${maxAttempts}...`, {
              backoffMs: Math.round(backoffTime),
              attempt,
              cluster: pusherInstance.config.cluster,
              nextAttempt: new Date(Date.now() + backoffTime).toISOString()
            });
            
            // Set a timeout for the connection attempt
            const connectionTimeout = setTimeout(() => {
              if (pusherInstance.connection.state === 'connecting') {
                console.warn('⚠️ Connection attempt timed out', {
                  attempt,
                  state: pusherInstance.connection.state
                });
                pusherInstance.disconnect();
              }
            }, 5000); // 5s timeout
  
            setTimeout(() => {
              // Clear the connection timeout
              clearTimeout(connectionTimeout);
  
              if (pusherInstance.connection.state !== 'connected') {
                const attemptInfo = {
                  attempt,
                  maxAttempts,
                  cluster: pusherInstance.config.cluster,
                  timestamp: new Date().toISOString()
                };
  
                console.log(`🔄 Executing reconnection attempt ${attempt}/${maxAttempts}...`, attemptInfo);
                
                try {
                  pusherInstance.connect();
                  reconnectWithBackoff(attempt + 1, maxAttempts);
                } catch (error) {
                  console.error('❌ Error during reconnection:', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    ...attemptInfo
                  });
                  reconnectWithBackoff(attempt + 1, maxAttempts);
                }
              }
            }, backoffTime);
        };
  
        reconnectWithBackoff();
      setIsConnected(false);
    }),

    // Enhanced error handling
    pusherInstance.connection.bind('error', (error: any) => {
      const connectionInfo = {
        state: pusherInstance.connection.state,
        socketId: pusherInstance.connection.socket_id || 'none',
        channels: Object.keys(pusherInstance.channels.channels || {}),
        userId,
        userRole,
        timestamp: new Date().toISOString()
      };

      // Enhanced error detection and logging
      const getPusherState = () => {
        try {
          const connection = pusherInstance.connection;
          const channels = pusherInstance.channels?.channels || {};
          
          return {
            socketId: connection.socket_id || null,
            state: connection.state,
            wsUrl: (connection as any).options?.wsUrl || null,
            activity: connection.state === 'connected',
            retrying: connection.state === 'connecting',
            channels: Object.keys(channels),
            lastEvent: connection.state === 'connected' ? 'connected' : 
                      connection.state === 'connecting' ? 'connecting' : 
                      connection.state === 'disconnected' ? 'disconnected' : 'unknown'
          };
        } catch (e) {
          return {
            socketId: null,
            state: 'unknown',
            wsUrl: null,
            activity: false,
            retrying: false,
            channels: [],
            lastEvent: 'error'
          };
        }
      };

      const errorInfo = {
        ...connectionInfo,
        errorType: error ? typeof error : 'undefined',
        hasError: Boolean(error),
        isEmpty: !error || (typeof error === 'object' && (!error || Object.keys(error).length === 0)),
        connectionAttempts: 0, // Will be incremented in retry logic
        pusherState: getPusherState(),
        timestamp: new Date().toISOString()
      };

      // Enhanced error analysis and logging
      const analyzeError = () => {
        const state = pusherInstance.connection.state;
        const isConnecting = state === 'connecting';
        const wasConnected = state === 'disconnected';
        
        return {
          connectionState: state,
          diagnostics: {
            isConnecting,
            wasConnected,
            hasSocketId: !!pusherInstance.connection.socket_id,
            hasChannels: Object.keys(pusherInstance.channels?.channels || {}).length > 0
          },
          possibleCauses: [
            wasConnected ? 'Connection lost' : 'Initial connection failed',
            'Network connectivity issues',
            'Server unavailable',
            'Authentication timeout',
            'Rate limiting'
          ].filter(Boolean),
          suggestedAction: isConnecting ? 
            'Waiting for connection attempt to complete' : 
            'Initiating automatic reconnection sequence'
        };
      };

      const errorAnalysis = analyzeError();
      
      // Log appropriate message based on error context
      if (!error || Object.keys(error || {}).length === 0) {
        console.warn('⚠️ Pusher connection event:', {
          ...errorInfo,
          ...errorAnalysis,
          level: 'warning',
          timestamp: new Date().toISOString()
        });
      } else {
        const errorDetails = {
          type: error.type || 'unknown',
          code: error.data?.code || 'no_code',
          message: error.message || 'No error message',
          data: error.data || {},
          ...errorInfo,
          ...errorAnalysis,
          level: 'error',
          timestamp: new Date().toISOString()
        };
        
        console.error('❌ Pusher connection error:', errorDetails);
        
        // Additional debug information in development
        if (process.env.NODE_ENV === 'development') {
          console.debug('🔍 Debug Info:', {
            errorStack: error.stack,
            pusherConfig: {
              cluster: pusherInstance.config.cluster,
              enabledTransports: pusherInstance.config.enabledTransports,
              forceTLS: pusherInstance.config.forceTLS,
              activityTimeout: pusherInstance.config.activityTimeout
            },
            connection: {
              state: pusherInstance.connection.state,
              socketId: pusherInstance.connection.socket_id,
            }
          });
        }
      }

      // Enhanced recovery strategy with cluster error handling
      const isClusterError = error?.data?.code === 4001;
      const needsRecovery = !error || 
                           (error?.type === 'PusherError' && !isClusterError) || 
                           pusherInstance.connection.state === 'failed' ||
                           pusherInstance.connection.state === 'disconnected';

      // If it's a cluster configuration error, log it clearly and don't retry
      if (isClusterError) {
        console.error('❌ Pusher cluster configuration error:', {
          code: error.data.code,
          message: error.data.message,
          cluster: pusherInstance.config.cluster,
          suggestedFix: 'Verify cluster configuration matches your Pusher app settings',
          timestamp: new Date().toISOString()
        });
        setIsConnected(false);
        return;
      }
                           
      if (needsRecovery) {
        const recoveryInfo = {
          currentState: pusherInstance.connection.state,
          cluster: pusherInstance.config.cluster,
          recoveryAttempt: (pusherInstance as any)._config?.unavailable_count || 0,
          timestamp: new Date().toISOString()
        };
        
        console.log('🔄 Implementing connection recovery strategy...', recoveryInfo);
        
        if (pusherInstance.connection.state !== 'connected') {
          const retryWithBackoff = (attempt = 1, maxAttempts = 5) => {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 16000); // Max 16s delay
            const attemptInfo = {
              attempt,
              maxAttempts,
              backoffMs,
              nextAttemptAt: new Date(Date.now() + backoffMs).toISOString(),
              connectionState: pusherInstance.connection.state
            };

            if (attempt > maxAttempts) {
              console.error('❌ Max reconnection attempts reached:', attemptInfo);
              return;
            }

            console.log(`🔄 Scheduling reconnection attempt ${attempt}/${maxAttempts}...`, attemptInfo);

            // Clean disconnect only if not already disconnected
            if (pusherInstance.connection.state !== 'disconnected') {
              console.log('🔌 Cleaning up existing connection...');
              pusherInstance.disconnect();
            }

            setTimeout(() => {
              if (pusherInstance.connection.state !== 'connected') {
                console.log(`🔄 Executing reconnection attempt ${attempt}/${maxAttempts}...`, {
                  ...attemptInfo,
                  timestamp: new Date().toISOString()
                });

                try {
                  pusherInstance.connect();
                  
                  // Set up a timeout to check if connection was successful
                  setTimeout(() => {
                    if (pusherInstance.connection.state !== 'connected') {
                      console.log(`⚠️ Reconnection attempt ${attempt} unsuccessful`, {
                        currentState: pusherInstance.connection.state,
                        timestamp: new Date().toISOString()
                      });
                      retryWithBackoff(attempt + 1, maxAttempts);
                    } else {
                      console.log(`✅ Successfully reconnected on attempt ${attempt}`, {
                        socketId: pusherInstance.connection.socket_id,
                        timestamp: new Date().toISOString()
                      });
                    }
                  }, 3000); // Check connection status after 3s
                } catch (reconnectError) {
                  console.error(`❌ Error during reconnection attempt ${attempt}:`, {
                    error: reconnectError instanceof Error ? reconnectError.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                  });
                  retryWithBackoff(attempt + 1, maxAttempts);
                }
              }
            }, backoffMs);
          };

          // Start reconnection process
          retryWithBackoff();
        }
      }
      
      setIsConnected(false);
    });

    console.log(`📡 Setting up Pusher channels for user ${userId} with role ${userRole}`);
    
    // Enhanced channel subscription with retry logic and detailed error handling
    const subscribeToChannel = (channelName: string) => {
      const subscriptionInfo = {
        channelName,
        userId,
        userRole,
        connectionState: pusherInstance.connection.state,
        timestamp: new Date().toISOString()
      };

      console.log(`🔄 Initiating channel subscription:`, subscriptionInfo);

      const handleSubscription = (attempt: number = 1, maxAttempts: number = 3) => {
        try {
          // Check connection state before attempting subscription
          if (pusherInstance.connection.state !== 'connected') {
            console.warn('⚠️ Cannot subscribe while disconnected - queuing subscription', {
              ...subscriptionInfo,
              attempt,
              connectionState: pusherInstance.connection.state
            });
            
            // Queue subscription attempt for when connection is restored
            if (attempt < maxAttempts) {
              setTimeout(() => {
                console.log(`🔄 Retrying subscription (attempt ${attempt}/${maxAttempts})...`);
                handleSubscription(attempt + 1, maxAttempts);
              }, 2000 * attempt); // Exponential backoff
            }
            return null;
          }

          // Attempt subscription
          const channel = pusherInstance.subscribe(channelName);
          
          // Monitor subscription lifecycle events
          channel.bind('pusher:subscription_succeeded', () => {
            console.log(`✅ Channel subscription successful:`, {
              ...subscriptionInfo,
              socketId: pusherInstance.connection.socket_id
            });
          });
          
          channel.bind('pusher:subscription_error', (error: any) => {
            console.error(`❌ Channel subscription failed:`, {
              ...subscriptionInfo,
              error: {
                type: error.type || 'unknown',
                code: error.data?.code || 'no_code',
                message: error.message || 'No error message',
                data: error.data || {}
              }
            });

            // Attempt resubscription if within retry limit
            if (attempt < maxAttempts) {
              console.log(`🔄 Scheduling resubscription attempt ${attempt}/${maxAttempts}...`);
              setTimeout(() => {
                handleSubscription(attempt + 1, maxAttempts);
              }, 2000 * attempt);
            }
          });

          // Monitor for subscription count changes
          channel.bind('pusher:member_added', (member: any) => {
            console.log(`👥 Member joined channel ${channelName}:`, {
              memberId: member.id,
              info: member.info,
              timestamp: new Date().toISOString()
            });
          });

          channel.bind('pusher:member_removed', (member: any) => {
            console.log(`👤 Member left channel ${channelName}:`, {
              memberId: member.id,
              timestamp: new Date().toISOString()
            });
          });
          
          return channel;
        } catch (error) {
          console.error(`❌ Unexpected error during channel subscription:`, {
            ...subscriptionInfo,
            error: error instanceof Error ? error.message : 'Unknown error',
            attempt
          });
          
          // Attempt resubscription if within retry limit
          if (attempt < maxAttempts) {
            setTimeout(() => {
              handleSubscription(attempt + 1, maxAttempts);
            }, 2000 * attempt);
          }
          return null;
        }
      };

      return handleSubscription();
    };

    // Subscribe to user-specific channel
    const userChannel = subscribeToChannel(`user-${userId}`);
    console.log(`📡 User channel subscription initiated: user-${userId}`);
    
    // Subscribe to role-specific channel if available
    let roleChannel: any = null;
    if (userRole) {
      roleChannel = subscribeToChannel(`role-${userRole.toLowerCase()}`);
      console.log(`📡 Role channel subscription initiated: role-${userRole.toLowerCase()}`);
    }

    // Subscribe to broadcast channel for system-wide notifications
    const broadcastChannel = subscribeToChannel('broadcast');
    console.log(`📡 Broadcast channel subscription initiated`);
    
    // Log all active subscriptions
    console.log('📊 Active Pusher channels:', pusherInstance.channels.channels);

    // Listen for role-specific notifications if role channel exists
    if (roleChannel && userRole) {
      roleChannel.bind('notification-order', (data: any) => {
        console.log(`📨 Received notification on role-${userRole} channel:`, {
          userId,
          userRole,
          data,
          channel: `role-${userRole.toLowerCase()}`
        });
        handleNotification('role-notification-order', data);
      });

      roleChannel.bind('notification-system', (data: any) => {
        console.log(`📨 Received system notification on role-${userRole} channel:`, data);
        handleNotification('role-notification-system', data);
      });
    }

    // Generic notification handler - handles backend's sendToUser format
    const handleNotificationInner = (eventName: string, data: any) => {
      console.log(`🔔 Processing notification:`, { eventName, data, currentUserId: userId, currentUserRole: userRole });
      
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type || 'system',
        title: data.title || 'Notification',
        message: data.message || 'You have a new notification',
        data: data.data || {},
        timestamp: new Date(data.timestamp || Date.now()),
        read: false,
        userId: data.userId,
        role: data.role,
      };

      console.log(`✅ Notification created:`, notification);
      setNotifications(prev => {
        const updated = [notification, ...prev];
        console.log(`📊 Updated notifications count: ${updated.length}, unread: ${updated.filter(n => !n.read).length}`);
        return updated;
      });
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    };

    // Listen for backend notification service events (notification-{type})
    if (userChannel) {
      // PRIMARY EVENT: Listen for the main 'new-notification' event from backend
      userChannel.bind('new-notification', (data: any) => {
        console.log(`📨 Received new-notification on user-${userId} channel:`, {
          userId,
          userRole,
          data,
          channel: `user-${userId}`
        });
        handleNotificationInner('new-notification', data);
      });
      console.log(`🔔 Bound new-notification handler to user channel`);

      // Set up all user channel event listeners
      const userEvents = {
        'notification-order': (data: any) => {
          console.log(`📨 Received notification on user-${userId} channel:`, {
            userId,
            userRole,
            data,
            channel: `user-${userId}`
          });
          handleNotificationInner('notification-order', data);
        },
        'notification-payment': (data: any) => handleNotificationInner('notification-payment', data),
        'notification-product': (data: any) => handleNotificationInner('notification-product', data),
        'notification-system': (data: any) => handleNotificationInner('notification-system', data),
        'notification-verification': (data: any) => handleNotificationInner('notification-verification', data),
      };

      // Bind all events
      Object.entries(userEvents).forEach(([event, handler]) => {
        userChannel.bind(event, handler);
        console.log(`🔔 Bound ${event} handler to user channel`);
      });
    }

    userChannel?.bind('notification-payout', (data: any) => {
      handleNotificationInner('notification-payout', data);
    });

    // Legacy support for specific event names
    userChannel?.bind('order-placed', (data: any) => {
      handleNotificationInner('order-placed', {
        ...data,
        type: 'order',
        title: '🛍️ Order Placed',
        message: `Your order #${data.orderId} has been placed successfully.`,
      });
    });

    userChannel?.bind('order-status-update', (data: any) => {
      handleNotificationInner('order-status-update', {
        ...data,
        type: 'order',
        title: '📦 Order Update',
        message: `Order #${data.orderId} status changed to ${data.status}.`,
      });
    });

    userChannel?.bind('payment-processed', (data: any) => {
      handleNotificationInner('payment-processed', {
        ...data,
        type: 'payment',
        title: '💳 Payment Processed',
        message: `Payment of $${data.amount} has been processed successfully.`,
      });
    });

    userChannel?.bind('payment-failed', (data: any) => {
      handleNotificationInner('payment-failed', {
        ...data,
        type: 'payment',
        title: '❌ Payment Failed',
        message: `Payment of $${data.amount} has failed. Please try again.`,
      });
    });

    // Role-specific events
    if (roleChannel) {
      roleChannel.bind('new-order-seller', (data: any) => {
        handleNotificationInner('new-order-seller', {
          ...data,
          type: 'order',
          title: '🛍️ New Order Received',
          message: `You have a new order #${data.orderId} for $${data.amount}.`,
        });
      });

      roleChannel.bind('seller-verification-update', (data: any) => {
        handleNotificationInner('seller-verification-update', {
          ...data,
          type: 'seller',
          title: '✅ Verification Update',
          message: `Your seller verification status has been updated to ${data.status}.`,
        });
      });

      roleChannel.bind('payout-processed', (data: any) => {
        handleNotificationInner('payout-processed', {
          ...data,
          type: 'seller',
          title: '💰 Payout Processed',
          message: `Your payout of $${data.amount} has been processed.`,
        });
      });

      roleChannel.bind('product-low-stock', (data: any) => {
        handleNotificationInner('product-low-stock', {
          ...data,
          type: 'product',
          title: '⚠️ Low Stock Alert',
          message: `Product "${data.productName}" is running low on stock (${data.stock} remaining).`,
        });
      });

      roleChannel.bind('product-out-of-stock', (data: any) => {
        handleNotificationInner('product-out-of-stock', {
          ...data,
          type: 'product',
          title: '❌ Out of Stock',
          message: `Product "${data.productName}" is now out of stock.`,
        });
      });
    }

    // Listen for new-notification event on broadcast channel
    if (broadcastChannel) {
      broadcastChannel.bind('new-notification', (data: any) => {
        console.log(`📨 Received new-notification on broadcast channel:`, {
          userId,
          userRole,
          data,
          channel: 'broadcast'
        });
        handleNotificationInner('new-notification', data);
      });
      console.log(`🔔 Bound new-notification handler to broadcast channel`);
    }

    // Listen for new-notification event on role channel
    if (roleChannel && userRole) {
      roleChannel.bind('new-notification', (data: any) => {
        console.log(`📨 Received new-notification on role-${userRole} channel:`, {
          userId,
          userRole,
          data,
          channel: `role-${userRole.toLowerCase()}`
        });
        handleNotificationInner('new-notification', data);
      });
      console.log(`🔔 Bound new-notification handler to role channel`);
    }

    // Generic notification listeners for backend events (catch-all)
    userChannel?.bind_global((eventName: string, data: any) => {
      console.log(`📨 Received notification on user channel: ${eventName}`, data);
      if (eventName.startsWith('notification-')) {
        handleNotificationInner(eventName, {
          ...data,
          type: data.type || 'system',
          title: data.title || 'New Notification',
          message: data.message || 'You have a new notification',
        });
      }
    });

    if (roleChannel) {
      roleChannel.bind_global((eventName: string, data: any) => {
        console.log(`📨 Received notification on role channel: ${eventName}`, data);
        if (eventName.startsWith('notification-')) {
          handleNotificationInner(eventName, {
            ...data,
            type: data.type || 'system',
            title: data.title || 'New Notification',
            message: data.message || 'You have a new notification',
          });
        }
      });
    }

    broadcastChannel?.bind_global((eventName: string, data: any) => {
      console.log(`📨 Received notification on broadcast channel: ${eventName}`, data);
      if (eventName.startsWith('notification-') || eventName.startsWith('broadcast-')) {
        handleNotificationInner(eventName, {
          ...data,
          type: data.type || 'system',
          title: data.title || 'New Notification',
          message: data.message || 'You have a new notification',
        });
      }
    });

    // Broadcast events (system-wide)
    broadcastChannel?.bind('system-maintenance', (data: any) => {
      handleNotificationInner('system-maintenance', {
        ...data,
        type: 'system',
        title: '🔧 System Maintenance',
        message: data.message || 'System maintenance is scheduled.',
      });
    });

    broadcastChannel?.bind('system-announcement', (data: any) => {
      handleNotificationInner('system-announcement', {
        ...data,
        type: 'system',
        title: '📢 Announcement',
        message: data.message || 'New system announcement.',
      });
    });

    // Listen for demo notifications (for testing)
    const handleDemoNotification = (event: any) => {
      const data = event.detail;
      handleNotificationInner('demo-notification', data);
    };

    window.addEventListener('demo-notification', handleDemoNotification);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      try {
        // Check if pusher is still connected before cleanup
        const connectionState = pusherInstance.connection.state;
        
        if (connectionState === 'connected' || connectionState === 'connecting') {
          userChannel?.unbind_all();
          roleChannel?.unbind_all();
          broadcastChannel?.unbind_all();
          
          // Safely unsubscribe from channels
          pusherInstance.unsubscribe(`user-${userId}`);
          if (userRole) {
            pusherInstance.unsubscribe(`role-${userRole.toLowerCase()}`);
          }
          pusherInstance.unsubscribe('broadcast');
        }
        
        // Always disconnect (pusher handles already disconnected state)
        pusherInstance.disconnect();
        
        // Remove demo event listener
        window.removeEventListener('demo-notification', handleDemoNotification);
      } catch (error) {
        console.warn('Pusher cleanup warning:', error);
      }
    };
  }, [userId, userRole]);

  function markAsRead(id: string) {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif
    )
    );
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};