import { useState, useMemo } from 'react';
import { ChevronLeft, Store, MapPin, Navigation, Package, Euro, Clock, ShoppingCart, X, TrendingDown, Flame, Filter, SortAsc, Phone, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDistance } from '../../../utils/geocodingService';
import type { MerchantWithLots, LotBase } from './types';

interface MerchantLotsViewProps {
  merchant: MerchantWithLots;
  onBack: () => void;
  onReserveLot: (lot: LotBase) => void;
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

export function MerchantLotsView({ merchant, onBack, onReserveLot }: MerchantLotsViewProps) {
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
    <div className="space-y-3 animate-fade-in pb-4">
      {/* Header compact avec retour */}
      <div className="card p-0 overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Bandeau gradient compact avec pattern animé */}
        <div className="relative h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
          {/* Pattern décoratif animé */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse-soft animation-delay-300" />
          </div>

          {/* Bouton Retour compact */}
          <button
            onClick={onBack}
            className="absolute top-2 left-2 z-20 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:scale-105 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 shadow-lg active:scale-95"
            aria-label="Retour à la liste des commerçants"
            type="button"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs">Retour</span>
          </button>

          {/* Distance badge compact */}
          {merchant.distance && (
            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg animate-fade-in">
              <Navigation className="w-3 h-3" />
              <span className="text-xs font-bold">{formatDistance(merchant.distance)}</span>
            </div>
          )}
        </div>

        {/* Contenu principal compact */}
        <div className="px-3 pb-3 -mt-8 relative z-10">
          {/* Logo commerçant compact - Superposé sur le bandeau */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16  rounded-2xl flex items-center justify-center shadow-xl border-3 border-white hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer overflow-hidden">
              {merchant.business_logo_url ? (
                <img
                  src={merchant.business_logo_url}
                  alt={merchant.business_name || merchant.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback vers l'icône si l'image ne charge pas
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Store className={`w-8 h-8 text-white ${merchant.business_logo_url ? 'hidden' : ''}`} />
            </div>
          </div>

          {/* Identité du commerce compact */}
          <div className="text-center mb-2 space-y-1">
            <h2 className="text-lg font-bold text-neutral-900 px-2 line-clamp-2 animate-fade-in-up">
              {merchant.business_name || merchant.full_name}
            </h2>
            <div className="flex justify-center items-center gap-1.5 text-xs text-neutral-600 px-2 animate-fade-in-up animation-delay-100">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-500" />
              <span className="line-clamp-1">{merchant.business_address || merchant.address}</span>
            </div>
            
            {/* Téléphone si disponible */}
            {merchant.phone && (
              <a 
                href={`tel:${merchant.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-all duration-200 hover:scale-105 animate-fade-in-up animation-delay-200"
              >
                <Phone className="w-3.5 h-3.5" />
                {merchant.phone}
              </a>
            )}
          </div>

          {/* Boutons d'action compact */}
          <div className="flex justify-center gap-2 mb-2">
            {businessHours && (
              <button
                onClick={() => setShowHoursModal(true)}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-xs animate-fade-in-up animation-delay-300"
                type="button"
                aria-label="Afficher les horaires d'ouverture"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold">
                  Horaires
                </span>
                {/* Statut ouvert/fermé du jour */}
                {(() => {
                  const today = businessHours.find((h) => h.isToday);
                  if (!today) return null;
                  return (
                    <span
                      className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse ${
                        today.isClosed 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
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

      {/* Stats enrichies du commerçant - Compact et animé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Nombre de lots */}
        <div className="card p-3 text-center hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-xl font-black text-primary-600 group-hover:scale-110 transition-transform duration-300">{merchant.lots.length}</div>
          <div className="text-[10px] text-neutral-600 font-semibold uppercase">Invendus</div>
        </div>

        {/* Unités disponibles */}
        <div className="card p-3 text-center hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up animation-delay-100">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gradient-to-br from-success-100 to-success-200 rounded-lg flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
            <ShoppingCart className="w-5 h-5 text-success-600" />
          </div>
          <div className="text-xl font-black text-success-600 group-hover:scale-110 transition-transform duration-300">{stats.totalUnits}</div>
          <div className="text-[10px] text-neutral-600 font-semibold uppercase">Unités dispo</div>
        </div>

        {/* Lots urgents */}
        <div className="card p-3 text-center hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up animation-delay-200">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
            <Flame className="w-5 h-5 text-accent-600 group-hover:animate-pulse" />
          </div>
          <div className="text-xl font-black text-accent-600 group-hover:scale-110 transition-transform duration-300">{stats.urgentLots}</div>
          <div className="text-[10px] text-neutral-600 font-semibold uppercase">Urgents</div>
        </div>

        {/* Économies potentielles */}
        <div className="card p-3 text-center hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in-up animation-delay-300">
          <div className="w-10 h-10 mx-auto mb-1.5 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
            <TrendingDown className="w-5 h-5 text-secondary-600" />
          </div>
          <div className="text-xl font-black text-secondary-600 group-hover:scale-110 transition-transform duration-300">{stats.totalSavings.toFixed(0)}€</div>
          <div className="text-[10px] text-neutral-600 font-semibold uppercase">Économies</div>
        </div>
      </div>

      {/* Barre de filtres et tri - Compact */}
      <div className="card p-3 space-y-2 animate-fade-in-up animation-delay-400">
        {/* Titre et toggle filtres */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary-600 animate-pulse-soft" />
            <span className="text-sm">{filteredAndSortedLots.length} lot{filteredAndSortedLots.length > 1 ? 's' : ''}</span>
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 ${
              showFilters ? 'bg-primary-100 text-primary-700 border-primary-300 shadow-md scale-105' : ''
            }`}
            type="button"
          >
            <Filter className={`w-3.5 h-3.5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            <span className="text-xs font-semibold hidden sm:inline">Filtres</span>
          </button>
        </div>

        {/* Panneau de filtres et tri (collapsible) - Compact */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-neutral-200 animate-fade-in-up">
            {/* Filtres rapides */}
            <div>
              <label className="text-[10px] font-bold text-neutral-700 mb-1.5 block uppercase tracking-wider">Filtrer par</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    filterBy === 'all'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Tous ({merchant.lots.length})
                </button>
                <button
                  onClick={() => setFilterBy('urgent')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    filterBy === 'urgent'
                      ? 'bg-accent-600 text-white shadow-md scale-105 animate-pulse'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  🔥 Urgents ({stats.urgentLots})
                </button>
                <button
                  onClick={() => setFilterBy('available')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    filterBy === 'available'
                      ? 'bg-success-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Disponibles ({merchant.lots.filter(l => (l.quantity_total - l.quantity_reserved - l.quantity_sold) > 0).length})
                </button>
              </div>
            </div>

            {/* Options de tri */}
            <div>
              <label className="text-[10px] font-bold text-neutral-700 mb-1.5 block flex items-center gap-1.5 uppercase tracking-wider">
                <SortAsc className="w-3 h-3" />
                Trier par
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                <button
                  onClick={() => setSortBy('urgent')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    sortBy === 'urgent'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Urgence
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    sortBy === 'price-asc'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Prix ↑
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    sortBy === 'price-desc'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Prix ↓
                </button>
                <button
                  onClick={() => setSortBy('discount')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    sortBy === 'discount'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  type="button"
                >
                  Réduction
                </button>
                <button
                  onClick={() => setSortBy('quantity')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    sortBy === 'quantity'
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
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
                className="group relative overflow-hidden cursor-pointer rounded-xl
                  /* Mobile : Carte simple avec ombre mobile */
                  shadow-mobile-card active:scale-[0.98] 
                  /* Desktop : Effet hover élégant et animé */
                  md:card md:hover:shadow-2xl md:hover:-translate-y-2 md:hover:scale-[1.02]
                  transition-all duration-500 ease-out
                  /* Animation d'apparition */
                  animate-fade-in-up"
                onClick={() => onReserveLot(lot)}
              >
                {/* Image - Responsive aspect ratio compact */}
                <div className="relative w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200
                  /* Mobile : Format carré compact */
                  aspect-square
                  /* Desktop : Format portrait compact */
                  md:aspect-[4/5]">
                  {lot.image_urls && lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-neutral-400" />
                    </div>
                  )}

                  {/* Badges en haut - Compact et animé */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between z-10">
                    {lot.is_urgent && (
                      <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-extrabold shadow-lg animate-pulse border border-white/50
                        text-[9px] px-1.5 py-0.5 rounded-full
                        md:text-[10px] md:px-2 md:py-0.5
                        hover:scale-110 transition-transform duration-300">
                        🔥 Urgent
                      </span>
                    )}
                    <span className="ml-auto bg-gradient-to-r from-success-500 to-success-600 text-white font-extrabold shadow-lg border border-white/50
                      text-[9px] px-1.5 py-0.5 rounded-full
                      md:text-[10px] md:px-2 md:py-0.5
                      hover:scale-110 transition-transform duration-300">
                      -{discountPercent}%
                    </span>
                  </div>

                  {/* Catégorie - Responsive compact */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between z-10">
                    <span className="bg-white/95 backdrop-blur-sm text-neutral-700 font-bold shadow-md rounded-full
                      text-[9px] px-1.5 py-0.5
                      md:text-[10px] md:px-2 md:py-0.5
                      hover:scale-105 transition-transform duration-300">
                      {lot.category}
                    </span>
                  </div>

                  {/* Overlay détaillé - Desktop uniquement (hover) - Compact */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-500 ease-out z-20
                    /* Mobile : Caché */
                    hidden
                    /* Desktop : Visible au hover avec animation */
                    md:block md:translate-y-full md:group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white space-y-2">
                      {/* Titre */}
                      <h3 className="font-bold text-base line-clamp-2 animate-fade-in-up">
                        {lot.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-white/90 line-clamp-2 animate-fade-in-up animation-delay-100">
                        {lot.description}
                      </p>

                      {/* Prix détaillé compact */}
                      <div className="flex items-center justify-between py-1.5 px-2.5 bg-white/10 backdrop-blur-sm rounded-lg animate-fade-in-up animation-delay-200">
                        <div>
                          <div className="text-[9px] text-white/70 uppercase font-semibold">Prix initial</div>
                          <div className="text-sm text-white/80 line-through font-medium">{lot.original_price}€</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-white/70 uppercase font-semibold">Prix réduit</div>
                          <div className="flex items-center gap-0.5">
                            <span className="text-xl font-black">{lot.discounted_price}€</span>
                          </div>
                        </div>
                      </div>

                      {/* Infos détaillées compact */}
                      <div className="space-y-1.5 animate-fade-in-up animation-delay-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <Package className="w-3 h-3" />
                          </div>
                          <span>
                            <span className="font-bold">{availableQuantity}</span> unités dispo
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3 h-3" />
                          </div>
                          <span>
                            {format(new Date(lot.pickup_start), 'EEE dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {/* Bouton réserver dans l'overlay - Compact */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReserveLot(lot);
                        }}
                        disabled={availableQuantity === 0}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all duration-300 animate-fade-in-up animation-delay-400 ${
                          availableQuantity === 0
                            ? 'bg-white/20 text-white/50 cursor-not-allowed'
                            : 'bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {availableQuantity === 0 ? 'Épuisé' : 'Réserver'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenu mobile - Ultra compact */}
                <div className="md:hidden p-2 space-y-1.5 bg-white">
                  {/* Titre compact */}
                  <h3 className="font-bold text-xs line-clamp-2 text-neutral-900 leading-tight">
                    {lot.title}
                  </h3>

                  {/* Prix comparatif ultra compact */}
                  <div className="flex items-center justify-between py-1.5 px-2 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
                    <div>
                      <div className="text-[8px] text-neutral-500 uppercase font-bold tracking-wide">Initial</div>
                      <div className="text-xs text-neutral-600 line-through font-semibold">{lot.original_price}€</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-primary-600 uppercase font-bold tracking-wide">Réduit</div>
                      <div className="flex items-center gap-0.5">
                        <Euro className="w-3.5 h-3.5 text-primary-600" />
                        <span className="text-lg font-black text-primary-600">{lot.discounted_price}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Infos ultra compactes */}
                  <div className="flex flex-col gap-1 text-[10px] text-neutral-600">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 flex-shrink-0 text-primary-600" />
                        <span><span className="font-extrabold text-neutral-900">{availableQuantity}</span> dispo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0 text-primary-600" />
                      <span className="font-medium">
                        {format(new Date(lot.pickup_start), 'EEE dd/MM', { locale: fr })} • {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* Bouton tactile compact - Mobile optimized */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserveLot(lot);
                    }}
                    disabled={availableQuantity === 0}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-lg font-bold transition-all duration-300
                      /* Taille tactile optimale */
                      py-2.5 text-xs
                      /* Feedback tactile */
                      active:scale-95
                      ${
                        availableQuantity === 0
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg active:shadow-md hover:from-primary-700 hover:to-primary-800'
                      }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {availableQuantity === 0 ? 'Épuisé' : 'Réserver'}
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



