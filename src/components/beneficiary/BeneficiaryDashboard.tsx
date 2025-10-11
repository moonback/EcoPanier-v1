import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { FreeLotsList } from './FreeLotsList';
import { BeneficiaryReservations } from './BeneficiaryReservations';
import { QRCodeDisplay } from '../shared/QRCodeDisplay';
import { Heart, History, QrCode, LogOut, AlertCircle } from 'lucide-react';

export const BeneficiaryDashboard = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'qrcode'>('browse');
  const [dailyCount, setDailyCount] = useState(0);
  const { profile, signOut } = useAuthStore();

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
  ];

  if (!profile?.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <AlertCircle size={64} className="text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Compte en attente de vérification
            </h1>
            <p className="text-gray-600 mb-6">
              Votre compte bénéficiaire doit être vérifié par un administrateur avant de pouvoir
              accéder aux dons gratuits.
            </p>
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Votre identifiant:</strong>
                <br />
                <span className="font-mono text-lg">{profile.beneficiary_id}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Espace Bénéficiaire</h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {profile?.full_name} ({profile?.beneficiary_id})
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Réservations aujourd'hui:</strong> {dailyCount} / 2
              {dailyCount >= 2 && (
                <span className="ml-2 text-red-600 font-semibold">
                  (Limite atteinte)
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-pink-600 text-pink-600'
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
        {activeTab === 'browse' && (
          <FreeLotsList dailyCount={dailyCount} onReservationMade={checkDailyLimit} />
        )}
        {activeTab === 'reservations' && <BeneficiaryReservations />}
        {activeTab === 'qrcode' && (
          <div className="flex justify-center">
            <QRCodeDisplay
              value={profile?.id || ''}
              title="Votre QR Code de Bénéficiaire"
            />
          </div>
        )}
      </main>
    </div>
  );
};
