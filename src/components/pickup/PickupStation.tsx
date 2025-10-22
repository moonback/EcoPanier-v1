import { useState } from 'react';
import { QRScanner } from '../shared/QRScanner';
import { PickupHelp } from './PickupHelp';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../utils/helpers';
import { Package, CheckCircle, XCircle, Scan, Lock, AlertCircle, HelpCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
  profiles: { full_name: string };
};

interface QRData {
  reservationId: string;
  pin: string;
  userId: string;
}

export const PickupStation = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [helpActive, setHelpActive] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleScan = async (data: string) => {
    setScannerActive(false);
    setLoading(true);
    setError(null);

    try {
      const qrData: QRData = JSON.parse(data);

      // Fetch reservation details
      const { data: reservationData, error: fetchError } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address)), profiles(full_name)')
        .eq('id', qrData.reservationId)
        .single();

      if (fetchError) throw new Error('Réservation introuvable');

      const typedReservation = reservationData as Reservation;

      // Verify reservation status
      if (typedReservation.status === 'completed') {
        throw new Error('Cette réservation a déjà été récupérée');
      }

      if (typedReservation.status === 'cancelled') {
        throw new Error('Cette réservation a été annulée');
      }

      setReservation(typedReservation);
      setEnteredPin('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la lecture du QR code';
      setError(errorMessage);
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePin = async () => {
    if (!reservation) return;

    if (enteredPin !== reservation.pickup_pin) {
      setError('Code PIN incorrect');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update reservation status to completed
      // NOTE: Using 'as unknown' to bypass Supabase v2 TypeScript bug with .update()
      // Justification: Bug connu de @supabase/supabase-js v2.57.4 où les types Update
      // sont résolus à 'never'. Workaround temporaire en attendant un fix officiel.
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        } as unknown as never)
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      // Update lot quantities
      const newQuantitySold = reservation.lots.quantity_sold + reservation.quantity;
      const newQuantityReserved = reservation.lots.quantity_reserved - reservation.quantity;

      // NOTE: Using 'as unknown' to bypass Supabase v2 TypeScript bug with .update()
      const { error: lotError } = await supabase
        .from('lots')
        .update({
          quantity_sold: newQuantitySold,
          quantity_reserved: newQuantityReserved,
        } as unknown as never)
        .eq('id', reservation.lot_id);

      if (lotError) throw lotError;

      setSuccess(true);
      setTimeout(() => {
        resetState();
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setReservation(null);
    setEnteredPin('');
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{
        backgroundImage: 'url("/slide-5.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-success-600/90 via-success-500/90 to-success-600/90"></div>
        
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl relative z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse">
            <CheckCircle size={56} className="text-white" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-4xl font-bold text-black mb-3">
            🎉 Retrait Validé !
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
            Le panier a été remis avec succès. 
            Merci de votre engagement anti-gaspi ! 💚
          </p>
          
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full animate-[shrink_3s_linear]"></div>
            </div>
            <p className="text-sm text-gray-500 mt-3 font-medium">⏱️ Retour automatique dans 3 secondes...</p>
          </div>
          
          <button
            onClick={resetState}
            className="w-full py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-sm transition-all font-semibold text-lg"
          >
            Nouveau retrait →
          </button>
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{
        backgroundImage: 'url("/slide-3.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/50 pointer-events-none"></div>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4 shadow-sm z-20">
        <div className="flex items-center justify-between">
          {/* Logo à gauche */}
          <div className="flex items-center gap-3 w-1/3">
            <img src="/logo-retrait.png" alt="EcoPanier" className="h-10 rounded-xl object-contain shadow-md" />
          </div>
          
          {/* Titre centré */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-black flex items-center justify-center gap-2">
              <span>📱</span>
              <span>Station de Retrait</span>
            </h1>
            <p className="text-xs text-gray-600">Scannez • Validez • Remettez</p>
          </div>
          
          {/* Bouton aide à droite */}
          <div className="w-1/3 flex justify-end">
            <button
              onClick={() => setHelpActive(true)}
              className="p-2.5 hover:bg-primary-50 rounded-xl transition-all group"
            >
              <HelpCircle size={20} className="text-gray-700 group-hover:text-primary-600" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 relative z-10">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-800 font-medium text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 rounded-lg transition-all"
          >
            <XCircle size={20} className="text-red-600" />
          </button>
        </div>
      )}

      {/* Contenu principal */}
      {!reservation ? (
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-7xl">
            <div className="text-center mb-8">
              
              
            </div>

            {/* Layout 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Colonne gauche - Scanner */}
              <div className="flex flex-col">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Scanner QR Code</h3>
                    <p className="text-gray-600">Activez la caméra pour scanner le code du client</p>
                  </div>
                  
                  <button
                    onClick={() => setScannerActive(true)}
                    disabled={loading}
                    className="group w-full py-8 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white rounded-xl hover:from-primary-700 hover:via-primary-800 hover:to-secondary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Scan size={40} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-bold block mb-1">Activer le Scanner</span>
                        <span className="text-sm text-white/90 font-medium">Cliquez pour démarrer</span>
                      </div>
                    </div>
                  </button>
                  
                  
                </div>
              </div>

              {/* Colonne droite - Instructions et étapes */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Processus de Retrait</h3>
                    <p className="text-gray-600">Suivez ces étapes pour valider le retrait</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl border border-primary-200 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Scan size={20} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">1. Scanner le QR Code</h4>
                        <p className="text-sm text-gray-600 font-medium">Le client présente son QR code de réservation</p>
                        <div className="mt-2 text-xs text-primary-700 font-medium">✓ Validation automatique de la commande</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-200 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Lock size={20} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">2. Vérifier le Code PIN</h4>
                        <p className="text-sm text-gray-600 font-medium">Code PIN à 6 chiffres fourni par le client</p>
                        <div className="mt-2 text-xs text-warning-700 font-medium">🔒 Sécurité renforcée</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <CheckCircle size={20} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">3. Remettre le Panier</h4>
                        <p className="text-sm text-gray-600 font-medium">Validation finale et remise au client</p>
                        <div className="mt-2 text-xs text-success-700 font-medium">🎉 Transaction terminée</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto relative z-10">
          {/* Détails de la réservation */}
          <div className="lg:w-1/2 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-primary-500 rounded-lg shadow">
                  <Package size={20} className="text-white" strokeWidth={2} />
                </span>
                Détails commande
              </h3>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                reservation.status === 'pending'
                  ? 'bg-warning-100 text-warning-700 border-warning-300'
                  : 'bg-success-100 text-success-700 border-success-300'
              }`}>
                {reservation.status === 'pending' ? '⏳ En Attente' : '✅ Confirmée'}
              </span>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-md text-white text-lg font-bold">👤</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Client</span>
                  <div className="text-gray-900 font-medium truncate">{reservation.profiles.full_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                <span className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-md text-white text-lg font-bold">📦</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Quantité</span>
                  <div className="text-gray-900 font-medium">{reservation.quantity} unité(s)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3 border border-purple-100">
                <span className="w-8 h-8 flex items-center justify-center bg-purple-500 rounded-md text-white text-lg font-bold">🏷️</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Produit</span>
                  <div className="text-gray-900 font-medium truncate">{reservation.lots.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
                <span className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded-md text-white text-lg font-bold">🏪</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Commerçant</span>
                  <div className="text-gray-900 font-medium truncate">{reservation.lots.profiles.business_name}</div>
                  <div className="text-xs text-gray-500 truncate">{reservation.lots.profiles.business_address}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-md text-white text-lg font-bold">🕒</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Retrait</span>
                  <div className="text-gray-900 font-medium">{formatDateTime(reservation.lots.pickup_start)}</div>
                  <div className="text-xs text-gray-500">jusqu'à {formatDateTime(reservation.lots.pickup_end)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation PIN */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl mb-4 shadow-lg">
                  <Lock size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Validation Sécurisée
                </h3>
                <p className="text-gray-600 font-medium">
                  Saisissez le code PIN fourni par le client
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-3 border-warning-300 rounded-2xl focus:border-warning-500 focus:ring-4 focus:ring-warning-100 outline-none bg-gradient-to-br from-white to-warning-50 transition-all tracking-[1.2rem] shadow-lg"
                    placeholder="● ● ● ● ● ●"
                    autoFocus
                  />
                  
                  {/* Indicateurs visuels */}
                  <div className="mt-4 flex justify-center gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          i < enteredPin.length 
                            ? 'bg-gradient-to-r from-warning-500 to-warning-600 scale-125 shadow-lg' 
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl p-4 border border-warning-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🔑</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-warning-800">Code PIN Client</p>
                      <p className="text-xs text-warning-700">Demandez le code à 6 chiffres</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetState}
                className="py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border-2 border-gray-200 transition-all font-bold text-lg shadow-md hover:shadow-lg"
              >
                ← Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={enteredPin.length !== 6 || loading}
                className="py-4 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Validation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} strokeWidth={2.5} />
                    <span>Valider le Retrait</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <QRScanner
        isActive={scannerActive}
        onScan={handleScan}
        onClose={() => setScannerActive(false)}
      />

      {helpActive && <PickupHelp onClose={() => setHelpActive(false)} />}
    </>
  );
};

