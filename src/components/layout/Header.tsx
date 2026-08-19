import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useCitizen } from '../../context/CitizenContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { SupabaseConfigModal } from '../auth/SupabaseConfigModal';
import { 
  Globe, 
  Contrast, 
  Moon, 
  Sun, 
  ChevronDown, 
  Search, 
  Type,
  LogOut,
  Sliders,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { Language } from '../../types';

export const Header: React.FC = () => {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const { theme, toggleHighContrast, toggleDarkMode, textSize, increaseTextSize, decreaseTextSize, isHighContrast } = useAccessibility();
  const { currentCitizen, setActiveView, setGlobalSearchQuery } = useCitizen();
  const { user, signOut } = useAuth();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setGlobalSearchQuery(headerSearch.trim());
      setActiveView('dashboard');
      setHeaderSearch('');
    }
  };

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await signOut();
  };

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-border-light z-40 flex items-center justify-between px-4 lg:px-8 transition-colors">
        {/* Left Side: Mobile Logo & Quick Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {/* Mobile Logo Only (LG uses sidebar) */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-sm shadow-sm">
              JS
            </div>
            <span className="font-bold text-primary text-base">JanSetu AI</span>
          </div>

          {/* Quick Header Search Bar */}
          <form onSubmit={handleHeaderSearchSubmit} className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-low rounded-full border border-border-light/60 w-full focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all">
            <Search className="w-4 h-4 text-outline shrink-0" />
            <input
              type="text"
              value={headerSearch}
              onChange={e => setHeaderSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="bg-transparent border-none text-xs text-on-surface placeholder:text-outline-variant outline-none w-full"
            />
          </form>
        </div>

        {/* Right Side: Tools & Citizen Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="relative flex items-center gap-1.5 bg-surface-container-low/70 px-2.5 py-1.5 rounded-full border border-border-light/50">
            <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
            <select
              value={currentLanguage}
              onChange={e => setLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-semibold text-on-surface cursor-pointer focus:outline-none pr-1"
              aria-label="Select Language"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-surface-container-lowest text-on-surface">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Accessibility Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              className={`p-2 rounded-full border transition-all flex items-center gap-1.5 ${
                isHighContrast
                  ? 'bg-status-warning text-black border-status-warning font-bold'
                  : 'bg-surface-container-low/70 hover:bg-surface-container border-border-light/50 text-on-surface-variant'
              }`}
              title="Accessibility Settings"
            >
              <Contrast className="w-4 h-4" />
              <span className="text-[11px] font-semibold hidden md:inline">Accessibility</span>
              <ChevronDown className="w-3 h-3 hidden md:inline" />
            </button>

            {showAccessMenu && (
              <div className="absolute right-0 top-11 w-56 bg-surface-container-lowest border border-border-light rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border-light">
                  <span className="text-xs font-bold text-on-surface">Accessibility Tools</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-bold">WCAG AAA</span>
                </div>

                {/* High Contrast */}
                <button
                  onClick={toggleHighContrast}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isHighContrast ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Contrast className="w-3.5 h-3.5" />
                    High Contrast Mode
                  </span>
                  <span className="text-[10px] font-bold">{isHighContrast ? 'ON' : 'OFF'}</span>
                </button>

                {/* Dark Mode */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-container text-on-surface transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-status-warning" /> : <Moon className="w-3.5 h-3.5" />}
                    Dark Mode
                  </span>
                  <span className="text-[10px] font-bold">{theme === 'dark' ? 'ON' : 'OFF'}</span>
                </button>

                {/* Font Resizing */}
                <div className="pt-2 border-t border-border-light flex items-center justify-between px-2.5">
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    Font Size
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={decreaseTextSize}
                      disabled={textSize === 'normal'}
                      className="px-2 py-0.5 text-xs font-bold rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40"
                    >
                      A-
                    </button>
                    <button
                      onClick={increaseTextSize}
                      disabled={textSize === 'xlarge'}
                      className="px-2 py-0.5 text-xs font-bold rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-border-light hidden sm:block"></div>

          {/* Authenticated Citizen Profile Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full hover:bg-surface-container-low transition-colors group border border-transparent hover:border-border-light"
              title="Citizen Account Menu"
            >
              <div className="flex flex-col items-end hidden sm:flex text-right">
                <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                  {currentCitizen.name}
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {currentCitizen.occupation} • {currentCitizen.state}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary transition-all shadow-sm">
                {currentCitizen.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest border border-border-light rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-border-light bg-surface-container-low/50 rounded-xl mb-1">
                  <p className="text-xs font-bold text-on-surface">{user?.name || currentCitizen.name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{user?.email || 'citizen@jansetu.nic.in'}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {currentCitizen.occupation}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Aadhaar Linked
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-surface-container text-on-surface transition-colors text-left"
                >
                  <Sliders className="w-4 h-4 text-primary" />
                  <span>Edit Citizen Attributes</span>
                </button>

                <div className="my-1 border-t border-border-light"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-status-error/10 text-status-error transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
