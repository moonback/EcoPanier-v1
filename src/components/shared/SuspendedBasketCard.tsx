import { MapPin, Clock, Heart, CheckCircle, AlertCircle, User, Package } from 'lucide-react';
import { formatCurrency, formatDateTime, getCategoryLabel } from '../../utils/helpers';
import type { SuspendedBasketWithDetails } from '../../utils/suspendedBasketService';

interface SuspendedBasketCardProps {
  basket: SuspendedBasketWithDetails;
  variant?: 'donor' | 'beneficiary' | 'available';
  onClaim?: (basketId: string) => void;
  onReserve?: (basketId: string) => void;
  claiming?: boolean;
}

/**
 * Composant carte pour afficher un panier suspendu
 * Variantes : donor (client qui a offert), beneficiary (bénéficiaire qui a récupéré), available (disponible)
 */
export function SuspendedBasketCard({
  basket,
  variant = 'available',
  onClaim,
  onReserve,
  claiming = false,
}: SuspendedBasketCardProps) {
  const getStatusStyles = () => {
    switch (basket.status) {
      case 'available':
        return {
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-700',
          label: 'Disponible',
        };
      case 'reserved':
        return {
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-700',
          label: 'Réservé',
        };
      case 'claimed':
        return {
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-700',
          label: 'Récupéré',
        };
      case 'expired':
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: 'Expiré',
        };
      default:
        return {
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-700',
          label: basket.status,
        };
    }
  };

  const statusStyles = getStatusStyles();
  const isAvailable = basket.status === 'available';
  const canInteract = isAvailable && variant === 'available' && !claiming;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${statusStyles.bg}`}>
      <div className="p-4">
        {/* En-tête avec montant et statut */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Heart size={18} className="text-accent-600 flex-shrink-0" />
              <h3 className="font-bold text-black text-base">
                Panier suspendu
              </h3>
            </div>
            <p className="text-2xl font-black text-accent-600 mt-1">
              {formatCurrency(basket.amount)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusStyles.badge}`}
          >
            {statusStyles.label}
          </span>
        </div>

        {/* Informations du lot */}
        {basket.lot ? (
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex gap-3">
              {basket.lot.image_urls && basket.lot.image_urls.length > 0 ? (
                <img
                  src={basket.lot.image_urls[0]}
                  alt={basket.lot.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate">{basket.lot.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{getCategoryLabel(basket.lot.category)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-black text-accent-600">
                    {formatCurrency(basket.lot.discounted_price)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(basket.lot.original_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0 text-gray-500" />
              <span className="font-semibold">{basket.merchant.business_name || basket.merchant.full_name}</span>
            </div>
            {basket.merchant.business_address && (
              <div className="flex items-start gap-2 text-xs text-gray-600 ml-6">
                <span className="truncate">{basket.merchant.business_address}</span>
              </div>
            )}
          </div>
        )}

        {/* Informations du commerçant */}
        <div className="space-y-2 text-sm text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0 text-gray-500" />
            <span className="text-xs">{basket.merchant.business_name || basket.merchant.full_name}</span>
          </div>
          {basket.lot && (
            <div className="flex items-center gap-2">
              <Clock size={14} strokeWidth={1.5} className="flex-shrink-0 text-gray-500" />
              <span className="text-xs">Retrait: {formatDateTime(basket.lot.pickup_start)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock size={14} strokeWidth={1.5} className="flex-shrink-0 text-gray-500" />
            <span className="text-xs">Créé le {formatDateTime(basket.created_at)}</span>
          </div>
        </div>

        {/* Informations selon la variante */}
        {variant === 'donor' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {basket.beneficiary ? (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-700">
                  Récupéré par <span className="font-semibold">{basket.beneficiary.full_name}</span>
                  {basket.claimed_at && (
                    <span className="text-xs text-gray-500 ml-1">
                      le {formatDateTime(basket.claimed_at)}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>En attente de récupération</span>
              </div>
            )}
          </div>
        )}

        {variant === 'beneficiary' && basket.beneficiary && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-accent-600 flex-shrink-0" />
              <span className="text-gray-700">
                Offert par <span className="font-semibold">{basket.donor.full_name}</span>
              </span>
            </div>
            {basket.claimed_at && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1 ml-6">
                <Clock size={12} />
                <span>Récupéré le {formatDateTime(basket.claimed_at)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes si présentes */}
        {basket.notes && (
          <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 italic">"{basket.notes}"</p>
          </div>
        )}

        {/* Actions pour les paniers disponibles */}
        {variant === 'available' && (
          <div className="mt-4 flex gap-2">
            {isAvailable && onReserve && (
              <button
                onClick={() => onReserve(basket.id)}
                disabled={!canInteract}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Réserver
              </button>
            )}
            {isAvailable && onClaim && (
              <button
                onClick={() => onClaim(basket.id)}
                disabled={!canInteract || claiming}
                className="flex-1 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Récupération...
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    Récupérer
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

