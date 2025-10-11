import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { LotBrowser } from './LotBrowser';
import { ReservationsList } from './ReservationsList';
import { ImpactDashboard } from './ImpactDashboard';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ShoppingBag, History, TrendingUp, QrCode, LogOut } from 'lucide-react';

export const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'impact' | 'qrcode'>('browse');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'browse', label: 'Parcourir', icon: ShoppingBag },
    { id: 'reservations', label: 'Mes réservations', icon: History },
    { id: 'impact', label: 'Mon impact', icon: TrendingUp },
    { id: 'qrcode', label: 'Mon QR Code', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Espace Client</h1>
            <p className="text-sm text-gray-600">Bienvenue, {profile?.full_name}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} />
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
            <QRCodeDisplay
              value={profile?.id || ''}
              title="Votre QR Code Personnel"
            />
          </div>
        )}
      </main>
    </div>
  );
};
