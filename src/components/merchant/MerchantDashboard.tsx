// Imports externes
import { useState } from 'react';
import { Package, TrendingUp, LogOut, Scan, User, ClipboardList } from 'lucide-react';

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
    { id: 'lots' as TabId, label: 'Mes invendus', icon: Package },
    { id: 'reservations' as TabId, label: 'Réservations', icon: ClipboardList },
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
            {/* Bloc titre + identité commerçant */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight truncate flex items-center gap-2">
                <Package className="hidden sm:inline text-primary-500" size={26} aria-hidden />
                Espace commerçant
              </h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse shadow-success-300 shadow"/>
                <span className="truncate flex items-baseline gap-1">
                  <span className="font-semibold text-primary-700">
                    {profile?.business_name || profile?.full_name || 'Commerçant'}
                  </span>
                  {profile?.business_name && (
                    <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 font-semibold text-[10px] uppercase ml-1">
                      {profile?.full_name}
                    </span>
                  )}
                </span>
              </div>
            </div>
            {/* Actions principales */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <a
                href="/pickup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg transition-all font-semibold whitespace-nowrap shadow hover:shadow-lg"
                aria-label="Ouvrir la station de retrait"
                tabIndex={0}
              >
                <Scan size={18} className="sm:w-[20px] sm:h-[20px]" />
                <span className="hidden sm:inline">Station</span>
              </a>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-200"
                aria-label="Se déconnecter"
                tabIndex={0}
              >
                <LogOut size={18} className="sm:w-[20px] sm:h-[20px]" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding bottom pour la navigation */}
      <main className="max-w-12xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'reservations' && <MerchantReservations />}
        {activeTab === 'stats' && <SalesStats />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50">
        <div className="max-w-12xl mx-auto px-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-neutral-500 hover:text-primary-500'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      className={`transition-transform ${
                        isActive ? 'scale-110' : ''
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-all ${
                      isActive ? 'font-bold' : ''
                    }`}
                  >
                    {tab.label.replace('Mes ', '').replace('Mon ', '')}
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
