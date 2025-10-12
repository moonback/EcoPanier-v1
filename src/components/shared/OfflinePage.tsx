import { WifiOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Page affichée quand l'utilisateur est hors ligne
 * Détecte automatiquement le retour de la connexion
 */
export function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-gradient p-4">
      <div className="max-w-md w-full card p-8 text-center animate-fade-in-up">
        {/* Icône */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Vous êtes hors ligne
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Certaines fonctionnalités peuvent être limitées. Vérifiez votre connexion internet pour accéder à toutes les fonctionnalités d'EcoPanier.
        </p>

        {/* Statut de connexion */}
        {isOnline ? (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-emerald-700 font-medium">
              ✅ Connexion rétablie ! Rechargement...
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm">
              En attente de la connexion internet...
            </p>
          </div>
        )}

        {/* Bouton de rechargement */}
        <button
          onClick={handleRetry}
          disabled={!isOnline}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>

        {/* Fonctionnalités disponibles hors ligne */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Fonctionnalités disponibles hors ligne :
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Consultation des données en cache
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Accès aux pages récemment visitées
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Visualisation de vos QR codes
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            EcoPanier fonctionne mieux avec une connexion internet stable
          </p>
        </div>
      </div>
    </div>
  );
}

