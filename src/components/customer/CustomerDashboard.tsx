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
    { id: 'browse' as TabId, label: 'Parcourir', icon: ShoppingBag },
    { id: 'map' as TabId, label: 'Carte', icon: MapPin },
    { id: 'reservations' as TabId, label: 'Mes réservations', icon: History },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp },
    { id: 'qrcode' as TabId, label: 'Mon QR Code', icon: QrCode },
    { id: 'profile' as TabId, label: 'Mon profil', icon: User },
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
                Espace Client
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                {profile?.full_name}
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
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span
                    className={`text-[10px] transition-all ${
                      isActive ? 'font-semibold' : 'font-light'
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
