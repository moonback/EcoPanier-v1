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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-success-600 via-success-500 to-success-600">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
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
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold text-lg shadow-lg"
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="EcoPanier" className="h-10 rounded-xl object-contain shadow-md" />
          <div>
            <h1 className="text-xl font-bold text-black flex items-center gap-2">
              <span>📱</span>
              <span>Station de Retrait</span>
            </h1>
            <p className="text-xs text-gray-600">Scannez • Validez • Remettez</p>
          </div>
        </div>
        
        <button
          onClick={() => setHelpActive(true)}
          className="p-2.5 hover:bg-primary-50 rounded-xl transition-all group"
        >
          <HelpCircle size={20} className="text-gray-700 group-hover:text-primary-600" strokeWidth={2} />
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-3">
                Bienvenue ! 👋
              </h2>
              <p className="text-xl text-gray-600 font-light">
                Prêt à valider un retrait de panier ?
              </p>
            </div>

            <button
              onClick={() => setScannerActive(true)}
              disabled={loading}
              className="group w-full py-24 bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-700 text-white rounded-3xl hover:from-secondary-700 hover:via-secondary-800 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-12 shadow-2xl hover:shadow-3xl"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Scan size={56} className="text-white" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold block mb-2">📲 Scanner le QR Code</span>
                  <span className="text-base text-white/90 font-light">Cliquez pour activer la caméra</span>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 text-center border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <p className="text-sm font-bold text-black mb-1">📱 Scanner</p>
                <p className="text-xs text-gray-600 font-light">QR Code client</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center border-2 border-gray-100 hover:border-warning-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <p className="text-sm font-bold text-black mb-1">🔑 Valider</p>
                <p className="text-xs text-gray-600 font-light">Code PIN</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center border-2 border-gray-100 hover:border-success-200 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <p className="text-sm font-semibold text-black mb-1">Remettre</p>
                <p className="text-xs text-gray-600 font-light">Le colis</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-y-auto">
          {/* Détails de la réservation */}
          <div className="lg:w-1/2 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <Package size={20} className="text-white" strokeWidth={2} />
                </div>
                <span>Détails de la Commande</span>
              </h3>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm ${
                reservation.status === 'pending'
                  ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300'
                  : 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300'
              }`}>
                {reservation.status === 'pending' ? '⏳ En attente' : '✅ Confirmée'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Client</p>
                <p className="text-lg font-semibold text-black">{reservation.profiles.full_name}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Quantité</p>
                <p className="text-2xl font-bold text-black">{reservation.quantity} unité(s)</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Lot</p>
                <p className="text-base font-semibold text-black">{reservation.lots.title}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Commerçant</p>
                <p className="text-base font-semibold text-black mb-1">{reservation.lots.profiles.business_name}</p>
                <p className="text-sm text-gray-600 font-light">{reservation.lots.profiles.business_address}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Horaire de retrait</p>
                <p className="text-sm font-medium text-black">
                  {formatDateTime(reservation.lots.pickup_start)}
                </p>
                <p className="text-xs text-gray-600 font-light">
                  jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                </p>
              </div>
            </div>
          </div>

          {/* Validation PIN */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg flex flex-col justify-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
                  <Lock size={24} className="text-white" strokeWidth={2} />
                </div>
                <label className="text-2xl font-bold text-black">
                  Code PIN du Client
                </label>
              </div>
              
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-3 border-primary-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none bg-gradient-to-br from-white to-primary-50 transition-all tracking-[1rem] shadow-inner"
                placeholder="● ● ● ● ● ●"
                autoFocus
              />
              
              <div className="mt-4 flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < enteredPin.length ? 'bg-gradient-to-r from-primary-500 to-primary-600 scale-110' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                <p className="text-sm text-gray-700 text-center font-medium">
                  🔑 Demandez au client son code PIN à 6 chiffres
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetState}
                className="py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border-2 border-gray-200 transition-all font-semibold text-lg"
              >
                ← Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={enteredPin.length !== 6 || loading}
                className="py-4 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-xl hover:from-success-700 hover:to-success-800 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                ✅ Valider
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

