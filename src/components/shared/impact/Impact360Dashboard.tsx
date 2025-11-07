import { RefreshCw, Leaf, Droplets, PiggyBank, HeartHandshake, LineChart, Medal, Users as UsersIcon, Globe2, TrendingUp, Target, BarChart3, Tag } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useImpact360Dashboard } from '../../../hooks/useImpact360Dashboard';
import { formatCurrency } from '../../../utils/helpers';

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

const decimalPercentFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const decimalFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
});

export function Impact360Dashboard() {
  const { metrics, loading, error, refresh } = useImpact360Dashboard();

  const handleRefresh = () => {
    void refresh();
  };

  const kpiCards = [
    {
      id: 'meals',
      label: 'Repas sauvés',
      value: numberFormatter.format(metrics.headline.mealsSaved),
      icon: Leaf,
      accent: 'from-success-500 to-emerald-500',
      sublabel: `${decimalFormatter.format(metrics.headline.treesEquivalent)} arbres/an équivalents`,
    },
    {
      id: 'co2',
      label: 'CO₂ évité',
      value: `${decimalFormatter.format(metrics.headline.co2SavedKg)} kg`,
      icon: Globe2,
      accent: 'from-primary-500 to-sky-500',
      sublabel: `${decimalFormatter.format(metrics.headline.energySavedKwh)} kWh économisés`,
    },
    {
      id: 'water',
      label: 'Eau économisée',
      value: `${numberFormatter.format(metrics.headline.waterSavedLiters)} L`,
      icon: Droplets,
      accent: 'from-blue-500 to-indigo-500',
      sublabel: `${formatCurrency(metrics.headline.savingsGenerated)}`,
    },
    {
      id: 'revenue',
      label: 'Revenus générés',
      value: formatCurrency(metrics.headline.revenue),
      icon: PiggyBank,
      accent: 'from-amber-500 to-orange-500',
      sublabel: `Panier moyen ${formatCurrency(metrics.headline.averageBasketValue)}`,
    },
  ];

  const solidarityCards = [
    {
      id: 'donations',
      label: 'Réservations solidaires',
      value: numberFormatter.format(metrics.headline.donationCount),
      icon: HeartHandshake,
      description: `Volume solidaire ${formatCurrency(metrics.headline.donationVolume)}`,
    },
    {
      id: 'discount',
      label: 'Remise moyenne',
      value: decimalPercentFormatter.format(metrics.headline.averageDiscountRate),
      icon: Tag,
      description: 'Sur la valeur paniers sauvegardés',
    },
    {
      id: 'missions',
      label: 'Missions complétées',
      value: numberFormatter.format(metrics.mission.completed),
      icon: Medal,
      description: `${decimalPercentFormatter.format(metrics.mission.completionRate)} taux de complétion`,
    },
    {
      id: 'missions-in-progress',
      label: 'Missions en cours',
      value: numberFormatter.format(metrics.mission.inProgress),
      icon: Target,
      description: `Rémunérations ${formatCurrency(metrics.mission.payoutVolume)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
              <BarChart3 size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900">Impact 360°</h2>
              <p className="text-sm font-medium text-neutral-600">
                Vision consolidée de l’impact économique, social et environnemental sur 6 mois glissants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-b-transparent" />
                Synchronisation…
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>
        <div className="mt-4 text-xs text-neutral-500">
          Dernière mise à jour&nbsp;:
          {' '}
          {new Date(metrics.lastUpdatedAt).toLocaleString('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4" role="alert">
          <div>
            <p className="text-sm font-semibold text-accent-700">{error}</p>
            <p className="text-xs text-accent-600">Contactez l’équipe support si le problème persiste.</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="btn-primary px-4 py-1 text-xs"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md`}>
                <Icon size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{card.label}</p>
                <p className="text-3xl font-bold text-neutral-900">{card.value}</p>
                <p className="text-xs font-medium text-neutral-500">{card.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {solidarityCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-600">{card.label}</p>
                </div>
                <TrendingUp size={16} className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
              <p className="text-xs font-medium text-neutral-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <LineChart size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-600">Tendance sur 6 mois</p>
                <p className="text-xs font-medium text-neutral-500">Réservations, impact et solidarité</p>
              </div>
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.timeline}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="meals" name="Repas sauvés" stroke="#16a34a" fill="#16a34a22" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#2563eb" fill="#2563eb1a" strokeWidth={2} />
                <Area type="monotone" dataKey="donations" name="Solidarité" stroke="#f97316" fill="#f9731620" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
                <UsersIcon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-600">Répartition des rôles</p>
                <p className="text-xs font-medium text-neutral-500">Utilisateurs actifs plateforme</p>
              </div>
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.roleDistribution}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="role" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => numberFormatter.format(value)}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <Medal size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-600">Commerçants les plus contributifs</p>
              <p className="text-xs font-medium text-neutral-500">Top 5 sur la période analysée</p>
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-100">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Commerce
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Repas sauvés
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Revenus
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Solidarité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {metrics.merchantLeaders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm font-semibold text-neutral-500">
                    Aucune donnée disponible sur la période sélectionnée.
                  </td>
                </tr>
              )}
              {metrics.merchantLeaders.map((merchant) => (
                <tr key={merchant.merchantId} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 text-sm font-semibold text-neutral-900">
                    {merchant.merchantName}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-neutral-700">
                    {numberFormatter.format(merchant.meals)}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-neutral-700">
                    {formatCurrency(merchant.revenue)}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-neutral-700">
                    {numberFormatter.format(merchant.donations)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


