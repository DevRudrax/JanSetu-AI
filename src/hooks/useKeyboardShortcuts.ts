import { useEffect } from 'react';

export type NavViewType = 'dashboard' | 'schemes' | 'grievances' | 'documents' | 'rti-assistant';

export interface ShortcutAction {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  description: string;
  category: 'Navigation' | 'Actions' | 'Accessibility';
  action: () => void;
}

interface UseKeyboardShortcutsProps {
  onNavigate?: (view: NavViewType) => void;
  onOpenShortcuts?: () => void;
  onToggleSearch?: () => void;
  onCloseModals?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onNavigate,
  onOpenShortcuts,
  onToggleSearch,
  onCloseModals,
  enabled = true,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT';

      // Global Escape handler always triggers
      if (e.key === 'Escape') {
        onCloseModals?.();
        return;
      }

      // If user is actively typing in an input, don't trigger navigation shortcuts
      if (isInput && !e.altKey && !e.ctrlKey) {
        return;
      }

      // Quick Help Modal (? or Alt+/)
      if ((e.key === '?' && !isInput) || (e.altKey && e.key === '/')) {
        e.preventDefault();
        onOpenShortcuts?.();
        return;
      }

      // Global Search (Alt + K or Ctrl + K)
      if ((e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleSearch?.();
        return;
      }

      // View Navigation Shortcuts (Alt + 1 to Alt + 5)
      if (e.altKey && onNavigate) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onNavigate('dashboard');
            break;
          case '2':
            e.preventDefault();
            onNavigate('schemes');
            break;
          case '3':
            e.preventDefault();
            onNavigate('grievances');
            break;
          case '4':
            e.preventDefault();
            onNavigate('rti-assistant');
            break;
          case '5':
            e.preventDefault();
            onNavigate('documents');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onOpenShortcuts, onToggleSearch, onCloseModals, enabled]);
};
