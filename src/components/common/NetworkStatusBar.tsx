import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, HardDrive } from 'lucide-react';
import { useNetworkStatus } from '../../services/networkService';

export const NetworkStatusBar: React.FC = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();

  // If user is online and not in reconnection phase, hide banner
  if (isOnline && !isReconnecting) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        aria-live="polite"
        role="status"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-md z-50 sticky top-16"
      >
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            {isReconnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
            )}
            <span>
              {isReconnecting ? (
                <strong>Reconnecting to sovereign cloud...</strong>
              ) : (
                <>
                  <strong>Offline Mode Active:</strong> You are currently disconnected. All scheme drafts, grievance forms, and documents remain securely cached locally.
                </>
              )}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] bg-black/20 px-2 py-0.5 rounded-full text-amber-100 shrink-0">
            <HardDrive className="w-3 h-3" />
            <span>Local Cache Resilient</span>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
