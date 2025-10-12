import { useState, useEffect } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Composant gérant l'installation PWA et les mises à jour
 * Affiche des prompts pour installer l'app et recharger après mise à jour
 */
export function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker enregistré:', r);
    },
    onRegisterError(error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    },
  });

  // Gérer l'événement beforeinstallprompt pour l'installation PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handler pour l'installation
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
    } else {
      console.log('Utilisateur a refusé l\'installation');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Handler pour fermer le prompt d'installation
  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Sauvegarder la préférence pour ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Handler pour fermer l'alerte offline ready
  const handleCloseOfflineReady = () => {
    setOfflineReady(false);
  };

  // Handler pour recharger après mise à jour
  const handleReload = () => {
    updateServiceWorker(true);
  };

  return (
    <>
      {/* Prompt d'installation PWA */}
      {showInstallPrompt && !sessionStorage.getItem('pwa-install-dismissed') && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in-up">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Installer EcoPanier
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  Installez l'application pour un accès rapide et une meilleure expérience hors ligne
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                  >
                    Installer
                  </button>
                  <button
                    onClick={handleDismissInstall}
                    className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissInstall}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerte : Application prête hors ligne */}
      {offlineReady && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in-up">
          <div className="bg-white rounded-lg shadow-2xl p-4 border border-emerald-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Application prête ! 🎉
                </h3>
                <p className="text-sm text-gray-600">
                  EcoPanier est maintenant disponible hors ligne
                </p>
              </div>
              <button
                onClick={handleCloseOfflineReady}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de mise à jour disponible */}
      {needRefresh && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Mise à jour disponible
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  Une nouvelle version d'EcoPanier est disponible
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReload}
                    className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => setNeedRefresh(false)}
                    className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={() => setNeedRefresh(false)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

