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
      <div className="h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Motif de grille en arrière-plan */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
        
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-5xl w-full text-center animate-fade-in-up border-4 border-white/20 relative z-10">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 animate-bounce-slow">
                  <CheckCircle size={80} className="text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 leading-tight">
                Retrait validé !
              </h2>
              
              <p className="text-2xl text-gray-700 mb-6 font-bold">
                ✅ Le colis a été remis avec succès
              </p>
              
              <div className="bg-green-50 border-4 border-green-200 rounded-2xl p-4 mb-6">
                <p className="text-xl text-green-800 font-bold">
                  🎉 Merci d'utiliser EcoPanier !
                </p>
              </div>
              
              <button
                onClick={resetState}
                className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] transition-all duration-300 font-black text-2xl"
              >
                Nouveau retrait
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Motif de grille en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
      
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-7xl w-full h-[90vh] relative border-4 border-white/20 z-10 flex flex-col">
        <button
          onClick={() => setHelpActive(true)}
          className="absolute top-6 right-6 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/40 group font-bold text-lg"
          title="Aide"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={24} className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            <span>Aide</span>
          </div>
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Package size={56} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Station de Retrait
              </h1>
              <p className="text-xl text-gray-700 font-bold mt-2">
                🔍 Scannez le QR code pour valider le retrait
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl shadow-lg flex items-center gap-4 animate-fade-in-up">
            <div className="p-2 bg-red-100 rounded-xl shadow-md">
              <AlertCircle size={28} className="text-red-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-bold text-xl">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <XCircle size={24} />
            </button>
          </div>
        )}

        {!reservation ? (
          <div className="flex-1 flex items-center gap-6 overflow-hidden">
            <div className="flex-1">
              <button
                onClick={() => setScannerActive(true)}
                disabled={loading}
                className="group relative w-full py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl hover:shadow-2xl hover:shadow-blue-500/60 hover:scale-[1.02] transition-all duration-300 font-black text-4xl flex flex-col items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Scan size={80} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="relative z-10">📱 Scanner le QR Code</span>
              </button>
            </div>

            <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 shadow-xl border-4 border-blue-100 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-black text-gray-800 mb-4 text-center">Comment ça marche ?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-black text-white">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-gray-800">Présentez le QR code</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-black text-white">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-gray-800">Code PIN de sécurité</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-black text-white">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-gray-800">Remise du colis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Colonne gauche - Détails */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 shadow-xl border-4 border-blue-100 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Package size={24} className="text-white" />
                  </div>
                  Détails réservation
                </h3>
                <span className={`px-4 py-2 rounded-xl text-base font-black shadow-lg ${
                  reservation.status === 'pending'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                }`}>
                  {reservation.status === 'pending' ? '⏳ En attente' : '✅ Confirmée'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase mb-1">👤 Client</p>
                  <p className="text-xl font-black text-gray-800">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase mb-1">📦 Quantité</p>
                  <p className="text-2xl font-black text-indigo-600">{reservation.quantity} unité(s)</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase mb-1">🛍️ Lot</p>
                  <p className="text-lg font-black text-gray-800">{reservation.lots.title}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase mb-1">🏪 Commerçant</p>
                  <p className="text-lg font-black text-gray-800 mb-1">{reservation.lots.profiles.business_name}</p>
                  <p className="text-sm text-gray-600 font-semibold">
                    📍 {reservation.lots.profiles.business_address}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 uppercase mb-1">🕐 Horaire de retrait</p>
                  <p className="text-lg font-black text-gray-800">
                    {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Validation PIN */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-4 border-indigo-100 shadow-xl">
                <label className="flex items-center justify-center gap-3 text-2xl font-black text-gray-800 mb-4">
                  <Lock size={32} className="text-indigo-600" />
                  Code PIN de vérification
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-6 text-center text-5xl font-mono font-black border-4 border-indigo-300 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 outline-none bg-white shadow-xl transition-all duration-300 tracking-[1rem]"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
                <div className="mt-4 p-4 bg-white rounded-xl border-2 border-indigo-100 shadow-md">
                  <p className="text-base text-gray-700 text-center font-bold">
                    💡 Demandez au client son code PIN
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={resetState}
                  className="flex-1 py-5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-2xl hover:shadow-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-black text-xl border-2 border-gray-400"
                >
                  ❌ Annuler
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="flex-1 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] transition-all duration-300 font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={28} strokeWidth={3} />
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
    </div>
  );
};

