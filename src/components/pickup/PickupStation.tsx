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
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-teal-50/90 backdrop-blur-sm"></div>
        </div>

        <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center animate-fade-in border-2 border-green-300 relative z-10 overflow-hidden">
          {/* Confettis décoratifs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </div>

              <div className="relative">
            {/* Icône de succès animée */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle size={64} className="text-white animate-bounce" strokeWidth={2.5} style={{ animationDuration: '2s' }} />
              </div>
            </div>
            
            <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Retrait validé !
              </h2>
              
            <p className="text-2xl text-gray-700 font-semibold mb-2">
              Votre casier est ouvert
            </p>
            
            <p className="text-lg text-gray-500 mb-8">
              Récupérez votre commande et fermez le casier
            </p>
            
            {/* Barre de progression auto-reset */}
            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-[shrink_3s_linear]"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Retour automatique dans quelques secondes...</p>
              </div>
              
              <button
                onClick={resetState}
              className="group relative w-full py-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl hover:from-green-700 hover:to-emerald-800 active:scale-[0.98] transition-all font-bold text-2xl shadow-xl overflow-hidden"
              >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative">Nouveau retrait</span>
              </button>
            </div>
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
        <div className="bg-white text-blue-600 px-6 py-4 rounded-t-3xl flex items-center justify-between">
          {/* Logo à gauche */}
          <div className="w-25">
            <img src="/logo.png" alt="EcoPanier" className="w-25 h-25 object-contain" />
          </div>
          
          {/* Titre au centre */}
          <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
                Station de Retrait
              </h1>
          
          {/* Bouton aide à droite */}
          <button
            onClick={() => setHelpActive(true)}
            className="p-3 bg-blue-600/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all active:scale-95"
          >
            <HelpCircle size={24} className="text-blue-600" />
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
            <div className="w-full max-w-5xl">
              {/* Instruction principale */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue</h2>
                <p className="text-xl text-gray-600">Scannez votre QR code pour récupérer votre commande</p>
              </div>

              {/* Bouton principal de scan avec animation */}
              <div className="relative mb-8">
              <button
                onClick={() => setScannerActive(true)}
                disabled={loading}
                className="group relative w-full py-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl hover:shadow-xl active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-md animate-pulse"></div>
                    <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                      <Scan size={40} className="text-white group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold block mb-1">Scanner le QR Code</span>
                    <span className="text-base text-blue-100 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Appuyer pour démarrer
                    </span>
                  </div>
                </div>
              </button>
            </div>

              {/* Instructions étapes avec design amélioré */}
              <div className="grid grid-cols-3 gap-4">
                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-blue-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">1</span>
                      </div>
                  </div>
                    <p className="text-base font-bold text-gray-800 text-center">Scanner le QR Code</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">Présentez votre code</p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-indigo-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                  </div>
                    <p className="text-base font-bold text-gray-800 text-center">Saisir le code PIN</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">6 chiffres de sécurité</p>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-green-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                  </div>
                    <p className="text-base font-bold text-gray-800 text-center">Récupérer le colis</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">Ouvrez le casier</p>
                  </div>
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
              <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 flex flex-col justify-center relative overflow-hidden">
                {/* Effet de fond décoratif */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <label className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <Lock size={24} className="text-white" />
                    </div>
                    Code PIN de sécurité
                </label>
                  
                  {/* Input PIN avec design amélioré */}
                  <div className="relative mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-6 py-6 text-center text-5xl font-mono font-bold border-3 border-blue-300 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-200 outline-none bg-white shadow-xl transition-all tracking-[1rem]"
                  placeholder="● ● ● ● ● ●"
                  autoFocus
                />
                    {/* Indicateur de progression */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i < enteredPin.length ? 'bg-blue-600 scale-110' : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-sm text-gray-700 text-center font-semibold flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Demandez au client son code PIN à 6 chiffres
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action avec design amélioré */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetState}
                  className="group py-5 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 rounded-xl hover:from-gray-300 hover:to-gray-400 active:scale-[0.98] transition-all font-bold text-lg shadow-lg border border-gray-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    <XCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Annuler
                  </span>
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="group py-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 active:scale-[0.98] transition-all font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <CheckCircle size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                    Valider
                  </span>
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

