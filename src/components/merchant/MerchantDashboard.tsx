// Imports externes
import { useState, useCallback } from 'react';
import { Package, TrendingUp, Scan, User, ClipboardList, Plus, Gift, CheckSquare, Square, Eye, EyeOff, Wallet } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { MerchantReservations } from './MerchantReservations';
import { SalesStats } from './SalesStats';
import { ProfilePage } from '../shared/ProfilePage';
import { MerchantHeader } from './MerchantHeader';
import { MerchantWalletPage } from './WalletPage';

// Type pour les onglets
type TabId = 'lots' | 'reservations' | 'stats' | 'wallet' | 'profile';

/**
 * Dashboard principal pour les commerçants
 * Gère la navigation entre les différentes sections : gestion des lots,
 * statistiques de vente et profil
 */
export const MerchantDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('lots');
  const [createLotHandler, setCreateLotHandler] = useState<(() => void) | null>(null);
  const [makeAllFreeHandler, setMakeAllFreeHandler] = useState<(() => void) | null>(null);
  const [selectionModeHandler, setSelectionModeHandler] = useState<(() => void) | null>(null);
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [eligibleLotsCount, setEligibleLotsCount] = useState(0);
  const [toggleSoldOutHandler, setToggleSoldOutHandler] = useState<(() => void) | null>(null);
  const [soldOutCount, setSoldOutCount] = useState(0);
  const [isSoldOutHidden, setIsSoldOutHidden] = useState(true);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Callbacks pour LotManagement (doivent être définis avant le render)
  const handleCreateLotClick = useCallback((handler: () => void) => {
    setCreateLotHandler(() => handler);
  }, []);

  const handleMakeAllFreeClick = useCallback((handler: () => void, count: number) => {
    setMakeAllFreeHandler(() => handler);
    setEligibleLotsCount(count);
  }, []);

  const handleSelectionModeClick = useCallback((handler: () => void) => {
    setSelectionModeHandler(() => handler);
  }, []);

  const handleSelectionModeChange = useCallback((isActive: boolean) => {
    setIsSelectionModeActive(isActive);
  }, []);

  const handleToggleSoldOutClick = useCallback((handler: () => void, count: number, isHidden: boolean) => {
    setToggleSoldOutHandler(() => handler);
    setSoldOutCount(count);
    setIsSoldOutHidden(isHidden);
  }, []);

  

  // Configuration des onglets
  const tabs = [
    { id: 'lots' as TabId, label: 'Mes paniers', icon: Package, emoji: '📦' },
    { id: 'reservations' as TabId, label: 'Commandes', icon: ClipboardList, emoji: '📋' },
    { id: 'stats' as TabId, label: 'Stats', icon: TrendingUp, emoji: '📊' },
    { id: 'wallet' as TabId, label: 'Portefeuille', icon: Wallet, emoji: '💰' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête amélioré avec un style renforcé */}
      <MerchantHeader
        logo={
          profile?.business_logo_url ? (
            <img
              src={profile.business_logo_url}
              alt={profile.business_name || 'Logo du commerce'}
              className="w-16 h-16 rounded-3xl object-cover border-4 border-white shadow-xl transition-transform hover:scale-105"
            />
          ) : undefined
        }
        title={profile?.business_name || profile?.full_name || 'Commerçant'}
        subtitle={profile?.business_description || "Valorisez vos invendus, réduisez le gaspillage ! 💚"}
        defaultIcon="🏪"
        actions={[
          {
            label: 'Créer un panier',
            icon: Plus,
            onClick: () => {
              if (activeTab !== 'lots') {
                setActiveTab('lots');
                setTimeout(() => {
                  if (createLotHandler) createLotHandler();
                }, 100);
              } else if (createLotHandler) {
                createLotHandler();
              }
            },
            variant: 'primary' as const,
            mobileLabel: 'Créer',
          },
          {
            label: 'Station Retrait',
            icon: Scan,
            onClick: () => window.open('/pickup', '_blank'),
            variant: 'secondary' as const,
            mobileLabel: 'Station',
          },
          ...(selectionModeHandler
            ? [
                {
                  label: isSelectionModeActive ? 'Mode sélection' : 'Sélectionner',
                  icon: isSelectionModeActive ? CheckSquare : Square,
                  onClick: () => {
                    if (activeTab !== 'lots') {
                      setActiveTab('lots');
                      setTimeout(() => {
                        if (selectionModeHandler) selectionModeHandler();
                      }, 100);
                    } else if (selectionModeHandler) {
                      selectionModeHandler();
                    }
                  },
                  variant: (isSelectionModeActive ? 'primary' : 'secondary') as 'primary' | 'secondary',
                  mobileLabel: isSelectionModeActive ? 'Mode' : 'Sélectionner',
                },
              ]
            : []),
          ...(eligibleLotsCount > 0 && makeAllFreeHandler
            ? [
                {
                  label: `Tout passer en don (${eligibleLotsCount})`,
                  icon: Gift,
                  onClick: () => {
                    if (activeTab !== 'lots') {
                      setActiveTab('lots');
                      setTimeout(() => {
                        if (makeAllFreeHandler) makeAllFreeHandler();
                      }, 100);
                    } else if (makeAllFreeHandler) {
                      makeAllFreeHandler();
                    }
                  },
                  variant: 'secondary' as const,
                  mobileLabel: `Don (${eligibleLotsCount})`,
                },
              ]
            : []),
          ...(toggleSoldOutHandler && soldOutCount > 0 && activeTab === 'lots'
            ? [
                {
                  label: isSoldOutHidden
                    ? `Afficher épuisés (${soldOutCount})`
                    : `Masquer épuisés (${soldOutCount})`,
                  icon: isSoldOutHidden ? Eye : EyeOff,
                  onClick: () => {
                    if (toggleSoldOutHandler) toggleSoldOutHandler();
                  },
                  variant: 'secondary' as const,
                  mobileLabel: isSoldOutHidden
                    ? `Afficher (${soldOutCount})`
                    : `Masquer (${soldOutCount})`,
                },
              ]
            : []),
        ]}
      />

      {/* Contenu principal avec animation et responsive */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 transition-all">
        <div className="rounded-3xl shadow-md bg-white p-4 sm:p-8 min-h-[400px]">
          {activeTab === 'lots' && (
            <LotManagement
              onCreateLotClick={handleCreateLotClick}
              onMakeAllFreeClick={handleMakeAllFreeClick}
              onSelectionModeClick={handleSelectionModeClick}
              onSelectionModeChange={handleSelectionModeChange}
              onToggleSoldOutClick={handleToggleSoldOutClick}
            />
          )}
          {activeTab === 'reservations' && <MerchantReservations />}
          {/* {activeTab === 'missions' && <MissionsManagement />} Temporairement désactivé */}
          {activeTab === 'stats' && <SalesStats />}
          {activeTab === 'wallet' && <MerchantWalletPage />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>

      {/* Barre de navigation stylisée en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 px-2 py-3 flex-1 transition-all
                    ${isActive ? 'text-secondary-700 font-semibold scale-105' : 'text-gray-500 hover:text-secondary-500'} group`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-b-full animate-fade-in" />
                  )}
                  <div className={`transition-transform group-hover:scale-110 ${isActive ? 'scale-125' : ''}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                  </div>
                  <span className={`text-[11px] transition-all ${isActive ? 'font-bold' : 'font-normal'} tracking-wide`}>
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
