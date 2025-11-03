import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { QrCode, AlertCircle, HelpCircle, Languages } from 'lucide-react';
import { KioskTutorial } from './KioskTutorial';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskLoginProps {
  onLogin: (profile: Profile) => void;
}

export const KioskLogin = ({ onLogin }: KioskLoginProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { announce } = useAccessibility();
  const { language, setLanguage, t } = useLanguage();

  const availableLanguages = [
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  ];

  // Fermer le sélecteur de langue si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageSelector && !target.closest('.language-selector-container')) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showLanguageSelector]);

  // Afficher le tutoriel au premier chargement
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('kiosk_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('kiosk_tutorial_seen', 'true');
  };

  const handleScan = async (result: string) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // Le QR code du bénéficiaire contient son ID utilisateur
      const beneficiaryId = result.trim();

      // Récupérer le profil
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', beneficiaryId)
        .eq('role', 'beneficiary')
        .single();

      if (profileError || !data) {
        const errorMessage = t('kiosk.login.error.notFound');
        setError(errorMessage);
        announce(errorMessage, 'assertive');
        setLoading(false);
        return;
      }

      // Typage explicite après vérification
      const profile: Profile = data;

      if (!profile.verified) {
        const errorMessage = t('kiosk.login.error.notVerified');
        setError(errorMessage);
        announce(errorMessage, 'assertive');
        setLoading(false);
        return;
      }

      // Connexion réussie
      announce(t('kiosk.login.success', { name: profile.full_name?.split(' ')[0] || 'Bénéficiaire' }), 'assertive');
      onLogin(profile);
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      const errorMessage = t('kiosk.login.error.connection');
      setError(errorMessage);
      announce(errorMessage, 'assertive');
      setLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error('Erreur du scanner:', err);
    setError(t('kiosk.login.error.camera'));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/slide-1.png)' }}
      />
      
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-primary-800/50 to-accent-900/60 backdrop-blur-sm" />
      
      {/* Contenu */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Sélecteur de langue en haut à droite */}
        <div className="absolute top-0 right-0 z-20 language-selector-container">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageSelector(!showLanguageSelector);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md text-primary-700 rounded-lg hover:bg-white transition-all border-2 border-white/50 font-semibold text-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label={t('kiosk.accessibility.language')}
              aria-expanded={showLanguageSelector}
            >
              <Languages size={18} aria-hidden="true" />
              <span className="hidden sm:inline">{availableLanguages.find(l => l.code === language)?.flag || '🌐'}</span>
            </button>

            {/* Menu déroulant des langues */}
            {showLanguageSelector && (
              <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg border-2 border-white/50 shadow-2xl overflow-hidden min-w-[180px] animate-fade-in-up">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage(lang.code);
                      setShowLanguageSelector(false);
                      announce(t('kiosk.accessibility.languageChange', { language: lang.name }));
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-50 transition-colors text-left ${
                      language === lang.code
                        ? 'bg-primary-100 text-primary-700 font-bold'
                        : 'text-gray-700'
                    }`}
                    aria-label={`${t('kiosk.accessibility.language')}: ${lang.name}`}
                    aria-pressed={language === lang.code}
                  >
                    <span className="text-xl" aria-hidden="true">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {language === lang.code && (
                      <span className="text-primary-600" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* En-tête */}
        <div className="text-center mb-4 animate-fade-in">
          <div className="inline-flex p-3 mb-3 justify-center">
            <img
              src="/logo-kiosk.png"
              alt="EcoPanier"
              className="w-70 h-12 bg-white rounded-xl object-cover border-2 border-white/50 shadow-md"
              draggable={false}
            />
          </div>
          
          <h1 className="text-2xl md:text-3xl text-white font-bold mb-3 drop-shadow-md">
            {t('kiosk.login.title')}
          </h1>
          
          {/* Bouton aide */}
          <button
            onClick={() => {
              setShowTutorial(true);
              announce(t('kiosk.messages.tutorialOpened'));
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 text-primary-700 rounded-lg hover:bg-white transition-all border-2 border-white/50 font-semibold text-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
            aria-label={t('kiosk.login.help')}
          >
            <HelpCircle size={18} aria-hidden="true" />
            <span>{t('kiosk.login.help')}</span>
          </button>
        </div>

        {/* Scanner ou bouton */}
        {!scanning ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-4 animate-fade-in">
            <button
              onClick={() => {
                setScanning(true);
                announce(t('kiosk.login.scannerActive'));
              }}
              className="btn-primary w-full py-4 rounded-xl text-lg shadow-soft-lg hover:shadow-glow-md focus:outline-none focus:ring-4 focus:ring-primary-200"
              aria-label={t('kiosk.login.scanButton')}
            >
              <QrCode size={28} strokeWidth={2} aria-hidden="true" />
              <span>{t('kiosk.login.scanButton')}</span>
            </button>

            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                  <AlertCircle size={18} className="text-blue-600" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    {t('kiosk.login.help')}
                  </p>
                  <ul className="text-xs text-blue-800 space-y-0.5">
                    <li>✅ {t('kiosk.login.instructions.present')}</li>
                    <li>✅ {t('kiosk.login.instructions.choose')}</li>
                    <li>✅ {t('kiosk.login.instructions.note')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-4 animate-fade-in">
            <div className="mb-3 text-center">
              <h2 className="text-lg font-bold text-black mb-1">
                {t('kiosk.login.placeCard')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('kiosk.login.autoScan')}
              </p>
            </div>

            {/* Scanner QR */}
          <div 
            className="rounded-lg overflow-hidden border border-primary-300 shadow-soft"
            role="region"
            aria-label={t('kiosk.login.title')}
          >
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleScan(result[0].rawValue);
                  }
                }}
                onError={handleError}
                styles={{
                  container: { 
                    width: '100%',
                    height: '280px'
                  }
                }}
                constraints={{
                  facingMode: 'environment'
                }}
              />
            </div>

            {/* Bouton annuler */}
            <button
              onClick={() => {
                setScanning(false);
                setError(null);
                announce(t('kiosk.login.scannerCancelled'));
              }}
              className="btn-secondary w-full mt-3 py-3 text-base focus:outline-none focus:ring-4 focus:ring-primary-200"
              aria-label={t('kiosk.login.cancel')}
            >
              {t('kiosk.login.cancel')}
            </button>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div 
            className="mt-3 p-3 bg-red-50/95 backdrop-blur-md rounded-lg border border-red-200 shadow-xl animate-fade-in"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                <AlertCircle size={18} className="text-red-600" strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setScanning(false);
                  announce(t('kiosk.messages.retry'));
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-xs focus:outline-none focus:ring-4 focus:ring-red-300"
                aria-label={t('kiosk.login.retry')}
              >
                {t('kiosk.login.retry')}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div 
            className="mt-3 p-3 bg-accent-50/95 backdrop-blur-md rounded-lg border border-accent-200 shadow-xl animate-fade-in"
            role="status"
            aria-live="polite"
            aria-label="Connexion en cours"
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" aria-hidden="true"></div>
              <p className="text-sm font-bold text-accent-900">
                {t('kiosk.login.connecting')}
              </p>
            </div>
          </div>
        )}

        {/* Tutoriel */}
        {showTutorial && <KioskTutorial onClose={handleCloseTutorial} />}
      </div>
    </div>
  );
};

