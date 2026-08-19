import React from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Landmark, 
  MessageSquareWarning, 
  FolderLock, 
  FileText, 
  Headphones, 
  Bot,
  LogOut,
  Sliders
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentCitizen } = useCitizen();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { id: 'schemes', label: t('schemes'), icon: Landmark, badge: '12+ Central' },
    { id: 'grievances', label: t('grievances'), icon: MessageSquareWarning, badge: 'AI Routed' },
    { id: 'documents', label: t('documents'), icon: FolderLock, badge: 'DigiLocker' },
    { id: 'rti-assistant', label: t('rtiAssistant'), icon: FileText, badge: 'RTI 2005' },
  ] as const;

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-border-light z-50 hidden lg:flex flex-col justify-between shadow-[1px_0_0_rgba(0,0,0,0.03)]">
      {/* Brand & GovTech Badge Header */}
      <div>
        <div className="p-6 border-b border-border-light bg-surface-container-low/30 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md shadow-primary/20">
              <Landmark className="w-5 h-5 text-tertiary-fixed" />
            </div>
            <div>
              <span className="font-bold font-display text-xl text-primary tracking-tight">JanSetu AI</span>
              <p className="text-[10px] font-semibold text-on-surface-variant leading-none">Citizen Governance Copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
              Govt of India Initiative
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 flex flex-col gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all group ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-tertiary-fixed' : 'text-on-surface-variant'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-on-primary-container/20 text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: User Profile & Helpdesk */}
      <div className="p-4 space-y-3">
        {/* User Account Card */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-border-light flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
              {currentCitizen.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">{currentCitizen.name}</span>
              <span className="text-[10px] text-on-surface-variant truncate">{user?.email || `${currentCitizen.occupation}`}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-status-error/10 hover:text-status-error transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Helpdesk */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-border-light flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">{t('helpdesk')}</span>
            <a href="tel:1800110001" className="text-xs font-bold text-primary hover:underline">
              1800-110-001 (Toll Free)
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
