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
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/slide-1.png)' }}
        >
          {/* Overlay pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-green-50/80 backdrop-blur-sm"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full text-center animate-fade-in border border-green-100 relative z-10">
          <div className="mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={56} className="sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Retrait validé
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Le colis a été remis avec succès
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <p className="text-base sm:text-lg text-green-700 font-medium">
                Merci d'utiliser EcoPanier
              </p>
            </div>
            
            <button
              onClick={resetState}
              className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Nouveau retrait
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/slide-1.png)' }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 max-w-7xl w-full min-h-[calc(100vh-32px)] sm:min-h-[85vh] border border-gray-200 flex flex-col relative z-10">
        <button
          onClick={() => setHelpActive(true)}
          className="absolute top-6 right-6 p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          title="Aide"
        >
          <HelpCircle size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={36} className="sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Station de Retrait
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-1">
                Scannez le QR code du client
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {!reservation ? (
          <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 overflow-hidden">
            <div className="flex-1 flex items-center justify-center">
              <button
                onClick={() => setScannerActive(true)}
                disabled={loading}
                className="group w-full max-w-md py-20 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-4">
                  <Scan size={64} className="group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-semibold">Scanner le QR Code</span>
                </div>
              </button>
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Comment ça marche ?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <p className="text-base font-medium text-gray-800">Scannez le QR code du client</p>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <p className="text-base font-medium text-gray-800">Vérifiez le code PIN</p>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <p className="text-base font-medium text-gray-800">Remettez le colis</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Colonne gauche - Détails */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-200 overflow-y-auto max-h-[50vh] lg:max-h-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Package size={20} className="text-white" />
                  </div>
                  Détails de la réservation
                </h3>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-lg font-bold text-gray-900">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Quantité</p>
                  <p className="text-xl font-bold text-blue-600">{reservation.quantity} unité(s)</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Lot</p>
                  <p className="text-base font-bold text-gray-900">{reservation.lots.title}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Commerçant</p>
                  <p className="text-base font-bold text-gray-900 mb-1">{reservation.lots.profiles.business_name}</p>
                  <p className="text-sm text-gray-600">
                    {reservation.lots.profiles.business_address}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Horaire de retrait</p>
                  <p className="text-base font-bold text-gray-900">
                    {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-sm text-gray-600">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Validation PIN */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <label className="flex items-center justify-center gap-3 text-xl font-bold text-gray-900 mb-6">
                  <Lock size={24} className="text-blue-600" />
                  Code PIN
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all tracking-[1rem]"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-700 text-center font-medium">
                    Demandez au client son code PIN
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={resetState}
                  className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="flex-1 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} strokeWidth={2.5} />
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

