import { useState } from 'react';
import { QRScanner } from '../shared/QRScanner';
import { PickupStationDemo } from './PickupStationDemo';
import { PickupHelp } from './PickupHelp';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../utils/helpers';
import { Package, CheckCircle, XCircle, Scan, Lock, AlertCircle, Info, HelpCircle } from 'lucide-react';
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
  const [demoActive, setDemoActive] = useState(false);
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
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la lecture du QR code');
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
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
        } as any)
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      // Update lot quantities
      const { error: lotError } = await supabase
        .from('lots')
        .update({
          quantity_sold: reservation.lots.quantity_sold + reservation.quantity,
          quantity_reserved: reservation.lots.quantity_reserved - reservation.quantity,
        } as any)
        .eq('id', reservation.lot_id);

      if (lotError) throw lotError;

      setSuccess(true);
      setTimeout(() => {
        resetState();
      }, 3000);
    } catch (err: any) {
      setError('Erreur lors de la validation');
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Retrait validé !
          </h2>
          <p className="text-gray-600 mb-6">
            Le colis a été remis avec succès.
          </p>
          <button
            onClick={resetState}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Nouveau retrait
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
        <button
          onClick={() => setHelpActive(true)}
          className="absolute top-4 right-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
          title="Aide"
        >
          <HelpCircle size={24} className="text-gray-600" />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={48} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Station de Retrait
          </h1>
          <p className="text-gray-600">
            Scannez le QR code pour retirer votre commande
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {!reservation ? (
          <div className="space-y-4">
            <button
              onClick={() => setScannerActive(true)}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Scan size={24} />
              Scanner le QR Code
            </button>

            <button
              onClick={() => setDemoActive(true)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
            >
              <Info size={20} />
              Mode Démonstration
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Informations</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Scan size={20} className="text-gray-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-700">
                  Demandez au client de présenter le QR code de sa réservation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Lock size={20} className="text-gray-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-700">
                  Après le scan, vous devrez vérifier le code PIN à 6 chiffres
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-gray-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-700">
                  Une fois validé, remettez le colis au client
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Détails de la réservation</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {reservation.status === 'pending' ? 'En attente' : 'Confirmée'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Client</p>
                  <p className="font-bold text-gray-800">{reservation.profiles.full_name}</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Lot</p>
                  <p className="font-bold text-gray-800">{reservation.lots.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantité: {reservation.quantity}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Commerçant</p>
                  <p className="font-bold text-gray-800">{reservation.lots.profiles.business_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {reservation.lots.profiles.business_address}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Horaire de retrait</p>
                  <p className="font-medium text-gray-800">
                    {formatDateTime(reservation.lots.pickup_start)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    jusqu'à {formatDateTime(reservation.lots.pickup_end)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrez le code PIN du client (6 chiffres)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl font-mono font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="------"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Le client doit vous communiquer son code PIN à 6 chiffres
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetState}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidatePin}
                  disabled={enteredPin.length !== 6 || loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Valider le retrait
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

      {demoActive && <PickupStationDemo onClose={() => setDemoActive(false)} />}
      {helpActive && <PickupHelp onClose={() => setHelpActive(false)} />}
    </div>
  );
};

