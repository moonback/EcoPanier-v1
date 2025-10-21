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
      <div className="bg-white border-b-2 border-gray-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Logo à gauche */}
          <div className="flex items-center gap-3 w-1/3">
            <img src="/logo.png" alt="EcoPanier" className="h-10 rounded-xl object-contain shadow-md" />
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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-black mb-2">
                Bienvenue ! 
              </h2>
              <p className="text-lg text-gray-600 font-light">
                Prêt à valider un retrait de panier ?
              </p>
            </div>

            {/* Layout 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Colonne gauche - Scanner */}
              <div className="flex flex-col">
                <button
                  onClick={() => setScannerActive(true)}
                  disabled={loading}
                  className="group flex-1 py-12 bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-700 text-white rounded-2xl hover:from-secondary-700 hover:via-secondary-800 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                      <Scan size={48} className="text-white" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold block mb-1">📲 Scanner le QR Code</span>
                      <span className="text-sm text-white/90 font-light">Cliquez pour activer la caméra</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Colonne droite - Instructions et étapes */}
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
                  <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <span>Mode d'emploi</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-bold text-white">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">📱 Scanner le QR Code</p>
                        <p className="text-xs text-gray-600 font-light">Client présente son QR code</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
                      <div className="w-9 h-9 bg-gradient-to-br from-warning-600 to-warning-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-bold text-white">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">🔑 Vérifier le code PIN</p>
                        <p className="text-xs text-gray-600 font-light">Code PIN à 6 chiffres</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-success-50 rounded-lg border border-success-200">
                      <div className="w-9 h-9 bg-gradient-to-br from-success-600 to-success-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-bold text-white">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">✅ Remettre le panier</p>
                        <p className="text-xs text-gray-600 font-light">Donner au client</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-500 rounded-lg">
                      <Package size={16} className="text-white" strokeWidth={2} />
                    </div>
                    <h4 className="text-sm font-bold text-black">Astuce</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Vérifiez le panier et le code PIN avant remise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto">
          {/* Détails de la réservation */}
          <div className="lg:w-1/2 bg-white rounded-xl p-4 border border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                  <Package size={18} className="text-white" strokeWidth={2} />
                </div>
                <span>Détails Commande</span>
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                reservation.status === 'pending'
                  ? 'bg-warning-100 text-warning-700 border-warning-300'
                  : 'bg-success-100 text-success-700 border-success-300'
              }`}>
                {reservation.status === 'pending' ? '⏳ Attente' : '✅ Confirmée'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Client</p>
                <p className="text-base font-semibold text-black">{reservation.profiles.full_name}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Quantité</p>
                <p className="text-xl font-bold text-black">{reservation.quantity} unité(s)</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Lot</p>
                <p className="text-sm font-semibold text-black">{reservation.lots.title}</p>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Commerçant</p>
                <p className="text-sm font-semibold text-black mb-0.5">{reservation.lots.profiles.business_name}</p>
                <p className="text-xs text-gray-600 font-light">{reservation.lots.profiles.business_address}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Horaire de retrait</p>
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
          <div className="lg:w-1/2 flex flex-col gap-3">
            <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-md flex flex-col justify-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg">
                  <Lock size={20} className="text-white" strokeWidth={2} />
                </div>
                <label className="text-xl font-bold text-black">
                  Code PIN Client
                </label>
              </div>
              
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 text-center text-4xl font-mono font-bold border-2 border-primary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none bg-gradient-to-br from-white to-primary-50 transition-all tracking-[0.8rem] shadow-inner"
                placeholder="● ● ● ● ● ●"
                autoFocus
              />
              
              <div className="mt-3 flex justify-center gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i < enteredPin.length ? 'bg-gradient-to-r from-primary-500 to-primary-600 scale-110' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
                <p className="text-xs text-gray-700 text-center font-medium">
                  🔑 Demandez le code PIN à 6 chiffres
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={resetState}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200 transition-all font-semibold text-base"
              >
                ← Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={enteredPin.length !== 6 || loading}
                className="py-3 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-lg hover:from-success-700 hover:to-success-800 transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md disabled:shadow-none"
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

