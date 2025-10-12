import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  Heart,
  Truck,
  Calendar,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';

export const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, year
  const [metrics, setMetrics] = useState({
    totalRevenue: 45678,
    totalOrders: 1234,
    totalUsers: 5678,
    totalLots: 890,
    avgOrderValue: 37,
    conversionRate: 12.5,
    customerRetention: 78,
    carbonSaved: 15.2
  });

  const [topProducts, setTopProducts] = useState([
    { name: 'Paniers fruits & légumes', sales: 245, revenue: 1225, trend: 15 },
    { name: 'Pain et viennoiseries', sales: 198, revenue: 792, trend: 8 },
    { name: 'Produits laitiers', sales: 176, revenue: 880, trend: -3 },
    { name: 'Viandes et poissons', sales: 154, revenue: 1540, trend: 22 },
    { name: 'Plats préparés', sales: 132, revenue: 1056, trend: 5 },
  ]);

  const [userGrowth, setUserGrowth] = useState([
    { period: 'Jan', customers: 120, merchants: 15, beneficiaries: 45 },
    { period: 'Fév', customers: 165, merchants: 22, beneficiaries: 58 },
    { period: 'Mar', customers: 210, merchants: 28, beneficiaries: 72 },
    { period: 'Avr', customers: 285, merchants: 35, beneficiaries: 89 },
    { period: 'Mai', customers: 340, merchants: 42, beneficiaries: 103 },
    { period: 'Juin', customers: 425, merchants: 51, beneficiaries: 125 },
  ]);

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting data as ${format}...`);
    // Implémentation de l'export
  };

  const metricCards = [
    {
      title: 'Revenus Totaux',
      value: `${metrics.totalRevenue.toLocaleString('fr-FR')}€`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
    {
      title: 'Commandes',
      value: metrics.totalOrders.toLocaleString('fr-FR'),
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      title: 'Utilisateurs',
      value: metrics.totalUsers.toLocaleString('fr-FR'),
      change: '+15.2%',
      trend: 'up',
      icon: Users,
      color: 'secondary',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      borderColor: 'border-secondary-200'
    },
    {
      title: 'Lots Actifs',
      value: metrics.totalLots.toLocaleString('fr-FR'),
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'warning',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      borderColor: 'border-warning-200'
    },
    {
      title: 'Panier Moyen',
      value: `${metrics.avgOrderValue}€`,
      change: '+5.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
    {
      title: 'Taux de Conversion',
      value: `${metrics.conversionRate}%`,
      change: '+1.2%',
      trend: 'up',
      icon: BarChart3,
      color: 'primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      title: 'Rétention Client',
      value: `${metrics.customerRetention}%`,
      change: '+3.5%',
      trend: 'up',
      icon: Heart,
      color: 'accent',
      bgColor: 'bg-accent-50',
      textColor: 'text-accent-600',
      borderColor: 'border-accent-200'
    },
    {
      title: 'CO₂ Économisé',
      value: `${metrics.carbonSaved}T`,
      change: '+18.7%',
      trend: 'up',
      icon: Truck,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <BarChart3 size={32} className="text-primary-600" />
            Analytics Avancées
          </h2>
          <p className="text-neutral-600 mt-2 font-medium">
            Analyses détaillées et métriques de performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input py-2"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="year">Cette année</option>
          </select>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => exportData('csv')}
              className="btn-secondary rounded-xl"
            >
              <Download size={20} />
              <span>CSV</span>
            </button>
            <button
              onClick={() => exportData('pdf')}
              className="btn-outline rounded-xl"
            >
              <Download size={20} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div
              key={index}
              className={`card p-6 hover-lift border-2 ${metric.borderColor}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className={metric.textColor} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  metric.trend === 'up' ? 'text-success-600' : 'text-accent-600'
                }`}>
                  <TrendIcon size={16} />
                  {metric.change}
                </div>
              </div>
              <div className="text-3xl font-black text-neutral-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-neutral-600 font-semibold">
                {metric.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card p-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Package size={24} className="text-primary-600" />
            Top Produits
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover-lift">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 truncate">
                    {product.name}
                  </div>
                  <div className="text-sm text-neutral-600 font-medium">
                    {product.sales} ventes • {product.revenue}€
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  product.trend > 0 ? 'text-success-600' : 'text-accent-600'
                }`}>
                  {product.trend > 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {Math.abs(product.trend)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="card p-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Users size={24} className="text-secondary-600" />
            Croissance Utilisateurs
          </h3>
          <div className="space-y-4">
            {userGrowth.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                  <span>{data.period}</span>
                  <span className="text-neutral-900">{data.customers + data.merchants + data.beneficiaries} total</span>
                </div>
                <div className="flex gap-2 h-8">
                  <div
                    className="bg-primary-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                    style={{ width: `${(data.customers / 500) * 100}%` }}
                    title={`${data.customers} clients`}
                  >
                    {data.customers > 50 && data.customers}
                  </div>
                  <div
                    className="bg-success-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                    style={{ width: `${(data.merchants / 500) * 100}%` }}
                    title={`${data.merchants} commerçants`}
                  >
                    {data.merchants > 20 && data.merchants}
                  </div>
                  <div
                    className="bg-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                    style={{ width: `${(data.beneficiaries / 500) * 100}%` }}
                    title={`${data.beneficiaries} bénéficiaires`}
                  >
                    {data.beneficiaries > 30 && data.beneficiaries}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm font-semibold text-neutral-700">Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm font-semibold text-neutral-700">Commerçants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                <span className="text-sm font-semibold text-neutral-700">Bénéficiaires</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-center">
            <div className="text-5xl font-black text-gradient mb-2">98.5%</div>
            <div className="text-sm font-semibold text-neutral-600">Taux de satisfaction</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <div className="text-5xl font-black text-gradient mb-2">2.3min</div>
            <div className="text-sm font-semibold text-neutral-600">Temps de réponse moyen</div>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-center">
            <div className="text-5xl font-black text-gradient mb-2">4.8/5</div>
            <div className="text-sm font-semibold text-neutral-600">Note moyenne</div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-success-600" />
          Insights & Recommandations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
            <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-neutral-900">Croissance forte des bénéficiaires</div>
              <div className="text-sm text-neutral-600 font-medium">
                +25% ce mois-ci. Envisagez d'augmenter le nombre de partenariats avec les associations.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
            <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-neutral-900">Baisse légère des lots actifs</div>
              <div className="text-sm text-neutral-600 font-medium">
                -2.4% cette semaine. Contactez les commerçants pour relancer l'activité.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
            <div>
              <div className="font-semibold text-neutral-900">Excellent taux de rétention</div>
              <div className="text-sm text-neutral-600 font-medium">
                78% des clients reviennent dans les 30 jours. Continuez les actions de fidélisation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

