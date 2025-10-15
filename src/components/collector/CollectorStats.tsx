import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/helpers';
import { DollarSign, TrendingUp, CheckCircle, Package, Calendar } from 'lucide-react';

interface CollectorStats {
  total_earnings: number;
  missions_completed: number;
  missions_in_progress: number;
  earnings_today: number;
  earnings_this_week: number;
  earnings_this_month: number;
}

export const CollectorStats = () => {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState<CollectorStats>({
    total_earnings: 0,
    missions_completed: 0,
    missions_in_progress: 0,
    earnings_today: 0,
    earnings_this_week: 0,
    earnings_this_month: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!profile) return;

    try {
      // Récupérer toutes les missions du collecteur
      const { data: missions, error } = await supabase
        .from('missions')
        .select('*')
        .eq('collector_id', profile.id);

      if (error) throw error;

      if (!missions) {
        setLoading(false);
        return;
      }

      // Calculer les statistiques
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const completedMissions = missions.filter((m) => m.status === 'completed');
      const inProgressMissions = missions.filter(
        (m) => m.status === 'accepted' || m.status === 'in_progress'
      );

      const totalEarnings = completedMissions.reduce(
        (sum, m) => sum + Number(m.payment_amount),
        0
      );

      const earningsToday = completedMissions
        .filter((m) => new Date(m.completed_at || '') >= today)
        .reduce((sum, m) => sum + Number(m.payment_amount), 0);

      const earningsThisWeek = completedMissions
        .filter((m) => new Date(m.completed_at || '') >= weekAgo)
        .reduce((sum, m) => sum + Number(m.payment_amount), 0);

      const earningsThisMonth = completedMissions
        .filter((m) => new Date(m.completed_at || '') >= monthStart)
        .reduce((sum, m) => sum + Number(m.payment_amount), 0);

      setStats({
        total_earnings: totalEarnings,
        missions_completed: completedMissions.length,
        missions_in_progress: inProgressMissions.length,
        earnings_today: earningsToday,
        earnings_this_week: earningsThisWeek,
        earnings_this_month: earningsThisMonth,
      });
    } catch (error) {
      console.error('Error fetching collector stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bannière de revenus totaux */}
      <div className="relative overflow-hidden bg-gradient-to-br from-success-600 via-success-700 to-success-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <DollarSign size={32} className="text-white" strokeWidth={2} />
          </div>
          <p className="text-white/90 text-sm font-medium mb-2">💰 Revenus totaux gagnés</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {formatCurrency(stats.total_earnings)}
          </h2>
          <div className="flex items-center justify-center gap-2 text-white/90">
            <TrendingUp size={16} />
            <span className="text-sm">
              {stats.missions_completed} mission{stats.missions_completed > 1 ? 's' : ''} complétée{stats.missions_completed > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Grille des statistiques périodiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Aujourd'hui */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6 hover:border-success-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-warning-100 to-warning-200 rounded-lg">
              <Calendar size={20} className="text-warning-600" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-gray-700">Aujourd'hui</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.earnings_today)}
          </p>
          <p className="text-xs text-gray-500">Gains du jour</p>
        </div>

        {/* Cette semaine */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6 hover:border-success-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
              <TrendingUp size={20} className="text-primary-600" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-gray-700">Cette semaine</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.earnings_this_week)}
          </p>
          <p className="text-xs text-gray-500">7 derniers jours</p>
        </div>

        {/* Ce mois */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6 hover:border-success-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-success-100 to-success-200 rounded-lg">
              <DollarSign size={20} className="text-success-600" strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-gray-700">Ce mois</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.earnings_this_month)}
          </p>
          <p className="text-xs text-gray-500">Mois en cours</p>
        </div>
      </div>

      {/* Compteurs de missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Missions complétées */}
        <div className="bg-gradient-to-br from-success-50 to-white rounded-xl shadow-md border-2 border-success-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Missions terminées</p>
              <p className="text-4xl font-bold text-success-600">{stats.missions_completed}</p>
            </div>
            <div className="p-4 bg-success-100 rounded-full">
              <CheckCircle size={32} className="text-success-600" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Missions en cours */}
        <div className="bg-gradient-to-br from-warning-50 to-white rounded-xl shadow-md border-2 border-warning-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">En cours</p>
              <p className="text-4xl font-bold text-warning-600">{stats.missions_in_progress}</p>
            </div>
            <div className="p-4 bg-warning-100 rounded-full">
              <Package size={32} className="text-warning-600" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Message de motivation */}
      {stats.missions_completed === 0 && (
        <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-100 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            🚀 Prêt à commencer votre première mission ?
          </p>
          <p className="text-sm text-gray-600">
            Acceptez une mission disponible pour commencer à gagner de l'argent en aidant votre communauté !
          </p>
        </div>
      )}

      {stats.missions_completed > 0 && (
        <div className="p-6 bg-gradient-to-br from-success-50 to-primary-50 rounded-xl border-2 border-success-100 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            🎉 Bravo pour vos {stats.missions_completed} missions complétées !
          </p>
          <p className="text-sm text-gray-600">
            Vous contribuez à réduire le gaspillage tout en gagnant un revenu flexible. Continuez comme ça ! 💚
          </p>
        </div>
      )}
    </div>
  );
};

