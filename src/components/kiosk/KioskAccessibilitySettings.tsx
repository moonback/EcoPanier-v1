import { useState } from 'react';
import { X, Type, Contrast, Volume2, ZoomIn, ZoomOut, RotateCcw, Languages } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useLanguage, type Language } from '../../contexts/LanguageContext';

interface KioskAccessibilitySettingsProps {
  onClose: () => void;
}

const languages: Array<{ code: Language; name: string; native: string }> = [
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];

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
  const { language, setLanguage, t } = useLanguage();

  const handleLargeTextToggle = () => {
    const newValue = !largeText;
    setLargeText(newValue);
    announce(newValue ? t('kiosk.accessibility.enabled', { feature: t('kiosk.accessibility.largeText') }) : t('kiosk.accessibility.disabled', { feature: t('kiosk.accessibility.largeText') }));
  };

  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    announce(newValue ? t('kiosk.accessibility.enabled', { feature: t('kiosk.accessibility.highContrast') }) : t('kiosk.accessibility.disabled', { feature: t('kiosk.accessibility.highContrast') }));
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 0.1, 2.0); // Max 200%
    setFontSize(newSize);
    announce(t('kiosk.accessibility.fontSizeChange', { percent: Math.round(newSize * 100) }));
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 0.1, 0.8); // Min 80%
    setFontSize(newSize);
    announce(t('kiosk.accessibility.fontSizeChange', { percent: Math.round(newSize * 100) }));
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    announce(t('kiosk.accessibility.languageChange', { language: languages.find(l => l.code === lang)?.native || lang }));
  };

  const resetSettings = () => {
    setLargeText(false);
    setHighContrast(false);
    setFontSize(1.0);
    announce(t('kiosk.accessibility.reset'));
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
            {t('kiosk.accessibility.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200"
            aria-label={t('kiosk.common.close')}
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
                  <h3 className="text-lg font-bold text-gray-900">{t('kiosk.accessibility.largeText')}</h3>
                  <p className="text-sm text-gray-600">{t('kiosk.accessibility.largeTextDesc')}</p>
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
                  <h3 className="text-lg font-bold text-gray-900">{t('kiosk.accessibility.highContrast')}</h3>
                  <p className="text-sm text-gray-600">{t('kiosk.accessibility.highContrastDesc')}</p>
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
                <h3 className="text-lg font-bold text-gray-900">{t('kiosk.accessibility.fontSize')}</h3>
                <p className="text-sm text-gray-600">
                  {t('kiosk.accessibility.fontSizeDesc', { percent: Math.round(fontSize * 100) })}
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

          {/* Sélecteur de langue */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Languages size={20} className="text-secondary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{t('kiosk.accessibility.language')}</h3>
                <p className="text-sm text-gray-600">{t('kiosk.accessibility.languageDesc')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                    language === lang.code
                      ? 'bg-primary-600 text-white border-primary-700 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                  aria-label={`${t('kiosk.accessibility.language')}: ${lang.native}`}
                  aria-pressed={language === lang.code}
                >
                  <div className="text-sm font-semibold">{lang.native}</div>
                  <div className="text-xs opacity-75">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Réinitialiser */}
          <button
            onClick={resetSettings}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-primary-200"
            aria-label={t('kiosk.accessibility.reset')}
          >
            <RotateCcw size={18} />
            <span>{t('kiosk.accessibility.reset')}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{t('kiosk.accessibility.shortcuts')}</strong>
            <br />
            • <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">+</kbd> {t('kiosk.accessibility.shortcutsZoom')}
            <br />
            • <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">-</kbd> {t('kiosk.accessibility.shortcutsReduce')}
          </p>
        </div>
      </div>
    </div>
  );
};

