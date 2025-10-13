// Imports externes
import { useState } from 'react';
import { BarChart3, Users, LogOut, User, Shield, Settings, TrendingUp, Activity, History, FileText, ChevronLeft, ChevronRight, Home, Menu, X, MapPin, Package } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { AdminStats } from './AdminStats';
import { UserManagement } from './UserManagement';
import { ProfilePage } from '../shared/ProfilePage';
import { PlatformSettings } from './PlatformSettings';
import { SettingsHistory } from './SettingsHistory';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { ActivityLogs } from './ActivityLogs';
import { ReportsGenerator } from './ReportsGenerator';
import { GeocodeMerchants } from './GeocodeMerchants';
import { LotModeration } from './LotModeration';

// Type pour les onglets
type TabId = 'stats' | 'users' | 'lots' | 'analytics' | 'logs' | 'reports' | 'settings' | 'history' | 'profile' | 'geocode';

/**
 * Dashboard principal pour les administrateurs
 * Interface complète de gestion avec menu latéral et navigation par sections
 */
export const AdminDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hooks (stores, contexts, router)
  const { profile, signOut } = useAuthStore();

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'stats', label: 'Tableau de bord', icon: Home, color: 'primary' },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: Users, color: 'secondary' },
        { id: 'lots', label: 'Modération Lots', icon: Package, color: 'warning' },
        { id: 'geocode', label: 'Géocodage', icon: MapPin, color: 'primary' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'success' },
        { id: 'reports', label: 'Rapports', icon: FileText, color: 'warning' },
        { id: 'logs', label: 'Logs', icon: Activity, color: 'primary' },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'settings', label: 'Paramètres', icon: Settings, color: 'secondary' },
        { id: 'history', label: 'Historique', icon: History, color: 'neutral' },
      ]
    },
    {
      title: 'Compte',
      items: [
        { id: 'profile', label: 'Mon Profil', icon: User, color: 'accent' },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      primary: { bg: 'bg-primary-100', text: 'text-primary-600', hover: 'hover:bg-primary-50' },
      secondary: { bg: 'bg-secondary-100', text: 'text-secondary-600', hover: 'hover:bg-secondary-50' },
      accent: { bg: 'bg-accent-100', text: 'text-accent-600', hover: 'hover:bg-accent-50' },
      success: { bg: 'bg-success-100', text: 'text-success-600', hover: 'hover:bg-success-50' },
      warning: { bg: 'bg-warning-100', text: 'text-warning-600', hover: 'hover:bg-warning-50' },
      neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600', hover: 'hover:bg-neutral-50' },
    };
    return colorMap[color] || colorMap.primary;
  };

  // Handlers
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false); // Fermer le menu mobile après sélection
  };

  // Render principal
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Overlay pour mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <aside className={`
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        bg-white border-r border-neutral-200 shadow-soft-lg transition-all duration-300 flex flex-col
        fixed lg:sticky top-0 h-screen z-50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Sidebar */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft-md">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 tracking-tight">Admin</h2>
                  <p className="text-xs text-neutral-500 font-medium -mt-0.5">{profile?.full_name}</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft-md mx-auto">
                <Shield size={20} className="text-white" />
              </div>
            )}
            {/* Bouton fermer sur mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 lg:hidden bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all ml-auto"
              aria-label="Fermer le menu"
            >
              <X size={16} className="text-neutral-600" />
            </button>
            {/* Bouton collapse sur desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg items-center justify-center transition-all ml-auto"
              title={sidebarCollapsed ? 'Étendre' : 'Réduire'}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={16} className="text-neutral-600" />
              ) : (
                <ChevronLeft size={16} className="text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const colors = getColorClasses(item.color);
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as TabId)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group relative ${
                        isActive
                          ? `${colors.bg} ${colors.text}`
                          : `text-neutral-600 ${colors.hover}`
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-accent-500 to-accent-600 rounded-r-full"></div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        <Icon size={20} />
                      </div>
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-neutral-600 hover:bg-accent-50 hover:text-accent-600 transition-all group"
            title={sidebarCollapsed ? 'Déconnexion' : ''}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <LogOut size={20} />
            </div>
            {!sidebarCollapsed && <span className="flex-1 text-left text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass sticky top-0 z-30 border-b border-neutral-100 shadow-soft">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            {/* Bouton menu burger sur mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} className="text-neutral-600" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight truncate">
                {menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de bord'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5 truncate">
                Panneau d'administration - {profile?.full_name}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-xl border border-success-200">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-success-700">Système opérationnel</span>
              </div>
            </div>

            {/* Bouton déconnexion mobile */}
            <button
              onClick={signOut}
              className="lg:hidden w-9 h-9 bg-accent-50 hover:bg-accent-100 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} className="text-accent-600" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-12xl mx-auto">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'lots' && <LotModeration />}
            {activeTab === 'analytics' && <AdvancedAnalytics />}
            {activeTab === 'reports' && <ReportsGenerator />}
            {activeTab === 'logs' && <ActivityLogs />}
            {activeTab === 'settings' && <PlatformSettings />}
            {activeTab === 'history' && <SettingsHistory />}
            {activeTab === 'geocode' && <GeocodeMerchants />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>
    </div>
  );
};
