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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', beneficiaryId)
        .eq('role', 'beneficiary')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setError('Utilisateur non trouvé ou non autorisé');
        setLoading(false);
        return;
      }

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

  const handleError = (err: Error) => {
    console.error('Erreur du scanner:', err);
    setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className="max-w-2xl w-full">
        {/* En-tête */}
        <div className="text-center mb-4 animate-fade-in">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary-100 via-accent-100 to-secondary-100 rounded-full mb-3 shadow-soft border border-white">
            <QrCode size={48} className="text-primary-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Kiosque EcoPanier
          </h1>
          <p className="text-base text-gray-600 font-light mb-3">
            Scannez votre carte pour les paniers solidaires 🎁
          </p>
          
          {/* Bouton aide */}
          <button
            onClick={() => setShowTutorial(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-semibold text-sm"
          >
            <HelpCircle size={18} />
            <span>Comment ça marche ?</span>
          </button>
        </div>

        {/* Scanner ou bouton */}
        {!scanning ? (
          <div className="card p-4 animate-fade-in">
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
          <div className="card p-4 animate-fade-in">
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
                components={{
                  audio: false
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
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 shadow-soft animate-fade-in">
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
          <div className="mt-3 p-3 bg-accent-50 rounded-lg border border-accent-200 shadow-soft animate-fade-in">
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

