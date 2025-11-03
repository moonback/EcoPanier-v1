import { X, Trash2, AlertTriangle, Gift, Heart } from 'lucide-react';
import type { Lot } from './types';

interface DeleteLotModalProps {
  isOpen: boolean;
  lot: Lot | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onSuggestDon?: () => void;
}

export const DeleteLotModal = ({
  isOpen,
  lot,
  isProcessing,
  onConfirm,
  onCancel,
  onSuggestDon,
}: DeleteLotModalProps) => {
  if (!isOpen || !lot) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  const remainingQty = lot.quantity_total - lot.quantity_sold;
  const isEligibleForDon = !lot.is_free && remainingQty > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl animate-fade-in-up border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:bg-white/20 active:bg-white/30 rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold text-center">Supprimer ce lot ?</h3>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Info du lot */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-1">{lot.title}</p>
            <p className="text-xs text-gray-600">
              Quantité disponible : <strong>{remainingQty}</strong>
            </p>
          </div>

          {/* Avertissement gaspillage alimentaire */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" fill="currentColor" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-700 leading-relaxed font-semibold mb-2">
                  ⚠️ Gaspillage alimentaire
                </p>
                <p className="text-sm text-red-700 leading-relaxed">
                  Ce lot sera définitivement supprimé et ne pourra pas être distribué.
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Ces produits seront perdus et ne bénéficieront à personne.
                </p>
              </div>
            </div>
          </div>

          {/* Suggestion de passer en don */}
          {isEligibleForDon && onSuggestDon && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Heart className="w-5 h-5 text-green-600" fill="currentColor" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-700 leading-relaxed font-semibold mb-2">
                    💚 Alternative solidaire
                  </p>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Ce lot peut être passé en don et bénéficier à <strong className="text-green-800">{remainingQty} personne{remainingQty > 1 ? 's' : ''}</strong> dans le besoin.
                  </p>
                  <button
                    onClick={onSuggestDon}
                    className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" strokeWidth={2} />
                    <span>Passer en don plutôt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">
              Êtes-vous sûr de vouloir supprimer ce lot ?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cette action est irréversible et contribue au gaspillage alimentaire.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                <span>Supprimer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

