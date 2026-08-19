import React from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { CitizenProvider, useCitizen } from './context/CitizenContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { SchemesView } from './components/views/SchemesView';
import { GrievanceView } from './components/views/GrievanceView';
import { DocumentsView } from './components/views/DocumentsView';
import { RtiAssistantView } from './components/views/RtiAssistantView';
import { 
  LayoutDashboard, 
  Landmark, 
  MessageSquareWarning, 
  FolderLock, 
  FileText 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useCitizen();
  const { t } = useLanguage();

  const mobileNavItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'schemes', label: t('schemes'), icon: Landmark },
    { id: 'grievances', label: t('grievances'), icon: MessageSquareWarning },
    { id: 'documents', label: t('documents'), icon: FolderLock },
    { id: 'rti-assistant', label: t('rtiAssistant'), icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Left Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 pb-16 lg:pb-0">
        {/* Fixed Header */}
        <Header />

        {/* Dynamic Main View */}
        <main className="flex-1 pt-16">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'schemes' && <SchemesView />}
          {activeView === 'grievances' && <GrievanceView />}
          {activeView === 'documents' && <DocumentsView />}
          {activeView === 'rti-assistant' && <RtiAssistantView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on LG) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-border-light z-40 flex items-center justify-around px-2 shadow-lg">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary scale-110' : 'text-outline'}`} />
              <span className="text-[10px] truncate max-w-[56px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <CitizenProvider>
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          </CitizenProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
};

export default App;
