import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  X,
  LayoutDashboard,
  Sparkles,
  ShieldAlert,
  FileText,
  FolderLock,
  Search,
  HelpCircle,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const navigationShortcuts: ShortcutItem[] = [
    {
      keys: ['Alt', '1'],
      label: 'Citizen Dashboard',
      description: 'Navigate to main overview, live intelligence & bento cards',
      icon: LayoutDashboard,
    },
    {
      keys: ['Alt', '2'],
      label: 'Welfare Schemes',
      description: 'Explore verified Central & State benefits & eligibility matcher',
      icon: Sparkles,
    },
    {
      keys: ['Alt', '3'],
      label: 'Grievance Redressal',
      description: 'Register & auto-dispatch citizen complaints with Web3Forms',
      icon: ShieldAlert,
    },
    {
      keys: ['Alt', '4'],
      label: 'RTI Assistant',
      description: 'Auto-draft Right to Information applications with PDF generator',
      icon: FileText,
    },
    {
      keys: ['Alt', '5'],
      label: 'Document Vault',
      description: 'Access DigiLocker synced certificates & AI legal simplifier',
      icon: FolderLock,
    },
  ];

  const actionShortcuts: ShortcutItem[] = [
    {
      keys: ['Alt', 'K'],
      label: 'Universal Search',
      description: 'Focus query bar across all schemes, services and legal templates',
      icon: Search,
    },
    {
      keys: ['?'],
      label: 'Keyboard Help',
      description: 'Toggle this shortcuts modal from anywhere in the platform',
      icon: HelpCircle,
    },
    {
      keys: ['Esc'],
      label: 'Dismiss Modal',
      description: 'Close active popups, drawers, or dialog windows',
      icon: X,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Keyboard Navigation & Hotkeys
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Kiosk Ready
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick hotkeys designed for high-efficiency navigation and assisted village kiosks.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* View Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Direct View Navigation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {navigationShortcuts.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 dark:text-slate-500 transition-colors flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-700 dark:text-slate-300"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Controls */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Platform Shortcuts & Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {actionShortcuts.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 dark:text-slate-500 transition-colors flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-700 dark:text-slate-300"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Press <kbd className="font-mono font-bold">Esc</kbd> to exit at any time.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-emerald-500/20"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
