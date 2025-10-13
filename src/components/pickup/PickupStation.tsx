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
      const { error: updateError } = await (supabase
        .from('reservations') as unknown as {
          update: (data: { status: string; completed_at: string }) => {
            eq: (col: string, val: string) => Promise<{ error: Error | null }>;
          };
        })
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      // Update lot quantities
      const { error: lotError } = await (supabase
        .from('lots') as unknown as {
          update: (data: { quantity_sold: number; quantity_reserved: number }) => {
            eq: (col: string, val: string) => Promise<{ error: Error | null }>;
          };
        })
        .update({
          quantity_sold: reservation.lots.quantity_sold + reservation.quantity,
          quantity_reserved: reservation.lots.quantity_reserved - reservation.quantity,
        })
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} className="text-white" strokeWidth={2} />
          </div>
          
          <h2 className="text-4xl font-bold text-black mb-4">
            Retrait validé
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 font-light">
            Le casier est maintenant ouvert
          </p>
          
          <div className="mb-8">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full animate-[shrink_3s_linear]"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-light">Retour automatique dans 3 secondes...</p>
          </div>
          
          <button
            onClick={resetState}
            className="w-full py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-medium text-lg"
          >
            Nouveau retrait
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
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="EcoPanier" className="h-8 rounded-lg object-contain" />
          <h1 className="text-xl font-bold text-black">
            Station de Retrait
          </h1>
        </div>
        
        <button
          onClick={() => setHelpActive(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          <HelpCircle size={20} className="text-gray-700" />
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
              <h2 className="text-3xl font-bold text-black mb-3">Bienvenue</h2>
              <p className="text-lg text-gray-600 font-light">Scannez le QR code pour commencer</p>
            </div>

            <button
              onClick={() => setScannerActive(true)}
              disabled={loading}
              className="w-full py-24 bg-black text-white rounded-3xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-12"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Scan size={48} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold block mb-2">Scanner le QR Code</span>
                  <span className="text-sm text-white/70 font-light">Appuyez pour démarrer</span>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <p className="text-sm font-semibold text-black mb-1">Scanner</p>
                <p className="text-xs text-gray-600 font-light">QR Code client</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <p className="text-sm font-semibold text-black mb-1">Valider</p>
                <p className="text-xs text-gray-600 font-light">Code PIN</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
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
          <div className="lg:w-1/2 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                <Package size={20} />
                Réservation
              </h3>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                reservation.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
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
            <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-200 flex flex-col justify-center">
              <label className="flex items-center justify-center gap-3 text-xl font-bold text-black mb-6">
                <Lock size={24} />
                Code PIN
              </label>
              
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-2 border-gray-300 rounded-2xl focus:border-black focus:ring-2 focus:ring-gray-200 outline-none bg-white transition-all tracking-[1rem]"
                placeholder="● ● ● ● ● ●"
                autoFocus
              />
              
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < enteredPin.length ? 'bg-black' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 text-center mt-6 font-light">
                Demandez au client son code PIN à 6 chiffres
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetState}
                className="py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium text-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={enteredPin.length !== 6 || loading}
                className="py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Valider
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

