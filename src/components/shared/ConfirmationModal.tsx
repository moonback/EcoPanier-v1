// Imports externes
import { X, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

// Imports types
interface ConfirmationModalProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  pin?: string;
  onClose: () => void;
}

/**
 * Modal de confirmation réutilisable pour afficher des messages de succès/erreur
 * Affiche optionnellement un code PIN avec bouton de copie
 */
export function ConfirmationModal({ 
  type, 
  title, 
  message, 
  pin, 
  onClose 
}: ConfirmationModalProps) {
  // État local
  const [copied, setCopied] = useState(false);

  // Handlers
  const handleCopyPin = async () => {
    if (!pin) return;
    
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Configuration des couleurs selon le type
  const colorConfig = {
    success: {
      bgGradient: 'from-success-50 to-primary-50',
      iconBg: 'bg-success-100',
      iconColor: 'text-success-600',
      borderColor: 'border-success-200',
      buttonBg: 'from-success-600 to-success-700 hover:from-success-700 hover:to-success-800',
      Icon: CheckCircle
    },
    error: {
      bgGradient: 'from-red-50 to-orange-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      buttonBg: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      Icon: AlertCircle
    },
    info: {
      bgGradient: 'from-blue-50 to-primary-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      buttonBg: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      Icon: AlertCircle
    }
  };

  const config = colorConfig[type];
  const IconComponent = config.Icon;

  // Render principal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in-up shadow-2xl">
        {/* Header avec bouton fermer */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-full ${config.iconBg}`}>
            <IconComponent size={32} className={config.iconColor} strokeWidth={2} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          {message}
        </p>

        {/* Section PIN si présent */}
        {pin && (
          <div className={`mb-6 p-4 bg-gradient-to-r ${config.bgGradient} rounded-xl border-2 ${config.borderColor}`}>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Votre code PIN de retrait :
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-2xl font-bold text-gray-800 text-center tracking-wider shadow-sm">
                {pin}
              </div>
              <button
                onClick={handleCopyPin}
                className={`p-3 rounded-lg transition-all ${
                  copied
                    ? 'bg-success-100 text-success-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
                title="Copier le code PIN"
              >
                {copied ? (
                  <Check size={20} strokeWidth={2} />
                ) : (
                  <Copy size={20} strokeWidth={2} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              💡 Présentez ce code au commerçant pour récupérer votre panier
            </p>
          </div>
        )}

        {/* Bouton d'action */}
        <button
          onClick={onClose}
          className={`w-full py-3 bg-gradient-to-r ${config.buttonBg} text-white rounded-xl font-semibold shadow-lg transition-all`}
        >
          {pin ? 'J\'ai noté mon code' : 'Compris'}
        </button>
      </div>
    </div>
  );
}

