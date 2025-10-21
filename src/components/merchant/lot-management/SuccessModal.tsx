import { CheckCircle, Gift, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  quantity?: number;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, title, message, quantity, onClose }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Header avec animation */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center">{title}</h3>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          {/* Message principal */}
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Badge de quantité (optionnel) */}
          {quantity && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-center gap-3">
                <Gift className="w-8 h-8 text-green-600" strokeWidth={2} />
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{quantity}</p>
                  <p className="text-sm text-green-600 font-medium">
                    repas sauvés du gaspillage
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Impact visuel */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>🌍</span>
            <span className="font-medium">Merci pour votre geste solidaire !</span>
            <span>💚</span>
          </div>
        </div>

        {/* Bouton de fermeture */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

