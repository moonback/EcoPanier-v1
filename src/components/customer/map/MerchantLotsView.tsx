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
    <div className="space-y-4 pb-4">
      {/* Header élégant avec retour */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-lg">
        {/* Bandeau supérieur avec dégradé cohérent */}
        <div className="relative h-32 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
          {/* Pattern décoratif */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Bouton retour */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-white transition-all font-semibold shadow-lg hover:shadow-xl group"
            aria-label="Retour à la liste des commerçants"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
            <span className="text-sm">Retour</span>
          </button>

          {/* Distance badge */}
          {merchant.distance && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
              <Navigation className="w-4 h-4 text-primary-600" strokeWidth={2} />
              <span className="text-sm font-bold">{formatDistance(merchant.distance)}</span>
            </div>
          )}
        </div>

        {/* Contenu principal avec logo en superposition */}
        <div className="px-6 pb-6 -mt-10 relative z-10">
          {/* Logo commerçant */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {merchant.business_logo_url ? (
                <img
                  src={merchant.business_logo_url}
                  alt={merchant.business_name || merchant.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                  loading="lazy"
                />
              ) : null}
              <Store className={`w-9 h-9 text-white ${merchant.business_logo_url ? 'hidden' : ''}`} strokeWidth={2} />
            </div>
          </div>

          {/* Informations du commerce */}
          <div className="text-center space-y-2 mb-4">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {merchant.business_name || merchant.full_name}
            </h2>
            
            {/* Adresse */}
            <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary-600" strokeWidth={2} />
              <span className="font-medium">{merchant.business_address || merchant.address}</span>
            </div>
            
            {/* Téléphone */}
            {merchant.phone && (
              <a 
                href={`tel:${merchant.phone}`}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                {merchant.phone}
              </a>
            )}
          </div>

          {/* Bouton horaires */}
          {businessHours && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowHoursModal(true)}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg group"
                type="button"
                aria-label="Afficher les horaires d'ouverture"
              >
                <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" strokeWidth={2} />
                <span>Horaires d'ouverture</span>
                {(() => {
                  const today = businessHours.find((h) => h.isToday);
                  if (!today) return null;
                  return (
                    <span
                      className={`ml-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        today.isClosed 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {today.isClosed ? 'Fermé' : 'Ouvert'}
                    </span>
                  );
                })()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats enrichies du commerçant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Nombre de lots */}
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border-2 border-primary-100 p-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{merchant.lots.length}</div>
              <div className="text-xs text-gray-600 font-medium">Lots disponibles</div>
            </div>
          </div>
        </div>

        {/* Unités disponibles */}
        <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl border-2 border-secondary-100 p-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.totalUnits}</div>
              <div className="text-xs text-gray-600 font-medium">Unités restantes</div>
            </div>
          </div>
        </div>

        {/* Lots urgents */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border-2 border-orange-100 p-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.urgentLots}</div>
              <div className="text-xs text-gray-600 font-medium">Lots urgents</div>
            </div>
          </div>
        </div>

        {/* Économies potentielles */}
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-100 p-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <TrendingDown className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stats.totalSavings.toFixed(0)}€</div>
              <div className="text-xs text-gray-600 font-medium">À économiser</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres et tri */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-md">
        {/* Titre et toggle filtres */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" strokeWidth={2} />
            <span>{filteredAndSortedLots.length} lot{filteredAndSortedLots.length > 1 ? 's' : ''} disponible{filteredAndSortedLots.length > 1 ? 's' : ''}</span>
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-md ${
              showFilters 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            <Filter className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} strokeWidth={2} />
            <span className="text-sm">Filtres</span>
          </button>
        </div>

        {/* Panneau de filtres et tri (collapsible) */}
        {showFilters && (
          <div className="space-y-4 pt-3 border-t-2 border-gray-100 animate-fade-in-up">
            {/* Filtres rapides */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide">Afficher</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterBy === 'all'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  Tous • {merchant.lots.length}
                </button>
                <button
                  onClick={() => setFilterBy('urgent')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterBy === 'urgent'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  🔥 Urgents • {stats.urgentLots}
                </button>
                <button
                  onClick={() => setFilterBy('available')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filterBy === 'available'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  type="button"
                >
                  ✅ Disponibles • {merchant.lots.filter(l => (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0).length}
                </button>
              </div>
            </div>

            {/* Options de tri */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wide flex items-center gap-2">
                <SortAsc className="w-4 h-4" strokeWidth={2} />
                Trier par
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <button
                  onClick={() => setSortBy('urgent')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    sortBy === 'urgent'
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  ⚡ Urgence
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    sortBy === 'price-asc'
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  💰 Prix ↑
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    sortBy === 'price-desc'
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  💸 Prix ↓
                </button>
                <button
                  onClick={() => setSortBy('discount')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    sortBy === 'discount'
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  📊 Réduction
                </button>
                <button
                  onClick={() => setSortBy('quantity')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    sortBy === 'quantity'
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  📦 Quantité
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedLots.map((lot) => {
            const availableQuantity = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
            const discountPercent = Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100);

            return (
              <div
                key={lot.id}
                className={`group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                  availableQuantity === 0 ? 'opacity-50 grayscale' : ''
                }`}
                onClick={() => onViewDetails ? onViewDetails(lot) : onReserveLot(lot)}
              >
                {/* Image du lot */}
                <div className="relative h-48 overflow-hidden">
                  {lot.image_urls && lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <Package size={48} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Barre de progression du stock */}
                  {availableQuantity > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/30 backdrop-blur-sm">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 shadow-lg"
                        style={{ width: `${(availableQuantity / lot.quantity_total) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    {/* Badge catégorie */}
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-lg shadow-md">
                      {lot.category}
                    </span>
                    
                    {/* Badge réduction */}
                    {discountPercent > 0 && availableQuantity > 0 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black rounded-lg shadow-md">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Badge urgent animé */}
                  {lot.is_urgent && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
                        <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
                        URGENT
                      </span>
                    </div>
                  )}

                  {/* Badge statut */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-3 py-1.5 backdrop-blur-md text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 ${
                      availableQuantity === 0 
                        ? 'bg-gray-900/90 text-white' 
                        : 'bg-green-500/90 text-white'
                    }`}>
                      {availableQuantity === 0 ? (
                        <>
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          ÉPUISÉ
                        </>
                      ) : (
                        <>
                          <Package className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {availableQuantity}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-4">
                  {/* Titre */}
                  <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-3 leading-tight min-h-[2.5rem]">
                    {lot.title}
                  </h3>

                  {/* Prix */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">
                        {lot.discounted_price}€
                      </span>
                      {lot.original_price > lot.discounted_price && (
                        <span className="text-sm text-gray-500 line-through font-medium">
                          {lot.original_price}€
                        </span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Économisez {(lot.original_price - lot.discounted_price).toFixed(2)}€
                      </p>
                    )}
                  </div>

                  {/* Horaires de retrait */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-primary-600" strokeWidth={2} />
                    <span className="font-medium">
                      {format(new Date(lot.pickup_start), 'dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                    </span>
                  </div>

                  {/* Bouton réserver */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserveLot(lot);
                    }}
                    disabled={availableQuantity === 0}
                    className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-md ${
                      availableQuantity === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                  >
                    <ShoppingCart size={16} strokeWidth={2.5} />
                    <span>{availableQuantity === 0 ? 'Épuisé' : 'Réserver maintenant'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Horaires d'ouverture - Design moderne */}
      {showHoursModal && businessHours && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowHoursModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec dégradé */}
            <div className="relative bg-gradient-to-br from-primary-600 to-secondary-600 p-6">
              {/* Pattern décoratif */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Horaires d'ouverture</h3>
                    <p className="text-sm text-white/80 font-medium">{merchant.business_name || merchant.full_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHoursModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all group"
                  type="button"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Contenu des horaires */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {businessHours.map((dayInfo, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      dayInfo.isToday
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-300 shadow-md'
                        : 'bg-gray-50 border-2 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                        dayInfo.isToday
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {dayInfo.day}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${
                          dayInfo.isToday ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {dayInfo.day === 'Lun' && 'Lundi'}
                          {dayInfo.day === 'Mar' && 'Mardi'}
                          {dayInfo.day === 'Mer' && 'Mercredi'}
                          {dayInfo.day === 'Jeu' && 'Jeudi'}
                          {dayInfo.day === 'Ven' && 'Vendredi'}
                          {dayInfo.day === 'Sam' && 'Samedi'}
                          {dayInfo.day === 'Dim' && 'Dimanche'}
                        </div>
                        {dayInfo.isToday && (
                          <span className="text-xs text-primary-600 font-semibold">Aujourd'hui</span>
                        )}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      dayInfo.isClosed 
                        ? 'text-red-600' 
                        : dayInfo.isToday ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {dayInfo.hours}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info importante */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900 font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span>
                    Les horaires de retrait des lots peuvent être différents. Vérifiez les horaires spécifiques de chaque lot.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t-2 border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowHoursModal(false)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                type="button"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



