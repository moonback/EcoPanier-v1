import { X, Gift, Heart } from 'lucide-react';

interface BulkMakeFreeModalProps {
  isOpen: boolean;
  selectedCount: number;
  eligibleCount: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkMakeFreeModal = ({
  isOpen,
  selectedCount,
  eligibleCount,
  isProcessing,
  onConfirm,
  onCancel,
}: BulkMakeFreeModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  const ineligibleCount = selectedCount - eligibleCount;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl animate-fade-in-up border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden">
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
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold text-center">Passer les lots en don ?</h3>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6 space-y-4">
          {eligibleCount > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Heart className="w-5 h-5 text-green-600" fill="currentColor" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-700 leading-relaxed">
                    <strong className="text-green-800">{eligibleCount} lot{eligibleCount > 1 ? 's' : ''}</strong> {eligibleCount > 1 ? 'seront passés' : 'sera passé'} en gratuit et offert{eligibleCount > 1 ? 's' : ''} aux bénéficiaires. 💚
                  </p>
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Les réservations en attente seront annulées automatiquement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {ineligibleCount > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <strong className="text-amber-800">{ineligibleCount} lot{ineligibleCount > 1 ? 's' : ''}</strong> {ineligibleCount > 1 ? 'ne peuvent pas' : 'ne peut pas'} être passé{ineligibleCount > 1 ? 's' : ''} en gratuit ({ineligibleCount > 1 ? 'ils sont' : 'il est'} déjà gratuit{ineligibleCount > 1 ? 's' : ''} ou épuisé{ineligibleCount > 1 ? 's' : ''}).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Êtes-vous sûr de vouloir continuer ?
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
            disabled={isProcessing || eligibleCount === 0}
            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Conversion...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" strokeWidth={2.5} />
                <span>Confirmer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

