import { useState, useMemo } from 'react';
import { ChevronLeft, Store, MapPin, Navigation, Package, Clock, ShoppingCart, X, TrendingDown, Flame, Filter, SortAsc, Phone, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDistance } from '../../../utils/geocodingService';
import type { MerchantWithLots, LotBase } from './types';

interface MerchantLotsViewProps {
  merchant: MerchantWithLots;
  onBack: () => void;
  onReserveLot: (lot: LotBase) => void;
  onViewDetails?: (lot: LotBase) => void;
}

type SortOption = 'price-asc' | 'price-desc' | 'discount' | 'urgent' | 'quantity';
type FilterOption = 'all' | 'urgent' | 'available';

// Fonction helper pour formater les horaires
const formatBusinessHours = (businessHours: Record<string, { open: string | null; close: string | null; closed: boolean }> | null) => {
  if (!businessHours) return null;

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: Record<string, string> = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim'
  };

  const today = daysOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return daysOrder.map(day => {
    const hours = businessHours[day];
    const isToday = day === today;
    
    return {
      day: dayNames[day],
      isToday,
      isClosed: hours?.closed || false,
      hours: hours?.closed ? 'Fermé' : `${hours?.open || ''} - ${hours?.close || ''}`
    };
  });
};

export function MerchantLotsView({ merchant, onBack, onReserveLot, onViewDetails }: MerchantLotsViewProps) {
  const businessHours = formatBusinessHours(merchant.business_hours);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('urgent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calculs de statistiques enrichies
  const stats = useMemo(() => {
    const totalUnits = merchant.lots.reduce((sum, l) => sum + (l.quantity_total - l.quantity_reserved - l.quantity_sold), 0);
    const urgentLots = merchant.lots.filter(l => l.is_urgent).length;
    const totalValue = merchant.lots.reduce((sum, l) => {
      const available = l.quantity_total - l.quantity_reserved - l.quantity_sold;
      return sum + (available * l.discounted_price);
    }, 0);
    const totalSavings = merchant.lots.reduce((sum, l) => {
      const available = l.quantity_total - l.quantity_reserved - l.quantity_sold;
      return sum + (available * (l.original_price - l.discounted_price));
    }, 0);
    
    return { totalUnits, urgentLots, totalValue, totalSavings };
  }, [merchant.lots]);

  // Tri et filtrage des lots
  const filteredAndSortedLots = useMemo(() => {
    let lots = [...merchant.lots];

    // Filtrage
    if (filterBy === 'urgent') {
      lots = lots.filter(l => l.is_urgent);
    } else if (filterBy === 'available') {
      lots = lots.filter(l => (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0);
    }

    // Tri
    lots.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.discounted_price - b.discounted_price;
        case 'price-desc':
          return b.discounted_price - a.discounted_price;
        case 'discount': {
          const discountA = ((a.original_price - a.discounted_price) / a.original_price) * 100;
          const discountB = ((b.original_price - b.discounted_price) / b.original_price) * 100;
          return discountB - discountA;
        }
        case 'urgent':
          return (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0);
        case 'quantity': {
          const qtyA = a.quantity_total - a.quantity_reserved - a.quantity_sold;
          const qtyB = b.quantity_total - b.quantity_reserved - b.quantity_sold;
          return qtyB - qtyA;
        }
        default:
          return 0;
      }
    });

    return lots;
  }, [merchant.lots, sortBy, filterBy]);

  return (
    <div className="space-y-3 pb-4">
      {/* Header compact avec retour */}
      <div className="bg-white rounded-3xl border border-gray-100 p-0 overflow-visible relative shadow-2xl">
        {/* Bandeau haut, plus élégant */}
        <div className="relative h-24 bg-gradient-to-r from-black via-gray-900 to-gray-800 overflow-hidden border-b-2 border-gray-100">
          {/* Retour */}
          <button
            onClick={onBack}
            className="absolute top-3 left-3 z-20 bg-white/30 text-white hover:bg-white/60 flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-md backdrop-blur-sm transition"
            aria-label="Retour à la liste des commerçants"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            <span className="font-semibold text-xs drop-shadow">Retour</span>
          </button>

          {/* Distance badge */}
          {merchant.distance && (
            <div className="absolute top-3 right-3 bg-white/30 text-white px-3 py-1 rounded-xl flex items-center gap-1 shadow-md backdrop-blur-sm select-none">
              <Navigation className="w-4 h-4" strokeWidth={2} />
              <span className="text-xs font-semibold">{formatDistance(merchant.distance)}</span>
            </div>
          )}
        </div>

        {/* Contenu principal affleurant sur le bandeau */}
        <div className="px-4 pb-4 -mt-12 relative z-10">
          {/* Logo commerçant stylisé */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white transition bg-black/90 overflow-hidden -mb-2">
              {merchant.business_logo_url ? (
                <img
                  src={merchant.business_logo_url}
                  alt={merchant.business_name || merchant.full_name}
                  className="w-full h-full object-cover animate-fade-in"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                  loading="lazy"
                />
              ) : null}
              <Store className={`w-10 h-10 text-white ${merchant.business_logo_url ? 'hidden' : ''}`} strokeWidth={2} />
            </div>
          </div>

          {/* Identité du commerce */}
          <div className="text-center mb-3 space-y-1.5">
            <h2 className="text-xl font-extrabold text-black px-2 leading-tight line-clamp-2">
              {merchant.business_name || merchant.full_name}
            </h2>
            <div className="flex justify-center items-center gap-2 text-xs text-gray-500 font-light px-2">
              <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
              <span className="line-clamp-1">{merchant.business_address || merchant.address}</span>
            </div>
            
            {/* Téléphone si dispo */}
            {merchant.phone && (
              <a 
                href={`tel:${merchant.phone}`}
                className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium underline transition"
              >
                <Phone className="w-4 h-4" strokeWidth={1.8} />
                {merchant.phone}
              </a>
            )}
          </div>

          {/* Actions commerçant */}
          <div className="flex justify-center gap-3 mb-1">
            {businessHours && (
              <button
                onClick={() => setShowHoursModal(true)}
                className="bg-black/90 text-white flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs hover:bg-black"
                type="button"
                aria-label="Afficher les horaires d'ouverture"
              >
                <Clock className="w-4 h-4" strokeWidth={1.8} />
                <span className="font-medium">
                  Horaires
                </span>
                {/* Statut ouvert/fermé du jour, badge coloré */}
                {(() => {
                  const today = businessHours.find((h) => h.isToday);
                  if (!today) return null;
                  return (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        today.isClosed 
                          ? 'bg-gray-100 text-gray-700 border-gray-300' 
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {today.isClosed ? 'Fermé' : 'Ouvert'}
                    </span>
                  );
                })()}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats enrichies du commerçant */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Nombre de lots */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center hover:shadow-lg transition">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="text-xl font-bold text-black">{merchant.lots.length}</div>
          <div className="text-[10px] text-gray-600 font-light uppercase">Invendus</div>
        </div>

        {/* Unités disponibles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center hover:shadow-lg transition">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gray-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="text-xl font-bold text-black">{stats.totalUnits}</div>
          <div className="text-[10px] text-gray-600 font-light uppercase">Unités dispo</div>
        </div>

        {/* Lots urgents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center hover:shadow-lg transition">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gray-100 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="text-xl font-bold text-black">{stats.urgentLots}</div>
          <div className="text-[10px] text-gray-600 font-light uppercase">Urgents</div>
        </div>

        {/* Économies potentielles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center hover:shadow-lg transition">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gray-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="text-xl font-bold text-black">{stats.totalSavings.toFixed(0)}€</div>
          <div className="text-[10px] text-gray-600 font-light uppercase">Économies</div>
        </div>
      </div>

      {/* Barre de filtres et tri */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 space-y-2">
        {/* Titre et toggle filtres */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-black flex items-center gap-1.5">
            <Package className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm">{filteredAndSortedLots.length} lot{filteredAndSortedLots.length > 1 ? 's' : ''}</span>
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition border font-medium ${
              showFilters ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200'
            }`}
            type="button"
          >
            <Filter className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            <span className="text-xs hidden sm:inline">Filtres</span>
          </button>
        </div>

        {/* Panneau de filtres et tri (collapsible) */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {/* Filtres rapides */}
            <div>
              <label className="text-[10px] font-medium text-black mb-1.5 block uppercase">Filtrer par</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                    filterBy === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Tous ({merchant.lots.length})
                </button>
                <button
                  onClick={() => setFilterBy('urgent')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                    filterBy === 'urgent'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  🔥 Urgents ({stats.urgentLots})
                </button>
                <button
                  onClick={() => setFilterBy('available')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                    filterBy === 'available'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Disponibles ({merchant.lots.filter(l => (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0).length})
                </button>
              </div>
            </div>

            {/* Options de tri */}
            <div>
              <label className="text-[10px] font-medium text-black mb-1.5 block flex items-center gap-1.5 uppercase">
                <SortAsc className="w-3 h-3" strokeWidth={1.5} />
                Trier par
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                <button
                  onClick={() => setSortBy('urgent')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    sortBy === 'urgent'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Urgence
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    sortBy === 'price-asc'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Prix ↑
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    sortBy === 'price-desc'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Prix ↓
                </button>
                <button
                  onClick={() => setSortBy('discount')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    sortBy === 'discount'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Réduction
                </button>
                <button
                  onClick={() => setSortBy('quantity')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    sortBy === 'quantity'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  Quantité
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grille des lots - Compact et animé */}
      {filteredAndSortedLots.length === 0 ? (
        <div className="card p-8 text-center space-y-3 animate-fade-in-up">
          {filterBy !== 'all' || merchant.lots.length === 0 ? (
            <>
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center animate-pulse-soft">
                <AlertCircle className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  {merchant.lots.length === 0 ? 'Aucun invendu disponible' : 'Aucun résultat'}
                </h3>
                <p className="text-neutral-600 text-xs">
                  {merchant.lots.length === 0 
                    ? 'Ce commerçant n\'a pas encore publié d\'invendus. Revenez plus tard !'
                    : 'Essayez de modifier vos filtres pour voir plus de résultats.'
                  }
                </p>
              </div>
              {filterBy !== 'all' && (
                <button
                  onClick={() => setFilterBy('all')}
                  className="btn-primary mx-auto text-sm py-2 px-4 hover:scale-105 active:scale-95 transition-all duration-300"
                  type="button"
                >
                  Voir tous les lots
                </button>
              )}
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-neutral-400 mx-auto animate-pulse-soft" />
              <p className="text-neutral-600 text-sm">Aucun invendu disponible pour le moment</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3
          /* Mobile : 1 lot par ligne (pleine largeur) */
          grid-cols-1
          /* Petits écrans : 2 colonnes */
          sm:grid-cols-2
          /* Tablettes : 3 colonnes */
          md:grid-cols-3
          /* Desktop : 4 colonnes */
          lg:grid-cols-4
          /* Large desktop : 5 colonnes */
          xl:grid-cols-5">
          {filteredAndSortedLots.map((lot) => {
            const availableQuantity = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
            const discountPercent = Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100);

            return (
              <div
                key={lot.id}
                className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  availableQuantity === 0 ? 'opacity-60' : ''
                }`}
                onClick={() => onViewDetails ? onViewDetails(lot) : onReserveLot(lot)}
              >
                {/* Image avec barre de progression */}
                <div className="relative">
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    {lot.image_urls && lot.image_urls.length > 0 ? (
                      <img
                        src={lot.image_urls[0]}
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package size={40} className="text-gray-400" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Barre de progression */}
                  {availableQuantity > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${(availableQuantity / lot.quantity_total) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Badges superposés */}
                  <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {/* Badge catégorie */}
                      <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-md shadow-sm">
                        {lot.category}
                      </span>
                      
                      {/* Badge urgent */}
                      {lot.is_urgent && (
                        <span className="px-2 py-0.5 bg-red-500/95 backdrop-blur-sm text-xs font-medium text-white rounded-md shadow-sm flex items-center gap-1">
                          <span className="animate-pulse">⚡</span>
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Badge réduction et statut */}
                    <div className="flex flex-col items-end gap-1.5">
                      {discountPercent > 0 && availableQuantity > 0 && (
                        <span className="px-2 py-0.5 bg-green-500/95 backdrop-blur-sm text-xs font-bold text-white rounded-md shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                      <span className={`px-2 py-0.5 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm ${
                        availableQuantity === 0 
                          ? 'bg-gray-800/95 text-white' 
                          : 'bg-green-500/95 text-white'
                      }`}>
                        {availableQuantity === 0 ? '❌ Épuisé' : '✅ Dispo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu desktop et mobile - Design cohérent avec LotCard */}
                <div className="p-3 bg-white">
                  {/* Titre et commerçant */}
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                      {lot.title}
                    </h3>
                  </div>

                  {/* Prix */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {lot.discounted_price}€
                      </span>
                      {lot.original_price > lot.discounted_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {lot.original_price}€
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantité disponible et horaires */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
                      <span>
                        {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${
                      availableQuantity > 3 ? 'text-green-600' : availableQuantity > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      <Package className="w-3 h-3" strokeWidth={1.5} />
                      <span>{availableQuantity} dispo</span>
                    </div>
                  </div>

                  {/* Bouton réserver */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserveLot(lot);
                    }}
                    disabled={availableQuantity === 0}
                    className={`w-full py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-sm font-semibold ${
                      availableQuantity === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200'
                    }`}
                  >
                    <ShoppingCart size={14} strokeWidth={2} />
                    <span>{availableQuantity === 0 ? 'Épuisé' : 'Réserver'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Horaires d'ouverture - Compact et animé */}
      {showHoursModal && businessHours && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowHoursModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header compact */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md animate-pulse-soft">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Horaires d'ouverture</h3>
                  <p className="text-xs text-neutral-600 line-clamp-1">{merchant.business_name || merchant.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHoursModal(false)}
                className="p-1.5 hover:bg-white/80 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                type="button"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Contenu compact */}
            <div className="p-4">
              <div className="space-y-2">
                {businessHours.map((dayInfo, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                      dayInfo.isToday
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-300 shadow-md scale-[1.02] animate-pulse-soft'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        dayInfo.isToday
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {dayInfo.day}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${
                          dayInfo.isToday ? 'text-primary-700' : 'text-neutral-700'
                        }`}>
                          {dayInfo.day === 'Lun' && 'Lundi'}
                          {dayInfo.day === 'Mar' && 'Mardi'}
                          {dayInfo.day === 'Mer' && 'Mercredi'}
                          {dayInfo.day === 'Jeu' && 'Jeudi'}
                          {dayInfo.day === 'Ven' && 'Vendredi'}
                          {dayInfo.day === 'Sam' && 'Samedi'}
                          {dayInfo.day === 'Dim' && 'Dimanche'}
                          {dayInfo.isToday && <span className="ml-1.5 text-primary-500 text-[10px]">• Aujourd'hui</span>}
                        </div>
                        <div className={`text-[10px] font-medium ${
                          dayInfo.isToday ? 'text-primary-600' : 'text-neutral-500'
                        }`}>
                          {dayInfo.isClosed ? 'Magasin fermé' : 'Ouvert'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right text-xs transition-all duration-300 ${
                      dayInfo.isClosed ? 'text-neutral-400' : dayInfo.isToday ? 'text-primary-700 font-extrabold' : 'text-neutral-700 font-bold'
                    }`}>
                      {dayInfo.hours}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info supplémentaire compact */}
              <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 animate-fade-in-up">
                <p className="text-xs text-primary-700 font-semibold leading-relaxed">
                  💡 Les horaires de retrait des lots peuvent différer. Vérifiez les heures sur chaque lot.
                </p>
              </div>
            </div>

            {/* Footer compact */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => setShowHoursModal(false)}
                className="w-full btn-primary rounded-xl py-2.5 text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



