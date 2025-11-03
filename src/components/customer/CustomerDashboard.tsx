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
import { ChatWidget } from '../shared/ChatWidget';

import EcoPanierLogo from '/logo.png'; // Import du logo

// Type pour les onglets
type TabId = 'browse' | 'map' | 'reservations' | 'impact' | 'profile';

/**
 * Dashboard principal pour les clients
 * Gère la navigation entre les différentes sections : parcourir les lots,
 * gérer les réservations, voir l'impact et profil
 */
export const CustomerDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('browse');
  const [chatWithMerchant, setChatWithMerchant] = useState<{ id: string; name: string } | null>(null);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // Configuration des onglets
  const tabs = [
    { id: 'browse' as TabId, label: 'Découvrir', icon: ShoppingBag, emoji: '🛒' },
    { id: 'map' as TabId, label: 'Carte', icon: MapPin, emoji: '🗺️' },
    { id: 'reservations' as TabId, label: 'Mes paniers', icon: History, emoji: '📦' },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp, emoji: '🌍' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

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
        {activeTab === 'browse' && <LotBrowser onContactMerchant={setChatWithMerchant} />}
        {activeTab === 'map' && <InteractiveMap onContactMerchant={setChatWithMerchant} />}
        {activeTab === 'reservations' && <ReservationsList onContactMerchant={setChatWithMerchant} />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Chat Widget (flottant) */}
      {chatWithMerchant && (
        <ChatWidget
          recipientId={chatWithMerchant.id}
          recipientName={chatWithMerchant.name}
          onClose={() => setChatWithMerchant(null)}
          defaultOpen={true}
        />
      )}

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
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-semibold">{tab.emoji} {tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
