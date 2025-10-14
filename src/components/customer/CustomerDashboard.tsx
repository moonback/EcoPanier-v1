// Imports externes
import { useState } from 'react';
import {
  ShoppingBag,
  History,
  TrendingUp,
  QrCode,
  User,
  LogOut,
  MapPin,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';
import { InteractiveMap } from './InteractiveMap';

// Type pour les onglets
type TabId = 'browse' | 'map' | 'reservations' | 'impact' | 'qrcode' | 'profile';

/**
 * Dashboard principal pour les clients
 * Gère la navigation entre les différentes sections : parcourir les lots,
 * gérer les réservations, voir l'impact, QR code personnel et profil
 */
export const CustomerDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('browse');

  // Hooks (stores, contexts, router)
  const { profile, signOut } = useAuthStore();

  // Configuration des onglets
  const tabs = [
    { id: 'browse' as TabId, label: 'Découvrir', icon: ShoppingBag, emoji: '🛒' },
    { id: 'map' as TabId, label: 'Carte', icon: MapPin, emoji: '🗺️' },
    { id: 'reservations' as TabId, label: 'Mes paniers', icon: History, emoji: '📦' },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp, emoji: '🌍' },
    { id: 'qrcode' as TabId, label: 'QR Code', icon: QrCode, emoji: '📱' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black">
                👋 Bonjour {profile?.full_name?.split(' ')[0] || 'Client'} !
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                Prêt à sauver des paniers aujourd'hui ?
              </p>
            </div>

            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} className="inline mr-2" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'browse' && <LotBrowser />}
        {activeTab === 'map' && <InteractiveMap />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <QRCodeDisplay
                value={profile?.id || ''}
                title="Votre QR Code Personnel"
              />
            </div>
          </div>
        )}
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
