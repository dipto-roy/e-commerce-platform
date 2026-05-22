'use client';
import { useState, useCallback } from 'react';
import type { Notification, NotificationType } from './types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002/api/v1';

/** Numeric string = persisted in DB; temp SSE id = has prefix */
const isBackendId = (id: string) => /^\d+$/.test(id);

export function useNotificationState(userId?: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ─── Fetch historical ─────────────────────────────────────────────────────

  const fetchHistoricalNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/notifications/my?limit=50`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const body = (await res.json()) as {
        notifications: Record<string, unknown>[];
        total: number;
      };
      const mapped: Notification[] = (body.notifications ?? []).map((n) => ({
        id: String(n.id),
        type: ((n.type as string) ?? 'system') as NotificationType,
        title: n.title as string,
        message: n.message as string,
        data: (n.data as Record<string, unknown>) ?? {},
        timestamp: new Date(n.createdAt as string),
        read: n.read as boolean,
        userId: n.userId as number,
        actionUrl: (n.actionUrl as string) ?? undefined,
      }));
      setNotifications((prev) => {
        const backendIds = new Set(mapped.map((n) => n.id));
        // Keep any SSE-only (not-yet-persisted) items that aren't superseded
        const sseOnly = prev.filter(
          (n) => !isBackendId(n.id) && !backendIds.has(n.id),
        );
        return [...mapped, ...sseOnly];
      });
    } catch {
      // backend unavailable — silently skip
    }
  }, [userId]);

  // ─── Handle incoming SSE event ────────────────────────────────────────────

  const addNotification = useCallback(
    (raw: Record<string, unknown>) => {
      const notification: Notification = {
        id: raw.id ? String(raw.id) : `sse-${Date.now()}-${Math.random()}`,
        type: ((raw.type as string) ?? 'system') as NotificationType,
        title: (raw.title as string) ?? 'Notification',
        message: (raw.message as string) ?? 'You have a new notification',
        data: (raw.data as Record<string, unknown>) ?? {},
        timestamp: new Date((raw.timestamp as string) ?? Date.now()),
        read: false,
        userId: raw.userId as number | undefined,
        actionUrl: (raw.actionUrl as string) ?? undefined,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Browser notification (when tab is backgrounded)
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        try {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        } catch {
          // browser notifications blocked
        }
      }
    },
    [],
  );

  // ─── Mutations ────────────────────────────────────────────────────────────

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    if (isBackendId(id)) {
      fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch(`${API_URL}/notifications/my/read-all`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (isBackendId(id)) {
      fetch(`${API_URL}/notifications/${id}/delete`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {});
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    fetchHistoricalNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
}
