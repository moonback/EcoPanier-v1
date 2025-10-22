// Imports externes
import { useState } from 'react';
import {
  ShoppingBag,
  History,
  TrendingUp,
  User,
  MapPin,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { ProfilePage } from '../shared/ProfilePage';
import { InteractiveMap } from './InteractiveMap';
import { DashboardHeader } from '../shared/DashboardHeader';
import { CustomerImpactStats } from './CustomerImpactStats';
import { CustomerActiveReservation } from './CustomerActiveReservation';
import { CustomerActions } from './CustomerActions';
import { CustomerReservationHistory } from './CustomerReservationHistory';

import EcoPanierLogo from '/logo.png'; // Import du logo

// Type pour les onglets
type TabId = 'home' | 'browse' | 'map' | 'reservations' | 'impact' | 'profile';

/**
 * Dashboard principal pour les clients
 * Interface moderne avec widgets et navigation par onglets
 * Affiche les informations prioritaires : réservations actives, impact, actions
 */
export const CustomerDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Configuration des onglets
  const tabs = [
    { id: 'home' as TabId, label: 'Accueil', icon: ShoppingBag, emoji: '🏠' },
    { id: 'map' as TabId, label: 'Carte', icon: MapPin, emoji: '🗺️' },
    { id: 'reservations' as TabId, label: 'Mes paniers', icon: History, emoji: '📦' },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp, emoji: '🌍' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render de l'onglet Home (Dashboard avec widgets)
  const renderHomeTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
        {/* Widget 1 : Réservation Active (Urgent) - Pleine largeur */}
        <div className="lg:col-span-3">
          <CustomerActiveReservation onNavigateToBrowse={() => setActiveTab('browse')} />
        </div>

        {/* Widget 2 : Impact Personnel (Stats) - 2 colonnes */}
        <div className="lg:col-span-2">
          <CustomerImpactStats />
        </div>

        {/* Widget 3 : Actions (CTA) - 1 colonne */}
        <div className="lg:col-span-1">
          <CustomerActions
            onNavigateToBrowse={() => setActiveTab('browse')}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToReservations={() => setActiveTab('reservations')}
            onNavigateToImpact={() => setActiveTab('impact')}
          />
        </div>

        {/* Widget 4 : Historique - Pleine largeur */}
        <div className="lg:col-span-3">
          <CustomerReservationHistory onNavigateToReservations={() => setActiveTab('reservations')} />
        </div>
      </div>
    );
  };

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <DashboardHeader
        logo={<img src={EcoPanierLogo} alt="EcoPanier Logo" className="h-10 w-auto" />}
        title={`Bonjour ${profile?.full_name || 'Client'} !`}
        subtitle="Prêt à sauver des paniers aujourd'hui ?"
        defaultIcon="🛒"
      />

      {/* Contenu principal */}
      <main className="w-full pb-24">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'browse' && <LotBrowser />}
        {activeTab === 'map' && <InteractiveMap />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="max-w-12xl mx-auto">
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
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-b-full" />
                  )}
                  <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={`text-xs transition-all ${
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
