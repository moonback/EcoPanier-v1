import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { QrCode, AlertCircle, HelpCircle } from 'lucide-react';
import { KioskTutorial } from './KioskTutorial';
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
        setError('Utilisateur non trouvé ou non autorisé');
        setLoading(false);
        return;
      }

      // Typage explicite après vérification
      const profile: Profile = data;

      if (!profile.verified) {
        setError('Compte non vérifié. Contactez le personnel du foyer.');
        setLoading(false);
        return;
      }

      // Connexion réussie
      onLogin(profile);
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error('Erreur du scanner:', err);
    setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
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
        {/* En-tête */}
        <div className="text-center mb-4 animate-fade-in">
          <div className="inline-flex p-3 mb-3 justify-center">
            <img
              src="/logo-kiosk.png"
              alt="EcoPanier"
              className="w-70 h-12  rounded-xl object-cover border-2 border-white/50 shadow-md"
              draggable={false}
            />
          </div>
          
          <p className="text-lg text-white font-light mb-3 drop-shadow-md">
            Scannez votre carte pour les paniers solidaires !
          </p>
          
          {/* Bouton aide */}
          <button
            onClick={() => setShowTutorial(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 text-primary-700 rounded-lg hover:bg-white transition-all border-2 border-white/50 font-semibold text-sm shadow-lg hover:shadow-xl"
          >
            <HelpCircle size={18} />
            <span>Comment ça marche ?</span>
          </button>
        </div>

        {/* Scanner ou bouton */}
        {!scanning ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-4 animate-fade-in">
            <button
              onClick={() => setScanning(true)}
              className="btn-primary w-full py-4 rounded-xl text-lg shadow-soft-lg hover:shadow-glow-md"
            >
              <QrCode size={28} strokeWidth={2} />
              <span>Scanner ma carte</span>
            </button>

            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                  <AlertCircle size={18} className="text-blue-600" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Comment ça marche ?
                  </p>
                  <ul className="text-xs text-blue-800 space-y-0.5">
                    <li>✅ Présentez votre carte au scanner</li>
                    <li>✅ Choisissez vos paniers (max 2/jour)</li>
                    <li>✅ Notez votre code PIN</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-4 animate-fade-in">
            <div className="mb-3 text-center">
              <p className="text-lg font-bold text-black mb-1">
                Placez votre carte devant la caméra
              </p>
              <p className="text-sm text-gray-600">
                Le scan sera automatique
              </p>
            </div>

            {/* Scanner QR */}
            <div className="rounded-lg overflow-hidden border border-primary-300 shadow-soft">
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
              }}
              className="btn-secondary w-full mt-3 py-3 text-base"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="mt-3 p-3 bg-red-50/95 backdrop-blur-md rounded-lg border border-red-200 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                <AlertCircle size={18} className="text-red-600" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setScanning(false);
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-xs"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-3 p-3 bg-accent-50/95 backdrop-blur-md rounded-lg border border-accent-200 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
              <p className="text-sm font-bold text-accent-900">
                Connexion en cours...
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

