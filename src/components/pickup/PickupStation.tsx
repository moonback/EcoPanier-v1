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
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-slow">
              <CheckCircle size={48} className="text-green-600" strokeWidth={2.5} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            Retrait validé !
          </h2>
          
          <p className="text-base text-gray-600 mb-6">
            Le colis a été remis avec succès au client.
          </p>
          
          <button
            onClick={resetState}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
          >
            Nouveau retrait
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative border border-gray-100">
        <button
          onClick={() => setHelpActive(true)}
          className="absolute top-4 right-4 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md group"
          title="Aide"
        >
          <HelpCircle size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
        </button>

        <div className="text-center mb-6">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Package size={36} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Station de Retrait
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Scannez le QR code du client pour valider le retrait
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg shadow-md flex items-start gap-3 animate-fade-in-up">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {!reservation ? (
          <div className="space-y-4">
            <button
              onClick={() => setScannerActive(true)}
              disabled={loading}
              className="group relative w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Scan size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Scanner le QR Code</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1 bg-white text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Instructions
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 space-y-3 shadow-inner border border-blue-100">
              <div className="flex items-start gap-3 group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <Scan size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Étape 1</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Demandez au client de présenter le QR code de sa réservation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                  <Lock size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Étape 2</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Après le scan, vérifiez le code PIN à 6 chiffres communiqué par le client
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors flex-shrink-0">
                  <CheckCircle size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-0.5">Étape 3</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Une fois validé, remettez le colis au client et confirmez le retrait
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Package size={18} className="text-white" />
                  </div>
                  Détails réservation
                </h3>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-md ${
                  reservation.status === 'pending'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                }`}>
                  {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="text-base font-bold text-gray-800">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantité</p>
                  <p className="text-base font-bold text-indigo-600">{reservation.quantity} unité(s)</p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lot</p>
                  <p className="text-sm font-bold text-gray-800">{reservation.lots.title}</p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Commerçant</p>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{reservation.lots.profiles.business_name}</p>
                  <p className="text-xs text-gray-600">
                    📍 {reservation.lots.profiles.business_address}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Horaire de retrait</p>
                  <p className="text-sm font-bold text-gray-800">
                    🕐 {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 shadow-lg">
                <label className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800 mb-3">
                  <Lock size={18} className="text-indigo-600" />
                  Code PIN de vérification
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 text-center text-3xl font-mono font-black border-3 border-indigo-300 rounded-xl focus:border-indigo-600 focus:ring-3 focus:ring-indigo-200 outline-none bg-white shadow-inner transition-all duration-300"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
                <div className="mt-3 p-2.5 bg-white rounded-lg border border-indigo-100">
                  <p className="text-xs text-gray-700 text-center font-medium">
                    💡 Demandez au client son code PIN à 6 chiffres
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetState}
                  className="flex-1 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:shadow-md hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold text-sm border border-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} strokeWidth={2.5} />
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
    </div>
  );
};

