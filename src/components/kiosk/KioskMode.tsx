import { useState, useEffect, useCallback } from 'react';
import { KioskLogin } from './KioskLogin';
import { KioskDashboard } from './KioskDashboard';
import { LogOut, Clock } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes d'inactivité

export const KioskMode = () => {
  const [authenticatedProfile, setAuthenticatedProfile] = useState<Profile | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(INACTIVITY_TIMEOUT);

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
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen section-gradient">
      {/* Barre supérieure avec timer et déconnexion */}
      {authenticatedProfile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-soft z-50">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">🤝</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-black leading-tight">
                  Kiosque EcoPanier
                </h1>
                <p className="text-xs text-gray-600 font-light leading-tight">
                  {authenticatedProfile.full_name?.split(' ')[0]}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Timer de déconnexion */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                timeRemaining < 60000 
                  ? 'bg-warning-50 border-warning-300 text-warning-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <Clock size={14} strokeWidth={2} />
                <p className="text-sm font-bold font-mono">{formatTime(timeRemaining)}</p>
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold text-xs"
              >
                <LogOut size={14} strokeWidth={2} />
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
        <div className="fixed bottom-2 right-2 px-3 py-1.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full shadow-soft border border-white">
          <p className="text-xs font-bold flex items-center gap-1.5">
            <span className="animate-pulse">🔒</span>
            <span>Kiosque Sécurisé</span>
          </p>
        </div>
      )}
    </div>
  );
};

