import { AlertCircle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal = ({ isOpen, title, message, onClose }: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="w-12 h-12 text-red-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center">{title}</h3>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 text-center font-medium">
              Si le problème persiste, contactez le support.
            </p>
          </div>
        </div>

        {/* Bouton de fermeture */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold transition-all shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

