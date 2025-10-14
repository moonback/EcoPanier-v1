// Imports externes
import { useState } from 'react';
import { Package, TrendingUp, LogOut, Scan, User, ClipboardList, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { MerchantReservations } from './MerchantReservations';
import { SalesStats } from './SalesStats';
import { ProfilePage } from '../shared/ProfilePage';

// Type pour les onglets
type TabId = 'lots' | 'reservations' | 'stats' | 'profile';

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
    { id: 'lots' as TabId, label: 'Mes paniers', icon: Package, emoji: '📦' },
    { id: 'reservations' as TabId, label: 'Commandes', icon: ClipboardList, emoji: '📋' },
    { id: 'stats' as TabId, label: 'Stats', icon: TrendingUp, emoji: '📊' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-12xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo du commerce */}
              {profile?.business_logo_url ? (
                <div className="flex-shrink-0">
                  <img
                    src={profile.business_logo_url}
                    alt={profile.business_name || 'Logo du commerce'}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏪</span>
                </div>
              )}
              
              {/* Informations du commerce */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-black truncate">
                  {profile?.business_name || profile?.full_name}
                </h1>
                <p className="text-sm text-gray-600 font-light mt-0.5">
                  Valorisez vos invendus, réduisez le gaspillage ! 💚
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/quick-add-product"
                className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <Zap size={18} className="inline mr-2" strokeWidth={2} />
                <span className="hidden sm:inline">Ajout Rapide</span>
              </Link>
              <a
                href="/pickup"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <Scan size={18} className="inline mr-2" strokeWidth={2} />
                <span className="hidden sm:inline">Station Retrait</span>
              </a>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
              >
                <LogOut size={18} className="inline mr-2" strokeWidth={1.5} />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-12xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'reservations' && <MerchantReservations />}
        {activeTab === 'stats' && <SalesStats />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-secondary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-b-full" />
                  )}
                  <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={`text-[10px] transition-all ${
                      isActive ? 'font-bold' : 'font-light'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
