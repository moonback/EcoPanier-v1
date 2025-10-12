import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';
import { ShoppingBag, History, TrendingUp, QrCode, User, LogOut } from 'lucide-react';

export const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'impact' | 'qrcode' | 'profile'>('browse');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'browse', label: 'Parcourir', icon: ShoppingBag },
    { id: 'reservations', label: 'Mes réservations', icon: History },
    { id: 'impact', label: 'Mon impact', icon: TrendingUp },
    { id: 'qrcode', label: 'Mon QR Code', icon: QrCode },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Espace Client</h1>
            <p className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              Bienvenue, <span className="font-semibold text-primary-600">{profile?.full_name}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-5 py-2.5 text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all hover-lift font-medium"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-3 transition-all group ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                      : 'border-transparent text-neutral-600 hover:text-primary-500 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={20} className={`transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'browse' && <LotBrowser />}
        {activeTab === 'reservations' && <ReservationsList />}
        {activeTab === 'impact' && <ImpactDashboard />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="animate-fade-in-up">
              <QRCodeDisplay
                value={profile?.id || ''}
                title="Votre QR Code Personnel"
              />
            </div>
          </div>
        )}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
