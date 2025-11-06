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

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

interface UserGrowthData {
  period: string;
  customers: number;
  merchants: number;
  beneficiaries: number;
}

export const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, year
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalLots: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    customerRetention: 0,
    carbonSaved: 0,
    // Nouvelles métriques wallet
    walletTransactions: 0,
    walletBalance: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
  });

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);

  // Charger les données au montage et quand la période change
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const getDateRangeFilter = () => {
    const now = new Date();
    const date = new Date();
    
    switch (dateRange) {
      case '7d':
        date.setDate(now.getDate() - 7);
        break;
      case '30d':
        date.setDate(now.getDate() - 30);
        break;
      case '90d':
        date.setDate(now.getDate() - 90);
        break;
      case 'year':
        date.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return date.toISOString();
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateRangeFilter();

      // Charger les utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('role, created_at');

      if (usersError) throw usersError;

      // Charger les lots
      const { data: lots, error: lotsError } = await supabase
        .from('lots')
        .select('status, category, original_price, discounted_price, quantity_sold, created_at')
        .gte('created_at', dateFilter);

      if (lotsError) throw lotsError;

      // Charger les réservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('total_price, status, created_at, quantity')
        .gte('created_at', dateFilter);

      if (reservationsError) throw reservationsError;

      // Charger les données wallet
      const { data: wallets } = await supabase
        .from('wallets')
        .select('balance');
      
      const { data: walletTransactions } = await supabase
        .from('wallet_transactions')
        .select('amount, type, status')
        .gte('created_at', dateFilter);

      // Calculer les métriques (inclure completed et confirmed)
      const paidReservations = reservations?.filter(r => 
        r.status === 'completed' || r.status === 'confirmed'
      ) || [];
      const totalRevenue = paidReservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
      const totalOrders = paidReservations.length;
      const totalUsers = users?.length || 0;
      const totalLots = lots?.filter(l => l.status === 'available').length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalQuantitySold = paidReservations.reduce((sum, r) => sum + (r.quantity || 0), 0);
      const carbonSaved = totalQuantitySold * 0.9; // 0.9 kg CO₂ par repas

      // Statistiques wallet
      const walletBalance = wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
      const walletTxCount = walletTransactions?.length || 0;
      const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
      const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;

      setMetrics({
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalUsers,
        totalLots,
        avgOrderValue: Math.round(avgOrderValue * 10) / 10,
        conversionRate: 0, // À calculer avec plus de données
        customerRetention: 0, // À calculer avec plus de données
        carbonSaved: Math.round(carbonSaved * 10) / 10,
        walletTransactions: walletTxCount,
        walletBalance: Math.round(walletBalance * 100) / 100,
        pendingReservations,
        confirmedReservations,
      });

      // Calculer les top produits par catégorie
      if (lots && lots.length > 0) {
        const categoryStats = new Map<string, { sales: number; revenue: number }>();
        
        lots.forEach(lot => {
          const existing = categoryStats.get(lot.category) || { sales: 0, revenue: 0 };
          existing.sales += lot.quantity_sold;
          existing.revenue += lot.quantity_sold * lot.discounted_price;
          categoryStats.set(lot.category, existing);
        });

        const topProductsData = Array.from(categoryStats.entries())
          .map(([name, stats]) => ({
            name,
            sales: stats.sales,
            revenue: Math.round(stats.revenue),
            trend: 0 // Nécessiterait de comparer avec la période précédente
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setTopProducts(topProductsData);
      } else {
        setTopProducts([]);
      }

      // Calculer la croissance des utilisateurs (derniers 6 mois)
      if (users && users.length > 0) {
        const monthlyData = new Map<string, { customers: number; merchants: number; beneficiaries: number }>();
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        // Initialiser les 6 derniers mois
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = months[date.getMonth()];
          monthlyData.set(monthKey, { customers: 0, merchants: 0, beneficiaries: 0 });
        }

        // Compter les utilisateurs par mois
        users.forEach(user => {
          const date = new Date(user.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const data = monthlyData.get(monthKey);
          
          if (data) {
            if (user.role === 'customer') data.customers++;
            else if (user.role === 'merchant') data.merchants++;
            else if (user.role === 'beneficiary') data.beneficiaries++;
          }
        });

        // Convertir en tableau avec cumul
        let cumulCustomers = 0;
        let cumulMerchants = 0;
        let cumulBeneficiaries = 0;
        
        const userGrowthData = Array.from(monthlyData.entries()).map(([key, data]) => {
          cumulCustomers += data.customers;
          cumulMerchants += data.merchants;
          cumulBeneficiaries += data.beneficiaries;
          
          const [year, month] = key.split('-');
          const monthLabel = months[parseInt(month) - 1];
          
          return {
            period: monthLabel,
            customers: cumulCustomers,
            merchants: cumulMerchants,
            beneficiaries: cumulBeneficiaries
          };
        });

        setUserGrowth(userGrowthData);
      } else {
        setUserGrowth([]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      // En cas d'erreur, garder les valeurs à 0
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting data as ${format}...`);
    // Implémentation de l'export
  };

  const metricCards = [
    {
      title: 'Revenus Totaux',
      value: `${metrics.totalRevenue.toLocaleString('fr-FR')}€`,
      icon: DollarSign,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
    {
      title: 'Commandes',
      value: metrics.totalOrders.toLocaleString('fr-FR'),
      icon: ShoppingBag,
      color: 'primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      title: 'Utilisateurs',
      value: metrics.totalUsers.toLocaleString('fr-FR'),
      icon: Users,
      color: 'secondary',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      borderColor: 'border-secondary-200'
    },
    {
      title: 'Lots Actifs',
      value: metrics.totalLots.toLocaleString('fr-FR'),
      icon: Package,
      color: 'warning',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      borderColor: 'border-warning-200'
    },
    {
      title: 'Panier Moyen',
      value: `${metrics.avgOrderValue.toLocaleString('fr-FR')}€`,
      icon: TrendingUp,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
    {
      title: 'Taux de Conversion',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: BarChart3,
      color: 'primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      title: 'Rétention Client',
      value: `${metrics.customerRetention.toFixed(1)}%`,
      icon: Heart,
      color: 'accent',
      bgColor: 'bg-accent-50',
      textColor: 'text-accent-600',
      borderColor: 'border-accent-200'
    },
    {
      title: 'CO₂ Économisé',
      value: `${metrics.carbonSaved.toLocaleString('fr-FR')}kg`,
      icon: Truck,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      borderColor: 'border-success-200'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-600 font-medium">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  const hasData = metrics.totalUsers > 0 || metrics.totalLots > 0 || metrics.totalOrders > 0;

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
            disabled={!hasData}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="year">Cette année</option>
          </select>

          {/* Export Buttons */}
          {hasData && (
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
          )}
        </div>
      </div>

      {!hasData && (
        <div className="card p-12 text-center">
          <BarChart3 size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-neutral-600 font-medium">
            Les analytics apparaîtront ici une fois que la plateforme aura des données à analyser
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((metric, index) => {
              const Icon = metric.icon;
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
        </>
      )}

      {hasData && topProducts.length > 0 && (
        /* Charts Section */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Package size={24} className="text-primary-600" />
              Top Catégories
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
                </div>
              ))}
            </div>
          </div>

          {/* User Growth */}
          {userGrowth.length > 0 && (
            <div className="card p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Users size={24} className="text-secondary-600" />
                Croissance Utilisateurs (6 derniers mois)
              </h3>
              <div className="space-y-4">
                {userGrowth.map((data, index) => {
                  const total = data.customers + data.merchants + data.beneficiaries;
                  const maxTotal = Math.max(...userGrowth.map(d => d.customers + d.merchants + d.beneficiaries));
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-neutral-700">
                        <span>{data.period}</span>
                        <span className="text-neutral-900">{total} total</span>
                      </div>
                      <div className="flex gap-2 h-8">
                        {data.customers > 0 && (
                          <div
                            className="bg-primary-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                            style={{ width: `${(data.customers / maxTotal) * 100}%` }}
                            title={`${data.customers} clients`}
                          >
                            {data.customers > 5 && data.customers}
                          </div>
                        )}
                        {data.merchants > 0 && (
                          <div
                            className="bg-success-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                            style={{ width: `${(data.merchants / maxTotal) * 100}%` }}
                            title={`${data.merchants} commerçants`}
                          >
                            {data.merchants > 5 && data.merchants}
                          </div>
                        )}
                        {data.beneficiaries > 0 && (
                          <div
                            className="bg-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold hover-lift"
                            style={{ width: `${(data.beneficiaries / maxTotal) * 100}%` }}
                            title={`${data.beneficiaries} bénéficiaires`}
                          >
                            {data.beneficiaries > 5 && data.beneficiaries}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
          )}
        </div>
      )}
    </div>
  );
};


