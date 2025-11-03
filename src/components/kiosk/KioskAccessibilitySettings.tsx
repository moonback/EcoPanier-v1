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
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in"
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
        className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-soft-xl border-2 border-primary-200 animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2
            id="accessibility-settings-title"
            className="text-xl sm:text-2xl font-bold text-gray-900"
          >
            {t('kiosk.accessibility.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 flex-shrink-0"
            aria-label={t('kiosk.common.close')}
          >
            <X size={20} className="sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4">
          {/* Mode grand texte */}
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg flex-shrink-0">
                  <Type size={18} className="sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('kiosk.accessibility.largeText')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{t('kiosk.accessibility.largeTextDesc')}</p>
                </div>
              </div>
              <button
                onClick={handleLargeTextToggle}
                className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 flex-shrink-0 ${
                  largeText ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={largeText}
                aria-label={t('kiosk.accessibility.largeText')}
              >
                <span
                  className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                    largeText ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Contraste élevé */}
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 bg-accent-100 rounded-lg flex-shrink-0">
                  <Contrast size={18} className="sm:w-5 sm:h-5 text-accent-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('kiosk.accessibility.highContrast')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{t('kiosk.accessibility.highContrastDesc')}</p>
                </div>
              </div>
              <button
                onClick={handleHighContrastToggle}
                className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 flex-shrink-0 ${
                  highContrast ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={highContrast}
                aria-label={t('kiosk.accessibility.highContrast')}
              >
                <span
                  className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                    highContrast ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Taille de police personnalisée */}
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="p-1.5 sm:p-2 bg-secondary-100 rounded-lg flex-shrink-0">
                <Volume2 size={18} className="sm:w-5 sm:h-5 text-secondary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('kiosk.accessibility.fontSize')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('kiosk.accessibility.fontSizeDesc', { percent: Math.round(fontSize * 100) })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-3">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 0.8}
                className="p-2 sm:p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('kiosk.accessibility.decreaseFontSize')}
              >
                <ZoomOut size={18} className="sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-2 sm:p-3 text-center min-w-0">
                <span className="text-lg sm:text-xl font-bold text-gray-900 font-mono">
                  {Math.round(fontSize * 100)}%
                </span>
              </div>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 2.0}
                className="p-2 sm:p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-primary-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('kiosk.accessibility.increaseFontSize')}
              >
                <ZoomIn size={18} className="sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Sélecteur de langue */}
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="p-1.5 sm:p-2 bg-secondary-100 rounded-lg flex-shrink-0">
                <Languages size={18} className="sm:w-5 sm:h-5 text-secondary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('kiosk.accessibility.language')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{t('kiosk.accessibility.languageDesc')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-200 min-h-[60px] sm:min-h-[70px] flex flex-col items-center justify-center ${
                    language === lang.code
                      ? 'bg-primary-600 text-white border-primary-700 font-bold'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                  aria-label={`${t('kiosk.accessibility.language')}: ${lang.native}`}
                  aria-pressed={language === lang.code}
                >
                  <div className="text-sm sm:text-base font-semibold">{lang.native}</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-0.5">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Réinitialiser */}
          <button
            onClick={resetSettings}
            className="w-full py-3 sm:py-3.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-primary-200 min-h-[44px]"
            aria-label={t('kiosk.accessibility.reset')}
          >
            <RotateCcw size={18} className="sm:w-5 sm:h-5" />
            <span>{t('kiosk.accessibility.reset')}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 sm:mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs sm:text-sm text-blue-900">
            <strong className="block mb-1 sm:mb-0 sm:inline">{t('kiosk.accessibility.shortcuts')}</strong>
            <span className="block sm:inline">
              <br className="hidden sm:inline" />
              • <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white border border-blue-300 rounded text-xs font-mono">Ctrl/Cmd + +</kbd> {t('kiosk.accessibility.shortcutsZoom')}
            </span>
            <br />
            <span className="block sm:inline">
              • <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white border border-blue-300 rounded text-xs font-mono">Ctrl/Cmd + -</kbd> {t('kiosk.accessibility.shortcutsReduce')}
            </span>
            <br />
            <span className="block sm:inline">
              • <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white border border-blue-300 rounded text-xs font-mono">Alt + S</kbd> {t('kiosk.accessibility.shortcutsSettings')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

