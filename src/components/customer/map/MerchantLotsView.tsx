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

      {/* Grille des lots - Image complète avec overlay détaillé au hover */}
      {merchant.lots.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">Aucun invendu disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {merchant.lots.map((lot) => {
            const availableQuantity = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
            const discountPercent = Math.round(((lot.original_price - lot.discounted_price) / lot.original_price) * 100);

            return (
              <div
                key={lot.id}
                className="group relative card overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => onReserveLot(lot)}
              >
                {/* Image plein format */}
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
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

                  {/* Badges fixes en haut */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                    {lot.is_urgent && (
                      <span className="inline-flex items-center gap-1 bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-xl animate-pulse border-2 border-white">
                        🔥 Urgent
                      </span>
                    )}
                    <span className="ml-auto bg-success-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-xl border-2 border-white">
                      -{discountPercent}%
                    </span>
                  </div>

                  {/* Prix simple en bas (toujours visible) */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <Euro className="w-4 h-4 text-primary-600" />
                      <span className="text-lg font-black text-primary-600">{lot.discounted_price}€</span>
                    </div>
                    <span className="bg-white/95 backdrop-blur-sm text-neutral-700 text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                      {lot.category}
                    </span>
                  </div>

                  {/* Overlay détaillé au hover - Apparaît par le bas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
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



