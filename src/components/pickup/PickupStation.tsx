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
      <div className="min-h-screen lg:h-screen relative flex items-center justify-center p-4 sm:p-6">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/slide-1.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-teal-50/90 backdrop-blur-sm"></div>
        </div>

        <div className="bg-white/98 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-xl w-full text-center animate-fade-in border border-green-200 lg:border-2 border-green-300 relative z-10 overflow-hidden">
          {/* Confettis décoratifs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
          </div>

          <div className="relative">
            {/* Icône de succès responsive */}
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl lg:blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle size={48} className="sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white animate-bounce" strokeWidth={2.5} style={{ animationDuration: '2s' }} />
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Retrait validé !
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-700 font-semibold mb-1 sm:mb-2">
              Votre casier est ouvert
            </p>
            
            <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8">
              Récupérez votre commande et fermez le casier
            </p>
            
            {/* Barre de progression auto-reset */}
            <div className="mb-4 sm:mb-6">
              <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-[shrink_3s_linear]"></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Retour automatique dans quelques secondes...</p>
            </div>
            
            <button
              onClick={resetState}
              className="group relative w-full py-4 sm:py-5 lg:py-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl lg:rounded-2xl hover:from-green-700 hover:to-emerald-800 active:scale-[0.98] transition-all font-bold text-lg sm:text-xl lg:text-2xl shadow-xl overflow-hidden"
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
    <div className="min-h-screen lg:h-screen relative flex items-center justify-center overflow-hidden p-2 sm:p-4 lg:p-0">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/slide-1.png)' }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm"></div>
      </div>

      <div className="bg-white/98 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl w-full lg:w-[95%] min-h-[calc(100vh-16px)] lg:h-[95vh] max-w-[1800px] border border-gray-200 lg:border-2 flex flex-col relative z-10">
        {/* Header responsive */}
        <div className="bg-white text-blue-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl lg:rounded-t-3xl flex items-center justify-between relative">
          {/* Logo à gauche */}
          <div className="w-10 sm:w-12 lg:w-14 flex-shrink-0">
            <img src="/logo.png" alt="EcoPanier" className="w-full h-auto object-contain" />
          </div>
          
          {/* Titre au centre */}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            Station de Retrait
          </h1>
          
          {/* Bouton aide à droite */}
          <button
            onClick={() => setHelpActive(true)}
            className="p-2 sm:p-3 bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-sm rounded-lg lg:rounded-xl transition-all active:scale-95 flex-shrink-0"
          >
            <HelpCircle size={20} className="sm:w-6 sm:h-6 text-blue-600" />
          </button>
        </div>

        {/* Message d'erreur responsive */}
        {error && (
          <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-50 border border-red-300 lg:border-2 rounded-lg lg:rounded-xl flex items-center gap-2 sm:gap-3">
            <AlertCircle size={18} className="sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-semibold text-sm sm:text-base flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-all active:scale-95"
            >
              <XCircle size={18} className="sm:w-5 sm:h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Contenu principal responsive */}
        {!reservation ? (
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-5xl">
              {/* Instruction principale */}
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Bienvenue</h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600">Scannez votre QR code pour récupérer votre commande</p>
              </div>

              {/* Bouton principal de scan responsive */}
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                <button
                  onClick={() => setScannerActive(true)}
                  disabled={loading}
                  className="group relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl lg:rounded-3xl hover:shadow-xl active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex flex-col items-center gap-3 sm:gap-4">
                    {/* Icône responsive */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-xl lg:rounded-2xl blur-md lg:blur-xl animate-pulse"></div>
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl flex items-center justify-center border-2 border-white/30">
                        <Scan size={40} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold block mb-1 sm:mb-2">Scanner le QR Code</span>
                      <span className="text-sm sm:text-base lg:text-lg text-blue-100 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Appuyez pour démarrer
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Instructions responsive - colonne sur mobile, grille sur desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <div className="relative sm:mb-4 flex-shrink-0">
                      <div className="absolute inset-0 bg-blue-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl sm:text-2xl font-bold text-white">1</span>
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none text-left sm:text-center">
                      <p className="text-sm sm:text-base font-bold text-gray-800">Scanner le QR Code</p>
                      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Présentez votre code</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <div className="relative sm:mb-4 flex-shrink-0">
                      <div className="absolute inset-0 bg-indigo-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl sm:text-2xl font-bold text-white">2</span>
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none text-left sm:text-center">
                      <p className="text-sm sm:text-base font-bold text-gray-800">Saisir le code PIN</p>
                      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">6 chiffres de sécurité</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-white to-gray-50 rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <div className="relative sm:mb-4 flex-shrink-0">
                      <div className="absolute inset-0 bg-green-100 rounded-xl blur-md opacity-50"></div>
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl sm:text-2xl font-bold text-white">3</span>
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none text-left sm:text-center">
                      <p className="text-sm sm:text-base font-bold text-gray-800">Récupérer le colis</p>
                      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Ouvrez le casier</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">
            {/* Colonne gauche - Détails compacts (responsive) */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl lg:rounded-2xl p-3 sm:p-4 border border-gray-200 lg:border-2 flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg lg:rounded-xl">
                    <Package size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  Réservation
                </h3>
                <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold ${
                  reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                <div className="bg-white rounded-lg lg:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-lg lg:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Quantité</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{reservation.quantity} unité(s)</p>
                </div>

                <div className="bg-white rounded-lg lg:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Lot</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{reservation.lots.title}</p>
                </div>

                <div className="bg-white rounded-lg lg:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Commerçant</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-1">{reservation.lots.profiles.business_name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{reservation.lots.profiles.business_address}</p>
                </div>

                <div className="bg-white rounded-lg lg:rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-sm">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">Horaire de retrait</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Validation PIN (responsive) */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 border border-blue-200 lg:border-2 flex flex-col justify-center relative overflow-hidden">
                {/* Effets décoratifs */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <label className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg lg:rounded-xl">
                      <Lock size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    Code PIN de sécurité
                  </label>
                  
                  {/* Input PIN responsive */}
                  <div className="relative mb-3 sm:mb-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 lg:py-6 text-center text-3xl sm:text-4xl lg:text-5xl font-mono font-bold border-2 sm:border-3 border-blue-300 rounded-xl lg:rounded-2xl focus:border-blue-600 focus:ring-2 sm:focus:ring-4 focus:ring-blue-200 outline-none bg-white shadow-lg lg:shadow-xl transition-all tracking-[0.5rem] sm:tracking-[0.8rem] lg:tracking-[1rem]"
                      placeholder="● ● ● ● ● ●"
                      autoFocus
                    />
                    {/* Indicateur de progression */}
                    <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5 sm:gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                            i < enteredPin.length ? 'bg-blue-600 scale-110' : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg lg:rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-xs sm:text-sm text-gray-700 text-center font-semibold flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Demandez au client son code PIN à 6 chiffres
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action responsive */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={resetState}
                  className="group py-4 sm:py-5 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 rounded-lg lg:rounded-xl hover:from-gray-300 hover:to-gray-400 active:scale-[0.98] transition-all font-bold text-base sm:text-lg shadow-lg border border-gray-400"
                >
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <XCircle size={18} className="sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">Annuler</span>
                    <span className="sm:hidden">✕</span>
                  </span>
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="group py-4 sm:py-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-lg lg:rounded-xl hover:from-green-700 hover:to-emerald-800 active:scale-[0.98] transition-all font-bold text-base sm:text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                    <CheckCircle size={18} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
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

