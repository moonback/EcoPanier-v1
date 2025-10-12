// Imports externes
import { useState } from 'react';
import {
  ShoppingBag,
  History,
  TrendingUp,
  QrCode,
  User,
  LogOut,
} from 'lucide-react';

// Imports internes
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';

// Type pour les onglets
type TabId = 'browse' | 'reservations' | 'impact' | 'qrcode' | 'profile';

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
    { id: 'reservations' as TabId, label: 'Mes réservations', icon: History },
    { id: 'impact' as TabId, label: 'Mon impact', icon: TrendingUp },
    { id: 'qrcode' as TabId, label: 'Mon QR Code', icon: QrCode },
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
                Espace Client
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                <span className="truncate">
                  <span className="font-medium text-primary-600">
                    {profile?.full_name}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all font-medium whitespace-nowrap flex-shrink-0"
              aria-label="Se déconnecter"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding bottom pour la navigation */}
      <main className="max-w-12xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
        {activeTab === 'browse' && <LotBrowser />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="animate-fade-in-up w-full max-w-sm">
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
