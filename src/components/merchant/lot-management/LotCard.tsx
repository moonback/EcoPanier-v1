import { Edit, Trash2, Package, Gift } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '../../../utils/helpers';
import type { Lot } from './types';

interface LotCardProps {
  lot: Lot;
  onEdit: (lot: Lot) => void;
  onDelete: (id: string) => void;
  onMakeFree: (lot: Lot) => void;
  isSelected?: boolean;
  onSelect?: (lotId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export const LotCard = ({ 
  lot, 
  onEdit, 
  onDelete, 
  onMakeFree, 
  isSelected = false, 
  onSelect, 
  selectionMode = false 
}: LotCardProps) => {
  const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  const isOutOfStock = availableQty <= 0;
  const discount = lot.original_price > 0 ? Math.round((1 - lot.discounted_price / lot.original_price) * 100) : 0;

  return (
    <div
      className={`group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 ${
        isOutOfStock ? 'opacity-60' : ''
      } ${
        isSelected ? 'border-primary-500 ring-2 ring-primary-200 shadow-md' : 'border-gray-200'
      }`}
    >
      {/* Image avec overlay */}
      <div className="relative overflow-hidden">
        {/* Image */}
        <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200">
          {lot.image_urls.length > 0 ? (
            <img
              src={lot.image_urls[0]}
              alt={lot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package size={36} className="text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Checkbox de sélection */}
        {selectionMode && onSelect && (
          <div className="absolute top-2 left-2 z-20">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(lot.id, e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Badges haut gauche */}
        <div className={`absolute ${selectionMode && onSelect ? 'top-2 left-10' : 'top-2 left-2'} flex flex-col gap-1.5 z-10`}>
          {/* Catégorie */}
          <span className="inline-flex items-center px-2 py-0.5 bg-white/75 backdrop-blur-sm text-[9px] font-bold text-gray-800 rounded shadow-md border border-white/30 uppercase tracking-wide">
            {getCategoryLabel(lot.category)}
          </span>

          {/* Urgent */}
          {lot.is_urgent && (
            <div className="relative group/urgent">
              <span className="inline-flex items-center justify-center w-6 h-6 text-base animate-pulse drop-shadow-lg cursor-help">
                ⚡
              </span>
              <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/urgent:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Produit urgent
                </div>
              </div>
            </div>
          )}

          {/* Chaîne du froid */}
          {lot.requires_cold_chain && (
            <div className="relative group/cold">
              <span className="inline-flex items-center justify-center w-6 h-6 text-base drop-shadow-lg cursor-help">
                ❄️
              </span>
              <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/cold:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Chaîne du froid
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge Don */}
        {lot.discounted_price === 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-accent-500 to-pink-500 text-white rounded-lg text-[10px] font-bold shadow-lg backdrop-blur-sm border border-white/20">
              <span className="text-xs">❤️</span>
              <span>Don</span>
            </span>
          </div>
        )}

        {/* Badge réduction */}
        {discount > 0 && !isOutOfStock && lot.discounted_price > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="relative group/badge">
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-green-400/90 via-green-500/90 to-green-600/90 backdrop-blur-sm rounded-full shadow-md">
                <span className="text-white font-black text-[10px]">-{discount}%</span>
              </div>
              <div className="absolute top-full right-0 mt-1.5 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-2 py-1 rounded text-[9px] font-semibold whitespace-nowrap shadow-lg">
                  Économie: {formatCurrency(lot.original_price - lot.discounted_price)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge épuisé */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-20">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded shadow-lg">
                <span className="text-sm">❌</span>
                Épuisé
              </span>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
              style={{ width: `${(availableQty / lot.quantity_total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-2.5">
        {/* Titre et prix */}
        <div className="mb-1.5">
          <h3 className="text-[13px] font-bold text-gray-900 line-clamp-1 mb-0.5">{lot.title}</h3>
          <div className="flex items-baseline gap-1.5">
            {lot.discounted_price === 0 ? (
              <span className="text-base font-bold text-green-600">
                Gratuit
              </span>
            ) : (
              <>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(lot.discounted_price)}
                </span>
                {lot.original_price > lot.discounted_price && (
                  <span className="text-[10px] text-gray-400 line-through">
                    {formatCurrency(lot.original_price)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0.5 mb-2 text-center">
          <div className="bg-gray-50 rounded py-1 px-0.5">
            <div className="text-[10px] font-bold text-gray-900">{lot.quantity_total}</div>
            <div className="text-[8px] text-gray-500">Total</div>
          </div>
          <div className="bg-orange-50 rounded py-1 px-0.5">
            <div className="text-[10px] font-bold text-orange-700">{lot.quantity_reserved}</div>
            <div className="text-[8px] text-orange-600">Réservé</div>
          </div>
          <div className="bg-green-50 rounded py-1 px-0.5">
            <div className="text-[10px] font-bold text-green-700">{lot.quantity_sold}</div>
            <div className="text-[8px] text-green-600">Vendu</div>
          </div>
          <div
            className={`rounded py-1 px-0.5 ${availableQty > 0 ? 'bg-blue-50' : 'bg-red-50'}`}
          >
            <div
              className={`text-[10px] font-bold ${
                availableQty > 0 ? 'text-blue-700' : 'text-red-700'
              }`}
            >
              {availableQty}
            </div>
            <div className={`text-[8px] ${availableQty > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Dispo
            </div>
          </div>
        </div>

        {/* Message suppression auto */}
        {isOutOfStock && (
          <div className="mb-1.5 p-1 bg-amber-50 border border-amber-200 rounded">
            <p className="text-[9px] text-amber-700 text-center font-medium">
              ⏱️ Suppression auto dans 24h
            </p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-1.5">
          {!lot.is_free && availableQty > 0 && (
            <button
              onClick={() => onMakeFree(lot)}
              className="flex-1 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all flex items-center justify-center gap-1 text-xs font-semibold"
              title="Passer en gratuit pour les bénéficiaires"
            >
              <Gift size={12} strokeWidth={2} />
              <span>Gratuit</span>
            </button>
          )}
          
          <button
            onClick={() => onEdit(lot)}
            className="flex-1 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all flex items-center justify-center gap-1 text-xs font-semibold"
          >
            <Edit size={12} strokeWidth={2} />
            <span>Modifier</span>
          </button>
          <button
            onClick={() => onDelete(lot.id)}
            className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 transition-all"
            aria-label="Supprimer le lot"
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

