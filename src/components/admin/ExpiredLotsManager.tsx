/**
 * Moniteur des lots gratuits
 * 
 * Composant admin pour visualiser les statistiques des lots gratuits
 * créés manuellement par les commerçants pour les bénéficiaires.
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Gift, TrendingUp, Users, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { 
  convertExpiredLotsToFree, 
  getExpiringLots, 
  getConversionStats,
  getFreeLots,
  type ConvertedLotResult 
} from '../../utils/expiredLotsService';
import type { Database } from '../../lib/database.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Lot = Database['public']['Tables']['lots']['Row'];

export function ExpiredLotsManager() {
  // État local
  const [loading, setLoading] = useState(false);
  const [freeLots, setFreeLots] = useState<Lot[]>([]);
  const [stats, setStats] = useState({
    totalConverted: 0,
    totalQuantitySaved: 0,
    merchantsImpacted: 0
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lots, statistics] = await Promise.all([
        getFreeLots(),
        getConversionStats(30) // Statistiques sur 30 jours
      ]);

      setFreeLots(lots);
      setStats(statistics);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Early return - Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Moniteur des Lots Gratuits
                </h1>
                <p className="text-gray-600 mt-1">
                  Statistiques et suivi des lots solidaires
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-white p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalConverted}
            </h3>
            <p className="text-gray-600 text-sm">Lots offerts (30 derniers jours)</p>
          </div>

          <div className="card bg-white p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <Gift className="w-6 h-6 text-success-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalQuantitySaved}
            </h3>
            <p className="text-gray-600 text-sm">Repas sauvés du gaspillage</p>
          </div>

          <div className="card bg-white p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.merchantsImpacted}
            </h3>
            <p className="text-gray-600 text-sm">Commerçants concernés</p>
          </div>
        </div>

        {/* Lots gratuits actifs */}
        {freeLots.length > 0 ? (
          <div className="card bg-white p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-600" />
              Lots gratuits disponibles ({freeLots.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freeLots.map((lot) => {
                const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
                return (
                  <div 
                    key={lot.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{lot.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Retrait: {format(new Date(lot.pickup_start), 'dd/MM à HH:mm', { locale: fr })}
                        {' - '}
                        {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {lot.is_urgent && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                            🔥 URGENT
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                          🎁 GRATUIT
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-green-700 text-xl">{remainingQty}</p>
                      <p className="text-sm text-gray-600">disponibles</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card bg-white p-12 text-center mb-8">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucun lot gratuit actif
            </h3>
            <p className="text-gray-500">
              Les commerçants peuvent passer leurs lots en gratuit via leur interface
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 card bg-blue-50 border-2 border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Comment ça fonctionne ?
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              <strong>1. Décision du commerçant :</strong> Le commerçant décide quand passer un lot en gratuit via le bouton "🎁 Gratuit" dans son interface.
            </p>
            <p>
              <strong>2. Conversion instantanée :</strong> Le lot devient immédiatement gratuit (prix = 0€) et accessible aux bénéficiaires.
            </p>
            <p>
              <strong>3. Disponibilité :</strong> Le lot apparaît dans la section "Paniers solidaires" des bénéficiaires.
            </p>
            <p>
              <strong>4. Réservation :</strong> Les bénéficiaires peuvent réserver ces lots gratuitement (limite 2/jour).
            </p>
            <p>
              <strong>5. Impact solidaire :</strong> Chaque lot gratuit contribue à réduire le gaspillage et aide les personnes dans le besoin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

