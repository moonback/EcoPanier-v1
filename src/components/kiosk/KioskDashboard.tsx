import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useSettings } from '../../contexts/SettingsContext';
import { KioskLotsList } from './KioskLotsList';
import { KioskReservations } from './KioskReservations';
import { KioskHistory } from './KioskHistory';
import { Heart, Package, History } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskDashboardProps {
  profile: Profile;
  onActivity: () => void;
}

export const KioskDashboard = ({ profile, onActivity }: KioskDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'reservations' | 'history'>('browse');
  const [dailyCount, setDailyCount] = useState(0);
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

  const handleTabChange = (tab: 'browse' | 'reservations' | 'history') => {
    setActiveTab(tab);
    onActivity();
  };

  return (
    <div className="min-h-screen pb-2">
      {/* Barre d'information */}
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="card p-3 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart size={20} className="text-accent-600" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-black leading-tight truncate">
                  Bonjour {profile.full_name?.split(' ')[0] || 'Bénéficiaire'} ! 👋
                </h2>
                <p className="text-xs text-gray-600 font-light leading-tight truncate">
                  ID: <span className="font-mono font-bold text-accent-700">{profile.beneficiary_id}</span>
                </p>
              </div>
            </div>

            {/* Compteur quotidien */}
            <div className="badge-accent rounded-lg p-2 border border-accent-200 shadow-soft flex-shrink-0">
              <p className="text-xs font-semibold text-accent-800 leading-tight">Aujourd'hui</p>
              <p className="text-2xl font-bold text-accent-700 leading-tight">
                {dailyCount}<span className="text-base">/{settings.maxDailyBeneficiaryReservations}</span>
              </p>
              <p className="text-xs text-accent-700 font-medium leading-tight">
                {dailyCount < settings.maxDailyBeneficiaryReservations
                  ? `+${settings.maxDailyBeneficiaryReservations - dailyCount} dispo`
                  : 'Complet ✓'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="max-w-7xl mx-auto px-3 mb-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => handleTabChange('browse')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all shadow-soft hover:shadow-soft-md border flex items-center justify-center gap-1 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white border-accent-700'
                : 'bg-white text-gray-700 border-gray-200 hover:border-accent-300'
            }`}
          >
            <Heart size={14} strokeWidth={2} />
            <span>Paniers</span>
          </button>

          <button
            onClick={() => handleTabChange('reservations')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all shadow-soft hover:shadow-soft-md border flex items-center justify-center gap-1 ${
              activeTab === 'reservations'
                ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white border-accent-700'
                : 'bg-white text-gray-700 border-gray-200 hover:border-accent-300'
            }`}
          >
            <Package size={14} strokeWidth={2} />
            <span>Actifs</span>
          </button>

          <button
            onClick={() => handleTabChange('history')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all shadow-soft hover:shadow-soft-md border flex items-center justify-center gap-1 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white border-accent-700'
                : 'bg-white text-gray-700 border-gray-200 hover:border-accent-300'
            }`}
          >
            <History size={14} strokeWidth={2} />
            <span>Historique</span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-3">
        {activeTab === 'browse' && (
          <KioskLotsList 
            profile={profile} 
            dailyCount={dailyCount} 
            onReservationMade={checkDailyLimit}
            onActivity={onActivity}
          />
        )}
        {activeTab === 'reservations' && (
          <KioskReservations 
            profile={profile}
            onActivity={onActivity}
            showOnlyPending={true}
          />
        )}
        {activeTab === 'history' && (
          <KioskHistory 
            profile={profile}
            onActivity={onActivity}
          />
        )}
      </div>
    </div>
  );
};

