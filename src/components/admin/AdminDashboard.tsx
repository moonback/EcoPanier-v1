import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AdminStats } from './AdminStats';
import { UserManagement } from './UserManagement';
import { ProfilePage } from '../shared/ProfilePage';
import { PlatformSettings } from './PlatformSettings';
import { SettingsHistory } from './SettingsHistory';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { ActivityLogs } from './ActivityLogs';
import { ReportsGenerator } from './ReportsGenerator';
import { SuspendedBaskets } from './SuspendedBaskets';
import { BarChart3, Users, LogOut, User, Shield, Settings, TrendingUp, Activity, History, FileText, Heart, ChevronLeft, ChevronRight, Home } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'baskets' | 'analytics' | 'logs' | 'reports' | 'settings' | 'history' | 'profile'>('stats');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        { id: 'baskets', label: 'Paniers Suspendus', icon: Heart, color: 'accent' },
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

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Menu */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-neutral-200 shadow-soft-lg transition-all duration-300 flex flex-col sticky top-0 h-screen`}>
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
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center transition-all ml-auto"
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
                      onClick={() => setActiveTab(item.id as any)}
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
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                {menuSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de bord'}
              </h1>
              <p className="text-sm text-neutral-600 font-medium mt-0.5">
                Panneau d'administration - {profile?.full_name}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-xl border border-success-200">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-success-700">Système opérationnel</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-12xl mx-auto">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'baskets' && <SuspendedBaskets />}
            {activeTab === 'analytics' && <AdvancedAnalytics />}
            {activeTab === 'reports' && <ReportsGenerator />}
            {activeTab === 'logs' && <ActivityLogs />}
            {activeTab === 'settings' && <PlatformSettings />}
            {activeTab === 'history' && <SettingsHistory />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>
    </div>
  );
};
