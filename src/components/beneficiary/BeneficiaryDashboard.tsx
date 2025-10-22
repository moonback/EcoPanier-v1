// Imports externes
import { useState, useEffect, useCallback } from 'react';
import { Heart, History, QrCode, AlertCircle, User, Home } from 'lucide-react';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useSettings } from '../../contexts/SettingsContext';
import { FreeLotsList } from './FreeLotsList';
import { BeneficiaryReservations } from './BeneficiaryReservations';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { ProfilePage } from '../shared/ProfilePage';
import { DashboardHeader } from '../shared/DashboardHeader';
import { BeneficiaryDailyLimit } from './BeneficiaryDailyLimit';
import { BeneficiaryActiveReservation } from './BeneficiaryActiveReservation';
import { BeneficiaryCallToAction } from './BeneficiaryCallToAction';
import { BeneficiaryHistory } from './BeneficiaryHistory';

// Imports types
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

type TabId = 'home' | 'browse' | 'reservations' | 'qrcode' | 'profile';

/**
 * Dashboard principal pour les bénéficiaires
 * Interface ultra-simple et accessible (Mode Kiosque)
 * Focus sur la limite journalière et l'action prioritaire
 */
export const BeneficiaryDashboard = () => {
  // État local
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [dailyCount, setDailyCount] = useState(0);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  // Hooks (stores, contexts, router)
  const { profile, signOut } = useAuthStore();
  const { settings } = useSettings();

  // Fonction pour vérifier la limite journalière
  const checkDailyLimit = useCallback(async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];

    try {
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
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  }, [profile]);

  // Fonction pour récupérer la réservation active
  const fetchActiveReservation = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active reservation:', error);
        return;
      }

      setActiveReservation(data as Reservation | null);
    } catch (error) {
      console.error('Error fetching active reservation:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Effets
  useEffect(() => {
    checkDailyLimit();
    fetchActiveReservation();
  }, [checkDailyLimit, fetchActiveReservation]);

  // Configuration des onglets
  const tabs = [
    { id: 'home' as TabId, label: 'Accueil', icon: Home, emoji: '🏠' },
    { id: 'browse' as TabId, label: 'Paniers', icon: Heart, emoji: '🎁' },
    { id: 'reservations' as TabId, label: 'Mes Paniers', icon: History, emoji: '📦' },
    { id: 'qrcode' as TabId, label: 'QR Code', icon: QrCode, emoji: '📱' },
    { id: 'profile' as TabId, label: 'Profil', icon: User, emoji: '👤' },
  ];

  // Fonction de rafraîchissement après réservation
  const handleReservationMade = () => {
    checkDailyLimit();
    fetchActiveReservation();
  };

  // Render de l'onglet Home (Dashboard avec widgets)
  const renderHomeTab = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
        {/* Widget 1 : Compteur Journalier (PRIORITÉ ABSOLUE) */}
        <BeneficiaryDailyLimit count={dailyCount} maxCount={settings.maxDailyBeneficiaryReservations} />

        {/* Widget 2 : Réservation Active (si elle existe) */}
        {activeReservation && (
          <BeneficiaryActiveReservation reservation={activeReservation} />
        )}

        {/* Widget 3 : Action Principale (si < 2 et pas de réservation active) */}
        <BeneficiaryCallToAction
          count={dailyCount}
          maxCount={settings.maxDailyBeneficiaryReservations}
          hasActiveReservation={!!activeReservation}
          onNavigateToBrowse={() => setActiveTab('browse')}
        />

        {/* Widget 4 : Historique Simplifié */}
        <BeneficiaryHistory onNavigateToReservations={() => setActiveTab('reservations')} />
      </div>
    );
  };

  // Early returns (conditions de sortie)
  
  // État de vérification du compte
  if (!profile?.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-warning-100 to-warning-200 rounded-full mx-auto mb-6 shadow-md">
              <AlertCircle size={36} className="text-warning-600" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-3">
              ⏳ Compte en cours de vérification
            </h1>
            <p className="text-gray-700 mb-6 font-light leading-relaxed">
              Votre compte est en attente de validation par notre équipe. 
              Vous pourrez bientôt accéder aux paniers solidaires ! 💚
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

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <DashboardHeader
        title={`❤️ Bienvenue ${profile?.full_name?.split(' ')[0] || 'Bénéficiaire'} !`}
        subtitle="Paniers solidaires gratuits 🎁"
        defaultIcon="🤝"
      />

      {/* Contenu principal */}
      <main className="w-full pb-24">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'browse' && (
          <div className="max-w-12xl mx-auto px-6 py-6">
            <FreeLotsList dailyCount={dailyCount} onReservationMade={handleReservationMade} />
          </div>
        )}
        {activeTab === 'reservations' && (
          <div className="max-w-12xl mx-auto px-6 py-6">
            <BeneficiaryReservations />
          </div>
        )}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center p-6">
            <div className="w-full max-w-sm">
              <QRCodeDisplay
                value={profile?.id || ''}
                title="Votre QR Code de Bénéficiaire"
              />
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="max-w-12xl mx-auto px-6 py-6">
            <ProfilePage />
          </div>
        )}
      </main>

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
