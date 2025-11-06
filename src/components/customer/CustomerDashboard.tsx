// Imports externes
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  History,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { CustomerProfilePage } from './CustomerProfilePage';
import { WalletPage } from './WalletPage';
import { CustomerHeader } from './CustomerHeader';

import EcoPanierLogo from '/logo.png'; // Import du logo

// Type pour les onglets
type TabId = 'browse' | 'reservations' | 'impact' | 'wallet' | 'profile';

/**
 * Dashboard principal pour les clients
 * Gère la navigation entre les différentes sections : parcourir les lots,
 * gérer les réservations, voir l'impact et profil
 */
export const CustomerDashboard = () => {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // État local
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Lire le paramètre 'tab' de l'URL ou utiliser 'browse' par défaut
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const validTabs: TabId[] = ['browse', 'reservations', 'impact', 'wallet', 'profile'];
  const initialTab: TabId = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'browse';
  
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Synchroniser l'état avec l'URL quand elle change
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  // Mettre à jour l'URL quand l'onglet change
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Configuration des onglets
  const tabs = [
    { id: 'browse' as TabId, label: 'Découvrir', icon: ShoppingBag, emoji: '🛒' },
    { id: 'reservations' as TabId, label: 'Mes paniers', icon: History, emoji: '📦' },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp, emoji: '🌍' },
    { id: 'wallet' as TabId, label: 'Portefeuille', icon: Wallet, emoji: '💳' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête amélioré */}
      <CustomerHeader
        logo={<img src={EcoPanierLogo} alt="EcoPanier Logo" className="h-10 " />}
        title={`Bonjour ${profile?.full_name || 'Client'} !`}
        subtitle="Prêt à sauver des paniers aujourd'hui ?"
        defaultIcon="🛒"
        showStats={true}
        showFilters={activeTab === 'browse'}
        onOpenFilters={() => setShowFilterSidebar(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Contenu principal */}
      <main className="w-full pb-24">
        {activeTab === 'browse' && (
          <LotBrowser 
            showFilterSidebar={showFilterSidebar}
            setShowFilterSidebar={setShowFilterSidebar}
            onFiltersCountChange={setActiveFiltersCount}
          />
        )}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'profile' && <CustomerProfilePage />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
        <div className="mx-auto max-w-12xl">
          <div className="flex justify-between items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center flex-1 gap-0.5 p-2 transition-all relative ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                  )}
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.3} />
                  <span className={`text-[11px] leading-tight transition-all ${isActive ? 'font-bold' : 'font-light'}`}>
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
