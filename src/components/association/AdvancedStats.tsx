import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, Package, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthlyStats {
  month: string;
  registrations: number;
  reservations: number;
}

interface CategoryStats {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];

export function AdvancedStats() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalBeneficiaries: 0,
    totalReservations: 0,
    activeThisMonth: 0,
    averagePerBeneficiary: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAdvancedStats();
    }
  }, [user]);

  const fetchAdvancedStats = async () => {
    try {
      setLoading(true);

      // Récupérer les bénéficiaires
      const { data: registrations, error: regError } = await supabase
        .from('association_beneficiary_registrations')
        .select(`
          registration_date,
          beneficiary_id,
          profiles!association_beneficiary_registrations_beneficiary_id_fkey (
            id
          )
        `)
        .eq('association_id', user!.id);

      if (regError) throw regError;

      const beneficiaryIds = registrations?.map((r: any) => r.profiles.id) || [];

      // Statistiques mensuelles (6 derniers mois)
      const last6Months: MonthlyStats[] = [];
      const categoryCount: { [key: string]: number } = {};
      
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const monthLabel = format(date, 'MMM', { locale: fr });

        // Nouvelles inscriptions ce mois
        const monthRegistrations = registrations?.filter((r: any) => {
          const regDate = new Date(r.registration_date);
          return regDate >= start && regDate <= end;
        }).length || 0;

        // Réservations ce mois
        let monthReservations = 0;
        if (beneficiaryIds.length > 0) {
          const { count } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .in('user_id', beneficiaryIds)
            .eq('is_donation', true)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString());

          monthReservations = count || 0;
        }

        last6Months.push({
          month: monthLabel,
          registrations: monthRegistrations,
          reservations: monthReservations,
        });
      }

      setMonthlyData(last6Months);

      // Statistiques par catégorie
      if (beneficiaryIds.length > 0) {
        const { data: reservations } = await supabase
          .from('reservations')
          .select(`
            lot:lots!inner (
              category
            )
          `)
          .in('user_id', beneficiaryIds)
          .eq('is_donation', true);

        reservations?.forEach((r: any) => {
          const category = r.lot.category;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }

      const categoryStats: CategoryStats[] = Object.entries(categoryCount)
        .map(([name, value], index) => ({
          name,
          value: value as number,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setCategoryData(categoryStats);

      // Statistiques totales
      const totalBeneficiaries = beneficiaryIds.length;
      
      let totalReservations = 0;
      let activeThisMonth = 0;

      if (beneficiaryIds.length > 0) {
        const { count } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .in('user_id', beneficiaryIds)
          .eq('is_donation', true);

        totalReservations = count || 0;

        // Actifs ce mois
        const thisMonthStart = startOfMonth(new Date());
        const { data: activeUsers } = await supabase
          .from('reservations')
          .select('user_id')
          .in('user_id', beneficiaryIds)
          .eq('is_donation', true)
          .gte('created_at', thisMonthStart.toISOString());

        const uniqueActiveUsers = new Set(activeUsers?.map((r: any) => r.user_id));
        activeThisMonth = uniqueActiveUsers.size;
      }

      setTotalStats({
        totalBeneficiaries,
        totalReservations,
        activeThisMonth,
        averagePerBeneficiary: totalBeneficiaries > 0 
          ? Math.round((totalReservations / totalBeneficiaries) * 10) / 10 
          : 0,
      });

    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques avancées:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <BarChart3 size={28} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Statistiques avancées</h2>
            <p className="text-neutral-600 mt-1">
              Analysez l'impact de votre association avec des graphiques détaillés
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} />
            <p className="text-purple-100 text-sm">Bénéficiaires</p>
          </div>
          <p className="text-4xl font-bold">{totalStats.totalBeneficiaries}</p>
          <p className="text-purple-100 text-sm mt-1">Total enregistrés</p>
        </div>

        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Package size={24} />
            <p className="text-success-100 text-sm">Réservations</p>
          </div>
          <p className="text-4xl font-bold">{totalStats.totalReservations}</p>
          <p className="text-success-100 text-sm mt-1">Au total</p>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={24} />
            <p className="text-primary-100 text-sm">Actifs ce mois</p>
          </div>
          <p className="text-4xl font-bold">{totalStats.activeThisMonth}</p>
          <p className="text-primary-100 text-sm mt-1">Bénéficiaires actifs</p>
        </div>

        <div className="bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} />
            <p className="text-warning-100 text-sm">Moyenne</p>
          </div>
          <p className="text-4xl font-bold">{totalStats.averagePerBeneficiary}</p>
          <p className="text-warning-100 text-sm mt-1">Réservations/personne</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Évolution sur 6 mois
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Inscriptions"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="reservations" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Réservations"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Catégories les plus réservées
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Graphique en barres - Comparaison mensuelle */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Comparaison inscriptions vs réservations
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="registrations" fill="#8b5cf6" name="Inscriptions" radius={[8, 8, 0, 0]} />
            <Bar dataKey="reservations" fill="#10b981" name="Réservations" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

