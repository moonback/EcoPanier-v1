import { useState, useEffect } from 'react';
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

  useEffect(() => {
    checkDailyLimit();
  }, []);

  const checkDailyLimit = async () => {
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

    setDailyCount(data?.reservation_count || 0);
  };

  const tabs = [
    { id: 'browse', label: 'Dons Disponibles', icon: Heart },
    { id: 'reservations', label: 'Mes Réservations', icon: History },
    { id: 'qrcode', label: 'Mon QR Code', icon: QrCode },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  if (!profile?.verified) {
    return (
      <div className="min-h-screen section-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 animate-fade-in-up">
          <div className="text-center">
            <AlertCircle size={64} className="text-warning-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Compte en attente de vérification
            </h1>
            <p className="text-neutral-600 mb-6 font-medium">
              Votre compte bénéficiaire doit être vérifié par un administrateur avant de pouvoir
              accéder aux dons gratuits.
            </p>
            <div className="p-4 bg-primary-50 rounded-xl mb-6 border-2 border-primary-200">
              <p className="text-sm text-primary-800 font-semibold">
                <strong>Votre identifiant:</strong>
                <br />
                <span className="font-mono text-lg">{profile.beneficiary_id}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="btn-secondary w-full rounded-xl"
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
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Espace Bénéficiaire</h1>
              <p className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                Bienvenue, <span className="font-semibold text-primary-600">{profile?.full_name}</span>
                <span className="badge-primary text-xs">{profile?.beneficiary_id}</span>
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

          <div className="mt-4 p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
            <p className="text-sm text-primary-800 font-semibold">
              <strong>Réservations aujourd'hui:</strong> {dailyCount} / {settings.maxDailyBeneficiaryReservations}
              {dailyCount >= settings.maxDailyBeneficiaryReservations && (
                <span className="ml-2 badge-accent">
                  Limite atteinte
                </span>
              )}
            </p>
          </div>
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
                      ? 'border-accent-600 text-accent-600 bg-accent-50/50'
                      : 'border-transparent text-neutral-600 hover:text-accent-500 hover:bg-neutral-50'
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
        {activeTab === 'browse' && (
          <FreeLotsList dailyCount={dailyCount} onReservationMade={checkDailyLimit} />
        )}
        {activeTab === 'reservations' && <BeneficiaryReservations />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <div className="animate-fade-in-up">
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
