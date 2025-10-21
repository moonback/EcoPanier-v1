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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-green-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-2">
            Passer tous les lots en don ?
          </h3>
          <p className="text-green-50 text-center text-sm">
            Action solidaire à impact multiple
          </p>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          {/* Statistique principale */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gift className="w-8 h-8 text-green-600" strokeWidth={2} />
              <div className="text-center">
                <p className="text-4xl font-bold text-green-700">{eligibleLotsCount}</p>
                <p className="text-sm text-green-600 font-medium">
                  lot{eligibleLotsCount > 1 ? 's' : ''} éligible{eligibleLotsCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-green-700 mt-2">
              {eligibleLotsCount > 1 ? 'Seront convertis' : 'Sera converti'} en gratuit et mis à disposition des bénéficiaires
            </p>
          </div>

          {/* Avertissements importants */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-600" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  Action importante et irréversible
                </h4>
                <ul className="space-y-1.5 text-sm text-yellow-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Les réservations en cours seront <strong>annulées automatiquement</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Les prix seront <strong>remis à zéro</strong> (0,00 €)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span>Les lots seront marqués comme <strong>urgents</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-0.5">•</span>
                    <span><strong>Impossible de revenir en arrière</strong> après confirmation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Impact solidaire */}
          <div className="bg-gradient-to-r from-pink-50 to-red-50 border-2 border-pink-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600" fill="currentColor" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-pink-800 mb-2">Impact solidaire</h4>
                <p className="text-sm text-pink-700 leading-relaxed">
                  Vous allez <strong>sauver des repas du gaspillage</strong> et <strong>aider les personnes en précarité</strong> à accéder gratuitement à une alimentation de qualité. 
                  Un geste qui compte ! 💚
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Conversion en cours...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" strokeWidth={2.5} />
                <span>Confirmer le don solidaire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

