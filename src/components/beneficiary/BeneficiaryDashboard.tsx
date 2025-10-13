import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useSettings } from '../../contexts/SettingsContext';
import { FreeLotsList } from './FreeLotsList';
import { BeneficiaryReservations } from './BeneficiaryReservations';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';
import { Heart, History, QrCode, LogOut, AlertCircle, User } from 'lucide-react';

export const BeneficiaryDashboard = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'qrcode' | 'profile'>('browse');
  const [dailyCount, setDailyCount] = useState(0);
  const { profile, signOut } = useAuthStore();
  const { settings } = useSettings();

  const checkDailyLimit = useCallback(async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('beneficiary_daily_limits')
      .select('reservation_count')
      .eq('beneficiary_id', profile.id)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking daily limit:', error);
      return;
    }

    if (data && typeof data === 'object' && 'reservation_count' in data) {
      setDailyCount((data as { reservation_count: number }).reservation_count || 0);
    } else {
      setDailyCount(0);
    }
  }, [profile]);

  useEffect(() => {
    checkDailyLimit();
  }, [checkDailyLimit]);

  const tabs = [
    { id: 'browse', label: 'Dons Disponibles', icon: Heart },
    { id: 'reservations', label: 'Mes Réservations', icon: History },
    { id: 'qrcode', label: 'Mon QR Code', icon: QrCode },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  if (!profile?.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-black" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-4">
              Compte en attente
            </h1>
            <p className="text-gray-700 mb-6 font-light leading-relaxed">
              Votre compte doit être vérifié par un administrateur avant d'accéder aux dons gratuits.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-700 font-light mb-2">
                Votre identifiant
              </p>
              <p className="font-mono text-xl font-bold text-black">{profile?.beneficiary_id}</p>
            </div>
            <button
              onClick={signOut}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black">
                Espace Bénéficiaire
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                {profile?.full_name} • {profile?.beneficiary_id}
              </p>
            </div>
            
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
            >
              <LogOut size={18} className="inline mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>

          {/* Compteur */}
          <div className="pb-4">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-black" strokeWidth={1.5} />
                <span className="text-sm text-black font-medium">
                  Réservations aujourd'hui: {dailyCount}/{settings.maxDailyBeneficiaryReservations}
                </span>
              </div>
              {dailyCount >= settings.maxDailyBeneficiaryReservations && (
                <span className="text-xs px-2 py-1 bg-black text-white rounded-full font-medium">
                  Limite
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'browse' && (
          <FreeLotsList dailyCount={dailyCount} onReservationMade={checkDailyLimit} />
        )}
        {activeTab === 'reservations' && <BeneficiaryReservations />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <QRCodeDisplay
                value={profile?.id || ''}
                title="Votre QR Code de Bénéficiaire"
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
                  onClick={() => setActiveTab(tab.id as 'browse' | 'reservations' | 'qrcode' | 'profile')}
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
                    {tab.label.replace('Mes ', '').replace('Mon ', '').replace('Dons ', '')}
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
