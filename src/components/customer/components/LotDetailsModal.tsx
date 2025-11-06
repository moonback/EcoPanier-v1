import { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Clock, 
  ShoppingCart, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight,
  Store,
  Mail,
  Phone,
  CheckCircle,
  Info,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
    business_type?: string | null;
    business_description?: string | null;
    business_email?: string | null;
    business_hours?: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
    phone?: string | null;
    verified?: boolean;
  };
};

interface LotDetailsModalProps {
  lot: Lot;
  onClose: () => void;
  onReserve: () => void;
  onMerchantClick?: () => void;
}

type TabId = 'product' | 'merchant' | 'details';

// Fonction pour formater les horaires d'ouverture
const formatBusinessHours = (
  businessHours: Record<string, { open: string | null; close: string | null; closed: boolean }> | null | undefined
): string => {
  if (!businessHours) return 'Non renseigné';

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const today = new Date().getDay();
  const todayKey = days[today === 0 ? 6 : today - 1];
  const todayHours = businessHours[todayKey];

  if (todayHours?.closed || !todayHours?.open || !todayHours?.close) {
    return 'Fermé aujourd\'hui';
  }

  return `Aujourd'hui: ${todayHours.open} - ${todayHours.close}`;
};

// Fonction pour obtenir le label du type de commerce
const getBusinessTypeLabel = (type: string | null | undefined): string => {
  if (!type) return '';
  
  const typeLabels: Record<string, string> = {
    bakery: 'Boulangerie',
    restaurant: 'Restaurant',
    supermarket: 'Supermarché',
    grocery: 'Épicerie',
    market: 'Marché',
    cafe: 'Café',
    patisserie: 'Pâtisserie',
    butcher: 'Boucherie',
    fishmonger: 'Poissonnerie',
    organic: 'Bio',
    other: 'Autre',
  };

  return typeLabels[type] || type;
};

export function LotDetailsModal({ lot, onClose, onReserve, onMerchantClick }: LotDetailsModalProps) {
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('product');
  
  const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const discount = Math.round(
    ((lot.original_price - lot.discounted_price) / lot.original_price) * 100
  );

  const hasMultipleImages = lot.image_urls && lot.image_urls.length > 1;
  const merchant = lot.profiles;

  const nextImage = () => {
    if (lot.image_urls && currentImageIndex < lot.image_urls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: typeof Package }> = [
    { id: 'product', label: 'Produit', icon: Package },
    { id: 'merchant', label: 'Commerçant', icon: Store },
    { id: 'details', label: 'Détails', icon: FileText },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec onglets */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="p-2 sm:p-3 lg:p-3 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Détails du lot</h2>
          <button
            onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation par onglets */}
          <div className="flex items-center gap-1 px-2 sm:px-3 lg:px-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={isActive ? 2 : 1.5} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
          </button>
              );
            })}
          </div>
        </div>

        {/* Contenu scrollable - Desktop: pas de scroll, Mobile: scroll */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden pb-20 sm:pb-6 lg:pb-0">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6 h-full lg:overflow-y-auto">
            {/* Onglet Produit */}
            {activeTab === 'product' && (
              <div className="animate-fade-in h-full flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 lg:h-auto">
                {/* Colonne gauche : Image */}
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-3">
                  <div className="relative aspect-[4/3] lg:aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 group flex-shrink-0">
              {lot.image_urls && lot.image_urls.length > 0 ? (
                <>
                  <img
                    src={lot.image_urls[currentImageIndex]}
                    alt={lot.title}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setShowImageZoom(true)}
                  />
                  
                  <button
                    onClick={() => setShowImageZoom(true)}
                          className="absolute bottom-2 right-2 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    aria-label="Zoomer sur l'image"
                  >
                          <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                  </button>

                  {hasMultipleImages && (
                    <>
                      {currentImageIndex > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 rounded-full backdrop-blur-sm transition-all shadow-lg"
                          aria-label="Image précédente"
                        >
                                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}
                      
                      {currentImageIndex < lot.image_urls.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600/90 hover:bg-primary-700 text-white p-1.5 rounded-full backdrop-blur-sm transition-all shadow-lg"
                          aria-label="Image suivante"
                        >
                                <ChevronRight className="w-4 h-4" strokeWidth={2} />
                        </button>
                      )}

                            <div className="absolute bottom-2 left-2 bg-primary-600/90 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm shadow-md">
                        {currentImageIndex + 1} / {lot.image_urls.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" strokeWidth={1} />
                </div>
              )}

                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                {lot.is_urgent && (
                        <span className="inline-flex items-center gap-1 bg-red-600/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                    🔥 Urgent
                  </span>
                )}
                      <span className="ml-auto bg-primary-600/95 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  -{discount}%
                </span>
              </div>
            </div>

                  {/* Caractéristiques */}
                  {lot.requires_cold_chain && (
                    <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-blue-700">
                          ❄️ Chaîne du froid requise
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne droite : Informations */}
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-3 lg:overflow-y-auto">
                  {/* Titre et catégorie */}
              <div>
                    <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 mb-2">
                  {lot.title}
                </h3>
                    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {lot.category}
                </span>
              </div>

              {/* Description */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" strokeWidth={1.5} />
                  Description
                </h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4 lg:line-clamp-none">
                  {lot.description}
                </p>
              </div>

                  {/* Informations principales en grille compacte */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Prix */}
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-50 via-white to-secondary-50/50 rounded-lg border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1">
                        <span className="text-primary-600 text-xs">💰</span>
                        <span className="hidden sm:inline">Prix</span>
                  </h4>
                      <div className="space-y-1">
                        <div className="text-gray-400 line-through text-xs sm:text-sm font-bold">
                        {lot.original_price}€
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-primary-700">
                          {lot.discounted_price}€
                        </div>
                        <div className="text-[9px] sm:text-xs text-gray-600">
                          -{discount}%
                        </div>
                      </div>
                    </div>

                    {/* Disponibilité */}
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 hover:shadow-md transition-shadow">
                      <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1">
                        <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-600" strokeWidth={1.5} />
                        <span className="hidden sm:inline">Stock</span>
                      </h4>
                      <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-primary-700">
                        {availableQty}
                        <span className="text-sm sm:text-base font-normal text-gray-500">/{lot.quantity_total}</span>
                      </div>
                      <div className="text-[9px] sm:text-xs text-gray-600 mt-1">
                        {availableQty === 0 ? 'Épuisé' : 'Dispo'}
                      </div>
                    </div>

                    {/* Retrait */}
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-secondary-50 to-white rounded-lg border border-secondary-100 hover:shadow-md transition-shadow">
                      <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary-600" strokeWidth={1.5} />
                        <span className="hidden sm:inline">Retrait</span>
                      </h4>
                      <div className="text-sm sm:text-base font-bold text-secondary-700 mb-0.5">
                        {format(new Date(lot.pickup_start), 'dd MMM', { locale: fr })}
                      </div>
                      <div className="text-[9px] sm:text-xs text-gray-600">
                        {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}-{format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Commerçant */}
            {activeTab === 'merchant' && (
              <div className="animate-fade-in h-full flex flex-col lg:grid lg:grid-cols-2 lg:gap-4 lg:h-auto">
                {/* Colonne gauche : En-tête et description */}
                <div className="flex flex-col gap-3">
                  {/* En-tête commerçant */}
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-200">
                      {merchant.business_logo_url ? (
                        <img
                          src={merchant.business_logo_url}
                          alt={merchant.business_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Store className={`w-6 h-6 sm:w-8 sm:h-8 text-primary-500 ${merchant.business_logo_url ? 'hidden' : ''}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                          {merchant.business_name}
                        </h3>
                        {merchant.verified && (
                          <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                            <CheckCircle className="w-2.5 h-2.5" strokeWidth={2} />
                            <span className="hidden sm:inline">Vérifié</span>
                          </span>
                        )}
                      </div>
                      {merchant.business_type && (
                        <span className="inline-block bg-primary-100 text-primary-700 text-[10px] px-2 py-0.5 rounded-full font-medium mb-1">
                          {getBusinessTypeLabel(merchant.business_type)}
                        </span>
                      )}
                      <div className="text-xs sm:text-sm text-gray-600 flex items-start gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500 mt-0.5" strokeWidth={1.5} />
                        <span className="line-clamp-2">{merchant.business_address}</span>
                      </div>
                      {onMerchantClick && (
                        <button
                          onClick={onMerchantClick}
                          className="mt-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
                        >
                          Voir tous les produits →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {merchant.business_description && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div className="flex-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">À propos</h4>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-6 lg:line-clamp-none">
                            {merchant.business_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colonne droite : Informations de contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                  {merchant.business_hours && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-secondary-100 rounded-lg">
                          <Clock className="w-4 h-4 text-secondary-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Horaires</h4>
                          <p className="text-xs sm:text-sm text-gray-700">
                            {formatBusinessHours(merchant.business_hours)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {merchant.business_email && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary-100 rounded-lg">
                          <Mail className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Email</h4>
                          <a 
                            href={`mailto:${merchant.business_email}`}
                            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 hover:underline break-all"
                          >
                            {merchant.business_email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {merchant.phone && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary-100 rounded-lg">
                          <Phone className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Téléphone</h4>
                          <a 
                            href={`tel:${merchant.phone}`}
                            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {merchant.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Détails */}
            {activeTab === 'details' && (
              <div className="animate-fade-in h-full flex flex-col lg:grid lg:grid-cols-2 lg:gap-4 lg:h-auto">
                {/* Colonne gauche */}
                <div className="flex flex-col gap-3">
                  {/* Informations générales */}
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                      Informations générales
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Catégorie</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{lot.category}</div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Statut</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 capitalize">{lot.status}</div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Quantité totale</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{lot.quantity_total}</div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Disponibilité</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{availableQty}</div>
                      </div>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                      Caractéristiques
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Chaîne du froid</span>
                        <span className={`text-xs sm:text-sm font-medium ${lot.requires_cold_chain ? 'text-blue-600' : 'text-gray-400'}`}>
                          {lot.requires_cold_chain ? 'Oui ❄️' : 'Non'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Lot urgent</span>
                        <span className={`text-xs sm:text-sm font-medium ${lot.is_urgent ? 'text-red-600' : 'text-gray-400'}`}>
                          {lot.is_urgent ? 'Oui 🔥' : 'Non'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Lot gratuit</span>
                        <span className={`text-xs sm:text-sm font-medium ${lot.is_free ? 'text-green-600' : 'text-gray-400'}`}>
                          {lot.is_free ? 'Oui 🎁' : 'Non'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="flex flex-col gap-3">
                  {/* Informations de retrait */}
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                      Informations de retrait
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Date de début</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {format(new Date(lot.pickup_start), 'dd MMM yyyy', { locale: fr })} à {format(new Date(lot.pickup_start), 'HH:mm', { locale: fr })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Date de fin</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {format(new Date(lot.pickup_end), 'dd MMM yyyy', { locale: fr })} à {format(new Date(lot.pickup_end), 'HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prix détaillé */}
                  <div className="p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-primary-600">💰</span>
                      Détails des prix
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Prix original</span>
                        <span className="text-sm font-bold text-gray-400 line-through">{lot.original_price}€</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-700">Prix réduit</span>
                        <span className="text-lg font-bold text-primary-700">{lot.discounted_price}€</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-primary-100 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Économie</span>
                        <span className="text-sm sm:text-base font-bold text-primary-700">
                          {(lot.original_price - lot.discounted_price).toFixed(2)}€ ({discount}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton d'action flottant */}
        <div className="fixed bottom-16 left-4 right-4 sm:sticky sm:bottom-0 sm:left-0 sm:right-0 p-3 sm:p-4 lg:p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-[100] flex-shrink-0">
          <button
            onClick={onReserve}
            disabled={availableQty === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-base transition-all ${
              availableQty === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl hover:shadow-2xl'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            {availableQty === 0 ? 'Épuisé' : 'Réserver ce panier'}
          </button>
        </div>
      </div>

      {/* Modal Zoom Image Plein Écran */}
      {showImageZoom && lot.image_urls && lot.image_urls.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Fermer le zoom"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </button>

          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={lot.image_urls[currentImageIndex]}
              alt={lot.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {hasMultipleImages && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
                  </button>
                )}
                
                {currentImageIndex < lot.image_urls.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-4 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2} />
                  </button>
                )}

                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm text-xs sm:text-sm font-medium">
                  {currentImageIndex + 1} / {lot.image_urls.length}
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-black/50 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
              {lot.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    index === currentImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${lot.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
