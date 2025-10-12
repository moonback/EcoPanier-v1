import { useState } from 'react';
import { MapPin, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { geocodeAddress } from '../../utils/geocodingService';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface GeocodeProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  current?: string;
}

export function GeocodeMerchants() {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState<GeocodeProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [merchants, setMerchants] = useState<Profile[]>([]);

  // Charger les commerçants sans coordonnées
  const loadMerchantsWithoutCoordinates = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'merchant')
        .or('latitude.is.null,longitude.is.null');

      if (error) throw error;

      setMerchants(data || []);
      addLog(`✅ ${data?.length || 0} commerçant(s) sans coordonnées trouvé(s)`);
    } catch (error) {
      console.error('Erreur chargement commerçants:', error);
      addLog(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Ajouter un log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  // Géocoder tous les commerçants sans coordonnées
  const handleGeocodeAll = async () => {
    if (merchants.length === 0) {
      addLog('⚠️ Aucun commerçant à géocoder');
      return;
    }

    setIsGeocoding(true);
    setProgress({
      total: merchants.length,
      processed: 0,
      succeeded: 0,
      failed: 0
    });

    addLog(`🚀 Début du géocodage de ${merchants.length} commerçant(s)...`);

    for (let i = 0; i < merchants.length; i++) {
      const merchant = merchants[i];
      const address = merchant.business_address || merchant.address;

      if (!address) {
        addLog(`⚠️ ${merchant.business_name || merchant.full_name}: Pas d'adresse`);
        setProgress(prev => prev ? {
          ...prev,
          processed: prev.processed + 1,
          failed: prev.failed + 1
        } : null);
        continue;
      }

      setProgress(prev => prev ? {
        ...prev,
        current: merchant.business_name || merchant.full_name
      } : null);

      // Géocoder l'adresse
      const result = await geocodeAddress(address);

      if (result.success && result.latitude !== 0 && result.longitude !== 0) {
        // Mettre à jour la base de données
        const { error } = await supabase
          .from('profiles')
          .update({
            latitude: result.latitude,
            longitude: result.longitude,
            updated_at: new Date().toISOString()
          })
          .eq('id', merchant.id);

        if (error) {
          addLog(`❌ ${merchant.business_name || merchant.full_name}: Erreur DB - ${error.message}`);
          setProgress(prev => prev ? {
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          } : null);
        } else {
          addLog(`✅ ${merchant.business_name || merchant.full_name}: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`);
          setProgress(prev => prev ? {
            ...prev,
            processed: prev.processed + 1,
            succeeded: prev.succeeded + 1
          } : null);
        }
      } else {
        addLog(`❌ ${merchant.business_name || merchant.full_name}: ${result.error || 'Échec géocodage'}`);
        setProgress(prev => prev ? {
          ...prev,
          processed: prev.processed + 1,
          failed: prev.failed + 1
        } : null);
      }

      // Délai pour respecter les rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    addLog(`🎉 Géocodage terminé: ${progress?.succeeded} réussis, ${progress?.failed} échoués`);
    setIsGeocoding(false);
    
    // Recharger la liste
    await loadMerchantsWithoutCoordinates();
  };

  // Géocoder un commerçant spécifique
  const handleGeocodeOne = async (merchant: Profile) => {
    const address = merchant.business_address || merchant.address;

    if (!address) {
      addLog(`⚠️ ${merchant.business_name || merchant.full_name}: Pas d'adresse`);
      return;
    }

    setIsGeocoding(true);
    addLog(`🔍 Géocodage de "${address}"...`);

    const result = await geocodeAddress(address);

    if (result.success && result.latitude !== 0 && result.longitude !== 0) {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', merchant.id);

      if (error) {
        addLog(`❌ Erreur mise à jour: ${error.message}`);
      } else {
        addLog(`✅ Succès: ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`);
        await loadMerchantsWithoutCoordinates();
      }
    } else {
      addLog(`❌ Échec: ${result.error || 'Erreur inconnue'}`);
    }

    setIsGeocoding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary-600" />
            Géocodage des Commerçants
          </h2>
          <p className="text-neutral-600 mt-1">
            Convertir les adresses en coordonnées GPS pour la carte interactive
          </p>
        </div>
        <button
          onClick={loadMerchantsWithoutCoordinates}
          disabled={isGeocoding}
          className="btn-secondary rounded-xl flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGeocoding ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Progress */}
      {progress && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-neutral-900">
              Progression: {progress.processed} / {progress.total}
            </span>
            <span className="text-sm text-neutral-600">
              {Math.round((progress.processed / progress.total) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress.processed / progress.total) * 100}%` }}
            />
          </div>

          {progress.current && (
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Loader className="w-4 h-4 animate-spin text-primary-600" />
              <span>En cours: <strong>{progress.current}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2 text-success-600">
              <CheckCircle className="w-4 h-4" />
              <span>{progress.succeeded} réussis</span>
            </div>
            <div className="flex items-center gap-2 text-accent-600">
              <AlertCircle className="w-4 h-4" />
              <span>{progress.failed} échoués</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg text-neutral-900 mb-4">
          Commerçants sans coordonnées: {merchants.length}
        </h3>
        
        {merchants.length > 0 ? (
          <button
            onClick={handleGeocodeAll}
            disabled={isGeocoding}
            className="btn-primary rounded-xl flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {isGeocoding ? 'Géocodage en cours...' : `Géocoder tous (${merchants.length})`}
          </button>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p className="text-neutral-600">
              ✅ Tous les commerçants ont des coordonnées GPS !
            </p>
          </div>
        )}
      </div>

      {/* Liste des commerçants */}
      {merchants.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">
            Liste des commerçants
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">
                    {merchant.business_name || merchant.full_name}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {merchant.business_address || merchant.address || 'Pas d\'adresse'}
                  </div>
                </div>
                <button
                  onClick={() => handleGeocodeOne(merchant)}
                  disabled={isGeocoding || !merchant.business_address && !merchant.address}
                  className="btn-secondary rounded-lg px-4 py-2 text-sm flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3" />
                  Géocoder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-neutral-900">
            Journal d'activité
          </h3>
          <button
            onClick={() => setLogs([])}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Effacer
          </button>
        </div>
        
        <div className="bg-neutral-900 text-neutral-100 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-neutral-500 text-center py-4">
              Aucune activité pour le moment
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card p-4 bg-primary-50 border border-primary-200">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-primary-900">
            <p className="font-semibold mb-1">💡 Information</p>
            <p>
              Le géocodage utilise l'API Mapbox. Assurez-vous que la variable d'environnement
              <code className="bg-primary-100 px-2 py-0.5 rounded mx-1">VITE_MAPBOX_ACCESS_TOKEN</code>
              est configurée dans votre fichier <code className="bg-primary-100 px-2 py-0.5 rounded">.env</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

