// Imports externes
import { useState } from 'react';
import { Package, TrendingUp, LogOut, Scan, User } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { SalesStats } from './SalesStats';
import { ProfilePage } from '../shared/ProfilePage';

// Type pour les onglets
type TabId = 'lots' | 'stats' | 'profile';

/**
 * Dashboard principal pour les commerçants
 * Gère la navigation entre les différentes sections : gestion des lots,
 * statistiques de vente et profil
 */
export const MerchantDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('lots');

  // Hooks (stores, contexts, router)
  const { profile, signOut } = useAuthStore();

  // Configuration des onglets
  const tabs = [
    { id: 'lots' as TabId, label: 'Mes Lots', icon: Package },
    { id: 'stats' as TabId, label: 'Statistiques', icon: TrendingUp },
    { id: 'profile' as TabId, label: 'Mon profil', icon: User },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* En-tête */}
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-12xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
                Espace Commerçant
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                <span className="truncate">
                  <span className="font-medium text-primary-600">
                    {profile?.business_name || profile?.full_name}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <a
                href="/pickup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-all font-medium whitespace-nowrap"
                aria-label="Ouvrir la station de retrait"
              >
                <Scan size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Station</span>
              </a>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all font-medium whitespace-nowrap"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <nav className="bg-white border-b border-neutral-100 shadow-soft sticky top-[70px] sm:top-[65px] z-30">
        <div className="max-w-12xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 font-semibold border-b-3 transition-all group whitespace-nowrap text-xs sm:text-base ${
                    isActive
                      ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                      : 'border-transparent text-neutral-600 hover:text-primary-500 hover:bg-neutral-50'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={16}
                    className={`sm:w-5 sm:h-5 transition-transform ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-12xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'stats' && <SalesStats />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
