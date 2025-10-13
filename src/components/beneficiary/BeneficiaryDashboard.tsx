import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useSettings } from '../../contexts/SettingsContext';
import { useMessaging } from '../../hooks/useMessaging';
import { FreeLotsList } from './FreeLotsList';
import { BeneficiaryReservations } from './BeneficiaryReservations';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';
import { MessagingPage } from '../shared/messaging';
import { Heart, History, QrCode, LogOut, AlertCircle, User, MessageCircle } from 'lucide-react';

export const BeneficiaryDashboard = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'messages' | 'qrcode' | 'profile'>('browse');
  const [dailyCount, setDailyCount] = useState(0);
  const { profile, signOut } = useAuthStore();
  const { settings } = useSettings();
  const { unreadCount } = useMessaging();

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
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
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
        <div className="max-w-12xl mx-auto px-3 sm:px-6">
          {/* Ligne principale compacte */}
          <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
                Espace Bénéficiaire
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse flex-shrink-0"></span>
                <span className="font-medium text-primary-600 truncate">
                  {profile?.full_name}
                </span>
                <span className="badge-primary text-xs px-1.5 py-0.5 leading-tight font-mono whitespace-nowrap">
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

      {/* Contenu principal avec padding bottom pour la navigation */}
      <main className="max-w-12xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
        {activeTab === 'browse' && (
          <FreeLotsList dailyCount={dailyCount} onReservationMade={checkDailyLimit} />
        )}
        {activeTab === 'reservations' && <BeneficiaryReservations />}
        {activeTab === 'messages' && <MessagingPage />}
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

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-2xl z-50">
        <div className="max-w-12xl mx-auto px-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasBadge = tab.badge && tab.badge > 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'browse' | 'reservations' | 'messages' | 'qrcode' | 'profile')}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-accent-600'
                      : 'text-neutral-500 hover:text-accent-500'
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
                    {isActive && !hasBadge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-600 rounded-full animate-pulse"></div>
                    )}
                    {hasBadge && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-accent-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1">
                        {tab.badge}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-all ${
                      isActive ? 'font-bold' : ''
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
