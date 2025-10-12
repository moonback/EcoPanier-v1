import { useState } from 'react';
import { ChevronLeft, Store, MapPin, Navigation, Package, Euro, Clock, ShoppingCart, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDistance } from '../../../utils/geocodingService';
import type { MerchantWithLots, LotBase } from './types';

interface MerchantLotsViewProps {
  merchant: MerchantWithLots;
  onBack: () => void;
  onReserveLot: (lot: LotBase) => void;
}

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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header avec retour - Compact */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200 hover:border-primary-300 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Retour</span>
          </button>

          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-neutral-900 truncate">
              {merchant.business_name || merchant.full_name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{merchant.business_address || merchant.address}</span>
              {merchant.distance && (
                <span className="flex items-center gap-1 text-primary-600 font-medium flex-shrink-0">
                  <Navigation className="w-3 h-3" />
                  {formatDistance(merchant.distance)}
                </span>
              )}
            </div>
          </div>

          {/* Bouton horaires */}
          {businessHours && (
            <button
              onClick={() => setShowHoursModal(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg border border-primary-200 hover:border-primary-300 transition-all duration-200"
            >
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm hidden sm:inline">Horaires</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats du commerçant - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-primary-600">{merchant.lots.length}</div>
          <div className="text-xs text-neutral-600 font-medium">Invendus</div>
        </div>
        <div className="card p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-success-600">
            {merchant.lots.reduce((sum, l) => sum + (l.quantity_total - l.quantity_reserved - l.quantity_sold), 0)}
          </div>
          <div className="text-xs text-neutral-600 font-medium">Unités</div>
        </div>
        <div className="card p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-accent-600">{merchant.lots.filter(l => l.is_urgent).length}</div>
          <div className="text-xs text-neutral-600 font-medium">Urgents</div>
        </div>
      </div>

      {/* Grille des lots - Mobile: 1 colonne, Desktop: grille responsive */}
      {merchant.lots.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Aucun invendu disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4
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
          {merchant.lots.map((lot) => {
            const availableQuantity = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
            const discountPercent = Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100);

            return (
              <div
                key={lot.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300
                  /* Mobile : Carte simple avec ombre mobile */
                  shadow-mobile-card active:scale-[0.98] 
                  /* Desktop : Effet hover élégant */
                  md:card md:hover:shadow-2xl md:hover:-translate-y-1"
                onClick={() => onReserveLot(lot)}
              >
                {/* Image - Responsive aspect ratio */}
                <div className="relative w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200
                  /* Mobile : Format paysage compact */
                  aspect-[4/3]
                  /* Desktop : Format portrait élégant */
                  md:aspect-[3/4]">
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

                  {/* Badges en haut - Responsive sizing */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                    {lot.is_urgent && (
                      <span className="inline-flex items-center gap-1 bg-accent-500 text-white font-bold shadow-mobile-raised animate-pulse border-2 border-white
                        /* Mobile : Badge plus petit */
                        text-[10px] px-1.5 py-0.5 rounded-full
                        /* Desktop : Badge standard */
                        md:text-xs md:px-2 md:py-1">
                        🔥 Urgent
                      </span>
                    )}
                    <span className="ml-auto bg-success-500 text-white font-bold shadow-mobile-raised border-2 border-white
                      /* Mobile : Badge plus petit */
                      text-[10px] px-1.5 py-0.5 rounded-full
                      /* Desktop : Badge standard */
                      md:text-xs md:px-2 md:py-1">
                      -{discountPercent}%
                    </span>
                  </div>

                  {/* Prix - Responsive */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                    
                    <span className="bg-white/95 backdrop-blur-sm text-neutral-700 font-medium shadow-mobile-raised rounded-full
                      /* Mobile : Catégorie compacte */
                      text-[10px] px-1.5 py-0.5
                      /* Desktop : Catégorie standard */
                      md:text-xs md:px-2 md:py-1">
                      {lot.category}
                    </span>
                  </div>

                  {/* Overlay détaillé - Desktop uniquement (hover) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-transform duration-300 ease-out z-20
                    /* Mobile : Caché */
                    hidden
                    /* Desktop : Visible au hover */
                    md:block md:translate-y-full md:group-hover:translate-y-0">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-3">
                      {/* Titre */}
                      <h3 className="font-bold text-lg line-clamp-2">
                        {lot.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-white/90 line-clamp-2">
                        {lot.description}
                      </p>

                      {/* Prix détaillé */}
                      <div className="flex items-center justify-between py-2 px-3 bg-white/10 backdrop-blur-sm rounded-lg">
                        <div>
                          <div className="text-xs text-white/70">Prix initial</div>
                          <div className="text-white/80 line-through font-medium">{lot.original_price}€</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/70">Prix réduit</div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-5 h-5" />
                            <span className="text-2xl font-black">{lot.discounted_price}€</span>
                          </div>
                        </div>
                      </div>

                      {/* Infos détaillées */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <span>
                            <span className="font-bold">{availableQuantity}</span> unités disponibles
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>
                            Retrait : {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {/* Bouton réserver dans l'overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReserveLot(lot);
                        }}
                        disabled={availableQuantity === 0}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                          availableQuantity === 0
                            ? 'bg-white/20 text-white/50 cursor-not-allowed'
                            : 'bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {availableQuantity === 0 ? 'Épuisé' : 'Réserver maintenant'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenu mobile - Affiché sous l'image sur mobile uniquement */}
                <div className="md:hidden p-3 space-y-3 bg-white">
                  {/* Titre */}
                  <h3 className="font-bold text-sm line-clamp-2 text-neutral-900">
                    {lot.title}
                  </h3>

                  {/* Prix comparatif */}
                  <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase font-medium">Prix initial</div>
                      <div className="text-sm text-neutral-600 line-through font-medium">{lot.original_price}€</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-primary-600 uppercase font-medium">Prix réduit</div>
                      <div className="flex items-center gap-0.5">
                        <Euro className="w-4 h-4 text-primary-600" />
                        <span className="text-xl font-black text-primary-600">{lot.discounted_price}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Infos compactes */}
                  <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 flex-shrink-0" />
                      <span><span className="font-bold text-neutral-900">{availableQuantity}</span> dispo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })} - {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* Bouton tactile - Mobile optimized */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReserveLot(lot);
                    }}
                    disabled={availableQuantity === 0}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg font-bold transition-all
                      /* Taille tactile optimale (min 44px) */
                      py-3 text-sm
                      /* Feedback tactile */
                      active:scale-95
                      ${
                        availableQuantity === 0
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white shadow-mobile-raised active:shadow-mobile-card'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {availableQuantity === 0 ? 'Épuisé' : 'Réserver maintenant'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Horaires d'ouverture */}
      {showHoursModal && businessHours && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowHoursModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">Horaires d'ouverture</h3>
                  <p className="text-sm text-neutral-600">{merchant.business_name || merchant.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHoursModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-neutral-600" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="space-y-3">
                {businessHours.map((dayInfo, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      dayInfo.isToday
                        ? 'bg-primary-50 border-primary-300 shadow-sm'
                        : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                        dayInfo.isToday
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {dayInfo.day}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${
                          dayInfo.isToday ? 'text-primary-700' : 'text-neutral-700'
                        }`}>
                          {dayInfo.day === 'Lun' && 'Lundi'}
                          {dayInfo.day === 'Mar' && 'Mardi'}
                          {dayInfo.day === 'Mer' && 'Mercredi'}
                          {dayInfo.day === 'Jeu' && 'Jeudi'}
                          {dayInfo.day === 'Ven' && 'Vendredi'}
                          {dayInfo.day === 'Sam' && 'Samedi'}
                          {dayInfo.day === 'Dim' && 'Dimanche'}
                          {dayInfo.isToday && <span className="ml-2 text-primary-500">• Aujourd'hui</span>}
                        </div>
                        <div className={`text-xs ${
                          dayInfo.isToday ? 'text-primary-600' : 'text-neutral-500'
                        }`}>
                          {dayInfo.isClosed ? 'Magasin fermé' : 'Ouvert'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${
                      dayInfo.isClosed ? 'text-neutral-400' : dayInfo.isToday ? 'text-primary-700 font-bold' : 'text-neutral-700 font-semibold'
                    }`}>
                      {dayInfo.hours}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info supplémentaire */}
              <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <p className="text-sm text-primary-700 font-medium">
                  💡 Les horaires de retrait des lots peuvent différer des horaires d'ouverture. Vérifiez bien les heures indiquées sur chaque lot.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => setShowHoursModal(false)}
                className="w-full btn-primary rounded-xl"
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



