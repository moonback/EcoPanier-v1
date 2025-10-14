// Imports externes
import { useState } from 'react';
import { Users, LogOut, User, Shield, Settings, TrendingUp, Activity, History, FileText, ChevronLeft, ChevronRight, Home, Menu, X, MapPin, Package } from 'lucide-react';

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
        { id: 'stats', label: 'Tableau de bord', icon: Home, color: 'primary', emoji: '🏠' },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: Users, color: 'secondary', emoji: '👥' },
        { id: 'lots', label: 'Modération Lots', icon: Package, color: 'warning', emoji: '📦' },
        { id: 'geocode', label: 'Géocodage', icon: MapPin, color: 'primary', emoji: '🗺️' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'success', emoji: '📊' },
        { id: 'reports', label: 'Rapports', icon: FileText, color: 'warning', emoji: '📄' },
        { id: 'logs', label: 'Logs d\'activité', icon: Activity, color: 'primary', emoji: '📝' },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'settings', label: 'Paramètres', icon: Settings, color: 'secondary', emoji: '⚙️' },
        { id: 'history', label: 'Historique', icon: History, color: 'neutral', emoji: '🕒' },
      ]
    },
    {
      title: 'Compte',
      items: [
        { id: 'profile', label: 'Mon Profil', icon: User, color: 'accent', emoji: '👤' },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string; gradient: string }> = {
      primary: { bg: 'bg-primary-50', text: 'text-primary-700', hover: 'hover:bg-primary-100', gradient: 'from-primary-500 to-primary-600' },
      secondary: { bg: 'bg-secondary-50', text: 'text-secondary-700', hover: 'hover:bg-secondary-100', gradient: 'from-secondary-500 to-secondary-600' },
      accent: { bg: 'bg-accent-50', text: 'text-accent-700', hover: 'hover:bg-accent-100', gradient: 'from-accent-500 to-accent-600' },
      success: { bg: 'bg-success-50', text: 'text-success-700', hover: 'hover:bg-success-100', gradient: 'from-success-500 to-success-600' },
      warning: { bg: 'bg-warning-50', text: 'text-warning-700', hover: 'hover:bg-warning-100', gradient: 'from-warning-500 to-warning-600' },
      neutral: { bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100', gradient: 'from-gray-500 to-gray-600' },
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
    <div className="min-h-screen bg-gray-50 flex">
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
        bg-white border-r-2 border-gray-200 shadow-xl transition-all duration-300 flex flex-col
        fixed lg:sticky top-0 h-screen z-50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Sidebar */}
        <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-white to-accent-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield size={22} strokeWidth={2} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Admin</span>
                  </h2>
                  <p className="text-xs text-gray-600 font-semibold">{profile?.full_name}</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <Shield size={22} strokeWidth={2} className="text-white" />
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
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const colors = getColorClasses(item.color);
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as TabId)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all group relative ${
                        isActive
                          ? `${colors.bg} ${colors.text} shadow-md border-2 border-${item.color}-200`
                          : `text-gray-600 ${colors.hover} border-2 border-transparent`
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      {isActive && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b ${colors.gradient} rounded-r-full shadow-lg`}></div>
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isActive ? `bg-gradient-to-br ${colors.gradient} scale-110 shadow-md` : 'bg-gray-100 group-hover:scale-105'
                      }`}>
                        <Icon size={20} strokeWidth={2} className={isActive ? 'text-white' : 'text-gray-600'} />
                      </div>
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left text-sm flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <span>{item.label}</span>
                        </span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <div className={`w-2 h-2 bg-gradient-to-br ${colors.gradient} rounded-full animate-pulse shadow-sm`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t-2 border-gray-100 bg-gradient-to-r from-white to-accent-50">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-700 hover:bg-accent-100 hover:text-accent-700 transition-all group border-2 border-transparent hover:border-accent-200"
            title={sidebarCollapsed ? 'Déconnexion' : ''}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-accent-500 group-hover:to-accent-600">
              <LogOut size={20} strokeWidth={2} className="group-hover:text-white transition-colors" />
            </div>
            {!sidebarCollapsed && (
              <span className="flex-1 text-left text-sm flex items-center gap-2">
                <span>🚪</span>
                <span>Déconnexion</span>
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-gray-100 shadow-md">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            {/* Bouton menu burger sur mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 bg-gray-100 hover:bg-primary-50 rounded-xl flex items-center justify-center transition-all flex-shrink-0 border-2 border-gray-200 hover:border-primary-300"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} strokeWidth={2} className="text-gray-700" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-black tracking-tight truncate flex items-center gap-2">
                <span>{menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.emoji}</span>
                <span>{menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de bord'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5 truncate">
                Panneau d'administration • {profile?.full_name}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border-2 border-success-200 shadow-sm">
                <div className="w-2 h-2 bg-gradient-to-br from-success-500 to-success-600 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-sm font-bold text-success-700">✅ Système opérationnel</span>
              </div>
            </div>

            {/* Bouton déconnexion mobile */}
            <button
              onClick={signOut}
              className="lg:hidden w-10 h-10 bg-accent-50 hover:bg-accent-100 rounded-xl flex items-center justify-center transition-all flex-shrink-0 border-2 border-accent-200"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} strokeWidth={2} className="text-accent-600" />
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
