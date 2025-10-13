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
      <div className="h-screen relative flex items-center justify-center p-6">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/slide-1.png)' }}
        >
          <div className="absolute inset-0 bg-green-50/85 backdrop-blur-sm"></div>
        </div>

        <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center animate-fade-in border-2 border-green-200 relative z-10">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle size={56} className="text-white" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Retrait validé !
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Le colis a été remis avec succès
          </p>
          
          <button
            onClick={resetState}
            className="w-full py-5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all font-bold text-xl shadow-lg"
          >
            Nouveau retrait
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/slide-1.png)' }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
      </div>

      <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl w-[95%] h-[95vh] max-w-[1800px] border-2 border-gray-200 flex flex-col relative z-10">
        {/* Header compact */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
          {/* Logo à gauche */}
          <div className="w-14">
            <img src="/logo.png" alt="EcoPanier" className="w-14 h-14 object-contain" />
          </div>
          
          {/* Titre au centre */}
          <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Station de Retrait
          </h1>
          
          {/* Bouton aide à droite */}
          <button
            onClick={() => setHelpActive(true)}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all active:scale-95"
          >
            <HelpCircle size={24} className="text-white" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-semibold text-base flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-2 hover:bg-red-100 rounded-lg transition-all active:scale-95"
            >
              <XCircle size={20} className="text-red-600" />
            </button>
          </div>
        )}

        {/* Contenu principal */}
        {!reservation ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
              {/* Bouton principal de scan */}
              <button
                onClick={() => setScannerActive(true)}
                disabled={loading}
                className="group w-full py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Scan size={56} className="text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-4xl font-bold">Scanner le QR Code</span>
                  <span className="text-lg text-blue-100">Appuyez pour commencer</span>
                </div>
              </button>

              {/* Instructions compactes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <p className="text-base font-bold text-gray-800">Scan QR Code</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <p className="text-base font-bold text-gray-800">Code PIN</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center shadow-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <p className="text-base font-bold text-gray-800">Remise colis</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 p-6 overflow-hidden">
            {/* Colonne gauche - Détails compacts */}
            <div className="w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Package size={20} className="text-white" />
                  </div>
                  Réservation
                </h3>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-lg font-bold text-gray-900">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Quantité</p>
                  <p className="text-2xl font-bold text-blue-600">{reservation.quantity} unité(s)</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Lot</p>
                  <p className="text-base font-bold text-gray-900">{reservation.lots.title}</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Commerçant</p>
                  <p className="text-base font-bold text-gray-900 mb-1">{reservation.lots.profiles.business_name}</p>
                  <p className="text-sm text-gray-600">{reservation.lots.profiles.business_address}</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Horaire de retrait</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-xs text-gray-600">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Validation PIN tactile */}
            <div className="w-1/2 flex flex-col gap-4">
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 flex flex-col justify-center">
                <label className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <Lock size={28} className="text-blue-600" />
                  Code PIN de sécurité
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-3 border-blue-300 rounded-xl focus:border-blue-600 focus:ring-3 focus:ring-blue-200 outline-none bg-white shadow-lg transition-all tracking-[1rem]"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
                <div className="mt-4 p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                  <p className="text-sm text-gray-700 text-center font-semibold">
                    Demandez au client son code PIN à 6 chiffres
                  </p>
                </div>
              </div>

              {/* Boutons d'action tactiles */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetState}
                  className="py-5 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 active:scale-[0.98] transition-all font-bold text-lg shadow-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="py-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 active:scale-[0.98] transition-all font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

