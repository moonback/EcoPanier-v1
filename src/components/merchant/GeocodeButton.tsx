import { useState } from 'react';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { geocodeAddress } from '../../utils/geocodingService';
import { useAuthStore } from '../../stores/authStore';

interface GeocodeButtonProps {
  onSuccess?: () => void;
}

/**
 * Composant pour permettre aux commerçants de se géocoder eux-mêmes
 * Affiche un bouton pour obtenir les coordonnées GPS depuis l'adresse du commerce
 */
export function GeocodeButton({ onSuccess }: GeocodeButtonProps) {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Vérifier si le profil a déjà des coordonnées
  const hasCoordinates = profile?.latitude && profile?.longitude;

  const handleGeocode = async () => {
    if (!profile || !profile.business_address) {
      setStatus('error');
      setMessage('Adresse du commerce introuvable');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Géocoder l'adresse
      const result = await geocodeAddress(profile.business_address);

      if (!result.success || result.latitude === 0 || result.longitude === 0) {
        setStatus('error');
        setMessage(result.error || 'Impossible de géocoder l\'adresse');
        setLoading(false);
        return;
      }

      // Mettre à jour le profil dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        setStatus('error');
        setMessage('Erreur lors de la mise à jour du profil');
        console.error('Erreur update profil:', error);
        setLoading(false);
        return;
      }

      // Mettre à jour le store local
      await useAuthStore.getState().fetchProfile();

      setStatus('success');
      setMessage(`✅ Position enregistrée : ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`);
      
      // Callback de succès
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      console.error('Erreur géocodage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Bouton principal */}
      <button
        onClick={handleGeocode}
        disabled={loading || !profile?.business_address}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          hasCoordinates
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            : 'bg-gradient-to-r from-blue-600 to-primary-600 text-white hover:from-blue-700 hover:to-primary-700'
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Géolocalisation...</span>
          </>
        ) : hasCoordinates ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Mettre à jour la position</span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            <span>Activer la géolocalisation</span>
          </>
        )}
      </button>

      {/* Message de statut */}
      {status !== 'idle' && (
        <div className={`p-3 rounded-lg flex items-start gap-2 ${
          status === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            status === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Info sur l'importance de la géolocalisation */}
      {!hasCoordinates && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Géolocalisation requise</p>
              <p className="text-xs leading-relaxed">
                Votre commerce n'apparaîtra pas sur la carte des clients tant que vous n'aurez pas activé la géolocalisation. 
                Cliquez sur le bouton ci-dessus pour être visible !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Afficher les coordonnées actuelles */}
      {hasCoordinates && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Position actuelle</p>
              <p className="text-xs font-mono">
                Lat: {profile.latitude?.toFixed(6)}<br />
                Lng: {profile.longitude?.toFixed(6)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ✓ Votre commerce est visible sur la carte
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

