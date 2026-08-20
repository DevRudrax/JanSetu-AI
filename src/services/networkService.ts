import { useState, useEffect, useCallback } from 'react';

export interface NetworkState {
  isOnline: boolean;
  isReconnecting: boolean;
  latencyMs: number | null;
  lastOnlineAt: Date | null;
}

export const useNetworkStatus = (): NetworkState => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(() => new Date());

  const checkPing = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setLatencyMs(null);
      return;
    }

    try {
      const startTime = performance.now();
      // Lightweight HEAD request to check true Internet connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLatencyMs(duration);
      setIsOnline(true);
      setLastOnlineAt(new Date());
    } catch {
      // If cross-origin or network error occurs, fallback to navigator.onLine
      setIsOnline(navigator.onLine);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsReconnecting(true);
      checkPing().finally(() => {
        setIsOnline(true);
        setLastOnlineAt(new Date());
        setIsReconnecting(false);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setLatencyMs(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial ping check
    checkPing();

    // Periodic heartbeat every 45 seconds when page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkPing();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkPing]);

  return { isOnline, isReconnecting, latencyMs, lastOnlineAt };
};
