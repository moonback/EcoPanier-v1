import { useState } from 'react';
import { X, Type, Contrast, Volume2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface KioskAccessibilitySettingsProps {
  onClose: () => void;
}

export const KioskAccessibilitySettings = ({ onClose }: KioskAccessibilitySettingsProps) => {
  const {
    largeText,
    setLargeText,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    announce,
  } = useAccessibility();

  const handleLargeTextToggle = () => {
    const newValue = !largeText;
    setLargeText(newValue);
    announce(newValue ? 'Texte agrandi activé' : 'Texte agrandi désactivé');
  };

  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    announce(newValue ? 'Contraste élevé activé' : 'Contraste élevé désactivé');
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 0.1, 2.0); // Max 200%
    setFontSize(newSize);
    announce(`Taille de police : ${Math.round(newSize * 100)}%`);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 0.1, 0.8); // Min 80%
    setFontSize(newSize);
    announce(`Taille de police : ${Math.round(newSize * 100)}%`);
  };

  const resetSettings = () => {
    setLargeText(false);
    setHighContrast(false);
    setFontSize(1.0);
    announce('Paramètres d\'accessibilité réinitialisés');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-soft-xl border-2 border-primary-200 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="accessibility-settings-title"
            className="text-2xl font-bold text-gray-900"
          >
            Paramètres d'accessibilité
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200"
            aria-label="Fermer les paramètres d'accessibilité"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Mode grand texte */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Type size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Texte agrandi</h3>
                  <p className="text-sm text-gray-600">Augmente la taille de tous les textes</p>
                </div>
              </div>
              <button
                onClick={handleLargeTextToggle}
                className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                  largeText ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={largeText}
                aria-label={largeText ? 'Désactiver le texte agrandi' : 'Activer le texte agrandi'}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    largeText ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Contraste élevé */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Contrast size={20} className="text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Contraste élevé</h3>
                  <p className="text-sm text-gray-600">Améliore la visibilité des éléments</p>
                </div>
              </div>
              <button
                onClick={handleHighContrastToggle}
                className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                  highContrast ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={highContrast}
                aria-label={highContrast ? 'Désactiver le contraste élevé' : 'Activer le contraste élevé'}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Taille de police personnalisée */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Volume2 size={20} className="text-secondary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Taille de police</h3>
                <p className="text-sm text-gray-600">
                  Réglage personnalisé : {Math.round(fontSize * 100)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 0.8}
                className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200"
                aria-label="Diminuer la taille de police"
              >
                <ZoomOut size={20} className="text-gray-700" />
              </button>
              <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-3 text-center">
                <span className="text-xl font-bold text-gray-900 font-mono">
                  {Math.round(fontSize * 100)}%
                </span>
              </div>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 2.0}
                className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200"
                aria-label="Augmenter la taille de police"
              >
                <ZoomIn size={20} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Réinitialiser */}
          <button
            onClick={resetSettings}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-primary-200"
            aria-label="Réinitialiser les paramètres d'accessibilité"
          >
            <RotateCcw size={18} />
            <span>Réinitialiser</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Astuce :</strong> Utilisez les raccourcis clavier :
            <br />
            • <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">+</kbd> pour agrandir
            <br />
            • <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">-</kbd> pour réduire
          </p>
        </div>
      </div>
    </div>
  );
};

