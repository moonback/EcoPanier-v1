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
      <div className="min-h-screen section-gradient flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full card p-6 sm:p-8 animate-fade-in-up">
          <div className="text-center">
            <AlertCircle size={48} className="sm:w-16 sm:h-16 text-warning-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
              Compte en attente de vérification
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mb-6 font-medium leading-relaxed">
              Votre compte bénéficiaire doit être vérifié par un administrateur avant de pouvoir
              accéder aux dons gratuits.
            </p>
            <div className="p-4 sm:p-5 bg-primary-50 rounded-xl mb-6 border-2 border-primary-200">
              <p className="text-xs sm:text-sm text-primary-800 font-semibold">
                <strong className="block mb-2">Votre identifiant:</strong>
                <span className="font-mono text-lg sm:text-xl font-bold">{profile?.beneficiary_id}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="btn-secondary w-full rounded-xl py-3 text-sm sm:text-base font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Ligne principale compacte */}
          <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
                Espace Bénéficiaire
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                <span className="truncate">
                  <span className="font-medium text-primary-600">{profile?.full_name}</span>
                </span>
                <span className="hidden sm:inline text-xs text-neutral-400">•</span>
                <span className="hidden sm:inline badge-primary text-xs px-1.5 py-0.5 leading-tight">
                  {profile?.beneficiary_id}
                </span>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all font-medium whitespace-nowrap flex-shrink-0"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>

          {/* Compteur de réservations compact */}
          <div className="pb-2.5 sm:pb-3">
            <div className="flex items-center justify-between px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-primary-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-primary-800 font-semibold">
                  <span className="hidden sm:inline">Réservations aujourd'hui: </span>
                  <span className="sm:hidden">Aujourd'hui: </span>
                  <span className="font-bold text-primary-700">{dailyCount}/{settings.maxDailyBeneficiaryReservations}</span>
                </span>
              </div>
              {dailyCount >= settings.maxDailyBeneficiaryReservations && (
                <span className="badge-accent text-xs px-2 py-0.5 leading-tight flex-shrink-0">
                  Limite
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-100 shadow-soft sticky top-[110px] sm:top-[95px] z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'browse' | 'reservations' | 'qrcode' | 'profile')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 font-semibold border-b-3 transition-all group whitespace-nowrap text-xs sm:text-base ${
                    activeTab === tab.id
                      ? 'border-accent-600 text-accent-600 bg-accent-50/50'
                      : 'border-transparent text-neutral-600 hover:text-accent-500 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={16} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'browse' && (
          <FreeLotsList dailyCount={dailyCount} onReservationMade={checkDailyLimit} />
        )}
        {activeTab === 'reservations' && <BeneficiaryReservations />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="animate-fade-in-up w-full max-w-sm">
              <QRCodeDisplay
                value={profile?.id || ''}
                title="Votre QR Code de Bénéficiaire"
              />
            </div>
          </div>
        )}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
