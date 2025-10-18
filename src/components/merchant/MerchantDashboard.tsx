// Imports externes
import { useState } from 'react';
import { Package, TrendingUp, Scan, User, ClipboardList, Truck } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { MerchantReservations } from './MerchantReservations';
import { SalesStats } from './SalesStats';
import { MissionsManagement } from './MissionsManagement';
import { ProfilePage } from '../shared/ProfilePage';
import { DashboardHeader } from '../shared/DashboardHeader';

// Type pour les onglets
type TabId = 'lots' | 'reservations' | 'missions' | 'stats' | 'profile';

/**
 * Dashboard principal pour les commerçants
 * Gère la navigation entre les différentes sections : gestion des lots,
 * statistiques de vente et profil
 */
export const MerchantDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('lots');

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Configuration des onglets
  const tabs = [
    { id: 'lots' as TabId, label: 'Mes paniers', icon: Package, emoji: '📦' },
    { id: 'reservations' as TabId, label: 'Commandes', icon: ClipboardList, emoji: '📋' },
    { id: 'missions' as TabId, label: 'Missions', icon: Truck, emoji: '🚚' },
    { id: 'stats' as TabId, label: 'Stats', icon: TrendingUp, emoji: '📊' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <DashboardHeader
        logo={
          profile?.business_logo_url ? (
            <img
              src={profile.business_logo_url}
              alt={profile.business_name || 'Logo du commerce'}
              className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-md"
            />
          ) : undefined
        }
        title={profile?.business_name || profile?.full_name || 'Commerçant'}
        subtitle="Valorisez vos invendus, réduisez le gaspillage ! 💚"
        defaultIcon="🏪"
        actions={[
          {
            label: 'Station Retrait',
            icon: Scan,
            onClick: () => window.open('/pickup', '_blank'),
            variant: 'secondary',
            mobileLabel: 'Station',
          },
        ]}
      />

      {/* Contenu principal */}
      <main className="max-w-12xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'reservations' && <MerchantReservations />}
        {activeTab === 'missions' && <MissionsManagement />}
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
