'use client';
import { useEffect, useRef, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002/api/v1';
const DEV = process.env.NODE_ENV === 'development';

const log = (...args: unknown[]) => DEV && console.log('[SSE]', ...args);

/**
 * Connects to GET /notifications/sse (NestJS @Sse endpoint).
 * Reconnects with exponential back-off on error.
 * Calls `onNotification` for every inbound event.
 */
export function useSseNotifications(
  userId: number | undefined,
  onNotification: (data: Record<string, unknown>) => void,
): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(false);
  // Stable ref — avoids re-running the effect when the callback changes identity
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!userId) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      log(`Connecting user ${userId} (attempt ${attempt + 1})`);

      es = new EventSource(`${API_URL}/notifications/sse`, {
        withCredentials: true,
      });

      es.onopen = () => {
        if (destroyed) return;
        attempt = 0;
        setIsConnected(true);
        log(`Connected user ${userId}`);
      };

      es.onmessage = (event: MessageEvent<string>) => {
        if (destroyed) return;
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>;
          onNotificationRef.current(data);
        } catch {
          // malformed JSON — skip
        }
      };

      es.onerror = () => {
        if (destroyed) return;
        setIsConnected(false);
        es?.close();
        es = null;

        // Exponential back-off: 1 s → 2 s → 4 s → 8 s → 16 s (cap)
        const delayMs = Math.min(1_000 * 2 ** attempt, 16_000);
        attempt++;
        log(`Error — retry in ${delayMs}ms (attempt ${attempt})`);
        retryTimeout = setTimeout(connect, delayMs);
      };
    };

    connect();

    // Request browser notification permission once
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'default'
    ) {
      window.Notification.requestPermission().catch(() => {});
    }

    return () => {
      destroyed = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
      setIsConnected(false);
    };
  }, [userId]);

  return { isConnected };
}
