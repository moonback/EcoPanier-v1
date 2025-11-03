import { useState, useEffect, useCallback } from 'react';
import { KioskLogin } from './KioskLogin';
import { KioskDashboard } from './KioskDashboard';
import { KioskAccessibilitySettings } from './KioskAccessibilitySettings';
import { LogOut, Clock, Settings } from 'lucide-react';
import { AccessibilityProvider, useAccessibility } from '../../contexts/AccessibilityContext';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const INACTIVITY_TIMEOUT = 1.5 * 60 * 1000; // 1.5 minutes d'inactivité

function KioskModeContent() {
  const [authenticatedProfile, setAuthenticatedProfile] = useState<Profile | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(INACTIVITY_TIMEOUT);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const { announce, fontSize, setFontSize } = useAccessibility();

  // Activer le mode plein écran au chargement
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen non disponible:', error);
      }
    };

    enterFullscreen();

    // Empêcher le clic droit et la sélection de texte
    const preventContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  // Réinitialiser le timer d'activité
  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setTimeRemaining(INACTIVITY_TIMEOUT);
  }, []);

  // Écouter les événements d'activité
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivity);
      });
    };
  }, [resetActivity]);

  // Raccourcis clavier pour l'accessibilité
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + S pour ouvrir les paramètres d'accessibilité
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        setShowAccessibilitySettings(true);
        announce('Paramètres d\'accessibilités ouverts');
        resetActivity();
        return;
      }

      // Ctrl/Cmd + + pour augmenter la taille de police
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const newSize = Math.min(fontSize + 0.1, 2.0);
        setFontSize(newSize);
        announce(`Taille de police : ${Math.round(newSize * 100)}%`);
        resetActivity();
        return;
      }

      // Ctrl/Cmd + - pour diminuer la taille de police
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        const newSize = Math.max(fontSize - 0.1, 0.8);
        setFontSize(newSize);
        announce(`Taille de police : ${Math.round(newSize * 100)}%`);
        resetActivity();
        return;
      }

      // Reset activité pour les autres raccourcis clavier
      resetActivity();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [announce, resetActivity, fontSize, setFontSize]);

  // Timer de déconnexion automatique
  useEffect(() => {
    if (!authenticatedProfile) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = INACTIVITY_TIMEOUT - elapsed;

      if (remaining <= 0) {
        handleLogout();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authenticatedProfile, lastActivity]);

  const handleLogin = (profile: Profile) => {
    setAuthenticatedProfile(profile);
    resetActivity();
  };

  const handleLogout = () => {
    setAuthenticatedProfile(null);
    setLastActivity(Date.now());
    setTimeRemaining(INACTIVITY_TIMEOUT);
    announce('Vous avez été déconnecté');
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Annoncer le temps restant quand il devient critique
  useEffect(() => {
    if (authenticatedProfile && timeRemaining < 60000 && timeRemaining > 0) {
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      if (seconds === 0 || (seconds % 15 === 0 && seconds < 60)) {
        announce(`Attention : ${minutes} minute${minutes > 1 ? 's' : ''} et ${seconds} seconde${seconds > 1 ? 's' : ''} restantes avant déconnexion`, 'assertive');
      }
    }
  }, [authenticatedProfile, timeRemaining, announce]);

  return (
    <div className="min-h-screen section-gradient">
      {/* Barre supérieure avec timer et déconnexion */}
      {authenticatedProfile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-soft z-50">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-100 h-12 flex items-center justify-center">
                <img
                  src="/logo-kiosk.png"
                  alt="EcoPanier"
                  className="h-12 w-auto object-contain"
                  draggable={false}
                  loading="eager"
                />
              </div>
              
            </div>
            
            <div className="flex items-center gap-2">
              {/* Paramètres d'accessibilité */}
              <button
                onClick={() => {
                  setShowAccessibilitySettings(true);
                  announce('Paramètres d\'accessibilité ouverts');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold text-xs focus:outline-none focus:ring-4 focus:ring-primary-200"
                aria-label="Ouvrir les paramètres d'accessibilité"
                title="Paramètres d'accessibilité (Alt + S)"
              >
                <Settings size={14} strokeWidth={2} />
                <span className="hidden sm:inline">Accessibilité</span>
              </button>

              {/* Timer de déconnexion */}
              <div 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                  timeRemaining < 60000 
                    ? 'bg-warning-50 border-warning-300 text-warning-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
                role="timer"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Temps restant avant déconnexion : ${formatTime(timeRemaining)}`}
              >
                <Clock size={14} strokeWidth={2} aria-hidden="true" />
                <p className="text-sm font-bold font-mono">{formatTime(timeRemaining)}</p>
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold text-xs focus:outline-none focus:ring-4 focus:ring-gray-300"
                aria-label="Se déconnecter"
              >
                <LogOut size={14} strokeWidth={2} aria-hidden="true" />
                <span>Quitter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className={authenticatedProfile ? 'pt-12' : ''}>
        {!authenticatedProfile ? (
          <KioskLogin onLogin={handleLogin} />
        ) : (
          <KioskDashboard profile={authenticatedProfile} onActivity={resetActivity} />
        )}
      </div>

      {/* Badge "Mode Kiosque" */}
      {!authenticatedProfile && (
        <div 
          className="fixed bottom-2 right-2 px-3 py-1.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full shadow-soft border border-white"
          role="status"
          aria-label="Mode kiosque sécurisé activé"
        >
          <p className="text-xs font-bold flex items-center gap-1.5">
            <span className="animate-pulse" aria-hidden="true">🔒</span>
            <span>Kiosque Sécurisé</span>
          </p>
        </div>
      )}

      {/* Paramètres d'accessibilité */}
      {showAccessibilitySettings && (
        <KioskAccessibilitySettings onClose={() => setShowAccessibilitySettings(false)} />
      )}
    </div>
  );
}

export const KioskMode = () => {
  return (
    <AccessibilityProvider>
      <KioskModeContent />
    </AccessibilityProvider>
  );
};

