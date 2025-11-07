import { useAuthStore } from '../../stores/authStore';
import { useAssociationAdvancedStats } from '../../hooks/useAssociationAdvancedStats';
import type { MonthlyStats, CategoryStats } from '../../hooks/useAssociationAdvancedStats';
import { TrendingUp, Users, Package, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];

export function AdvancedStats() {
  const { user } = useAuthStore();
  const associationId = user?.id ?? null;

  const {
    monthlyData,
    categoryData,
    totals,
    loading,
    error,
    refresh,
  } = useAssociationAdvancedStats({ associationId, colors: CHART_COLORS });

  const handleRefresh = () => {
    void refresh();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-purple-500 border-b-transparent" />
                Chargement…
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4" role="alert">
          <div className="text-accent-700 text-sm">
            <p className="font-semibold">{error}</p>
            <p className="text-xs">Réessayez plus tard ou cliquez sur « Actualiser ».</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="btn-primary px-3 py-1 text-xs"
            disabled={loading}
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-sm uppercase tracking-wide text-white/80">Bénéficiaires</span>
          </div>
          <p className="text-3xl font-bold mt-4">{totals.totalBeneficiaries}</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 text-purple-600">
            <TrendingUp size={20} />
            <span className="text-sm font-semibold text-neutral-600">Réservations solidaires</span>
          </div>
          <p className="text-3xl font-bold mt-4 text-neutral-900">{totals.totalReservations}</p>
          <p className="text-xs text-neutral-500 mt-1">{totals.averagePerBeneficiary} par bénéficiaire</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 text-green-600">
            <Package size={20} />
            <span className="text-sm font-semibold text-neutral-600">Actifs ce mois</span>
          </div>
          <p className="text-3xl font-bold mt-4 text-neutral-900">{totals.activeThisMonth}</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 text-blue-600">
            <Calendar size={20} />
            <span className="text-sm font-semibold text-neutral-600">Période suivie</span>
          </div>
          <p className="text-3xl font-bold mt-4 text-neutral-900">6 mois</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Évolution sur 6 mois
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
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
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
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

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Comparaison inscriptions vs réservations
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
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
