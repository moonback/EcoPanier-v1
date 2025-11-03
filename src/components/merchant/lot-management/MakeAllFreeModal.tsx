import { Gift, AlertTriangle, Heart, X } from 'lucide-react';

interface MakeAllFreeModalProps {
  isOpen: boolean;
  eligibleLotsCount: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MakeAllFreeModal = ({
  isOpen,
  eligibleLotsCount,
  isProcessing,
  onConfirm,
  onCancel,
}: MakeAllFreeModalProps) => {
  if (!isOpen) return null;

  // Gérer la fermeture au clic sur le backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-gray-100">
        {/* Header avec gradient amélioré */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 sm:p-6 text-white relative overflow-hidden">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Bouton fermer amélioré */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:bg-white/20 active:bg-white/30 rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>
          
          {/* Icône avec animation */}
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full animate-pulse" />
              <Gift className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 relative z-10" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Titre responsive */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-2 relative z-10">
            Passer tous les lots en don ?
          </h3>
          <p className="text-green-50/90 text-center text-xs sm:text-sm font-medium relative z-10">
            Action solidaire à impact multiple
          </p>
        </div>

        {/* Contenu avec padding responsive */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Statistique principale améliorée */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 leading-none mb-1">
                  {eligibleLotsCount}
                </p>
                <p className="text-xs sm:text-sm text-green-600 font-semibold">
                  lot{eligibleLotsCount > 1 ? 's' : ''} éligible{eligibleLotsCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm text-green-700 font-medium">
              {eligibleLotsCount > 1 ? 'Seront convertis' : 'Sera converti'} en gratuit et mis à disposition des bénéficiaires
            </p>
          </div>

          {/* Avertissements importants améliorés */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-yellow-800 mb-2 sm:mb-3 text-sm sm:text-base">
                  Action importante et irréversible
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-yellow-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Les réservations en cours seront <strong className="font-bold">annulées automatiquement</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Les prix seront <strong className="font-bold">remis à zéro</strong> (0,00 €)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Les lots seront marqués comme <strong className="font-bold">urgents</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong className="font-bold">Impossible de revenir en arrière</strong> après confirmation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Impact solidaire amélioré */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 border-2 border-pink-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="currentColor" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-pink-800 mb-2 sm:mb-3 text-sm sm:text-base">Impact solidaire</h4>
                <p className="text-xs sm:text-sm text-pink-700 leading-relaxed">
                  Vous allez <strong className="font-bold">sauver des repas du gaspillage</strong> et <strong className="font-bold">aider les personnes en précarité</strong> à accéder gratuitement à une alimentation de qualité. 
                  Un geste qui compte ! 💚
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions améliorées avec responsive */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 flex flex-col sm:flex-row gap-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 sm:px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 active:bg-gray-100 font-semibold transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                <span>Conversion en cours...</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                <span className="whitespace-nowrap">Confirmer le don solidaire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

