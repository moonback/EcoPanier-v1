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
    { id: 'browse', label: 'Paniers Gratuits', icon: Heart, emoji: '🎁' },
    { id: 'reservations', label: 'Mes Paniers', icon: History, emoji: '📦' },
    { id: 'qrcode', label: 'QR Code', icon: QrCode, emoji: '📱' },
    { id: 'profile', label: 'Profil', icon: User, emoji: '👤' },
  ];

  if (!profile?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-warning-100 to-warning-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <AlertCircle size={36} className="text-warning-600" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-3">
              ⏳ Compte en cours de vérification
            </h1>
            <p className="text-gray-700 mb-6 font-light leading-relaxed">
              Votre compte est en attente de validation par notre équipe. 
              Vous pourrez bientôt accéder aux paniers solidaires gratuits ! 💚
            </p>
            <div className="p-5 bg-gradient-to-r from-accent-50 to-pink-50 rounded-xl mb-6 border-2 border-accent-100">
              <p className="text-xs text-gray-600 font-semibold mb-2">
                🎫 Votre identifiant bénéficiaire
              </p>
              <p className="font-mono text-2xl font-bold text-accent-700">{profile?.beneficiary_id}</p>
            </div>
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">
                💡 La vérification prend généralement moins de 24 heures
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-lg"
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
                ❤️ Bienvenue {profile?.full_name?.split(' ')[0] || 'Bénéficiaire'} !
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                Découvrez vos paniers solidaires gratuits 🎁
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
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-accent-50 to-pink-50 rounded-xl border-2 border-accent-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Heart size={16} className="text-accent-600" strokeWidth={2} />
                </div>
                <div>
                  <span className="text-sm text-accent-900 font-semibold block">
                    Aujourd'hui : {dailyCount}/{settings.maxDailyBeneficiaryReservations} paniers
                  </span>
                  <span className="text-xs text-accent-700">
                    {dailyCount < settings.maxDailyBeneficiaryReservations 
                      ? `Encore ${settings.maxDailyBeneficiaryReservations - dailyCount} disponible${settings.maxDailyBeneficiaryReservations - dailyCount > 1 ? 's' : ''} !` 
                      : 'Revenez demain 🌅'}
                  </span>
                </div>
              </div>
              {dailyCount >= settings.maxDailyBeneficiaryReservations && (
                <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full font-semibold shadow-sm">
                  ✓ Complet
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
                  className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-accent-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-b-full" />
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
