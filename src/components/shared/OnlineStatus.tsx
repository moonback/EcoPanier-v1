import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Composant affichant un badge discret de l'état de connexion
 * S'affiche automatiquement quand l'utilisateur passe hors ligne
 */
export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Cacher le banner après 3 secondes
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ne rien afficher si en ligne et pas de banner à montrer
  if (isOnline && !showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        showBanner ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}
    >
      {isOnline ? (
        // Banner de connexion rétablie
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up">
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Connexion rétablie</span>
        </div>
      ) : (
        // Banner hors ligne
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up">
          <WifiOff className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-medium">Mode hors ligne</span>
            <span className="text-xs text-gray-300">Fonctionnalités limitées</span>
          </div>
        </div>
      )}
    </div>
  );
}

