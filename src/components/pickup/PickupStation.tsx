import { useState, useEffect } from 'react';
import { QRScanner } from '../shared/QRScanner';
import { PickupHelp } from './PickupHelp';
import { supabase } from '../../lib/supabase';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Scan, 
  Lock, 
  AlertCircle, 
  HelpCircle,
  User,
  ShoppingBag,
  MapPin,
  Clock,
  Euro,
  Heart,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { 
      business_name: string; 
      business_address: string;
      business_logo_url?: string | null;
    };
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
  const [reservations, setReservations] = useState<Reservation[]>([]); // Mode multi-retrait
  const [selectedReservationIds, setSelectedReservationIds] = useState<Set<string>>(new Set());
  const [enteredPin, setEnteredPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pinError, setPinError] = useState(false);
  const [todayStats, setTodayStats] = useState<{ completed: number; total: number } | null>(null);

  // Charger les statistiques du jour au montage
  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data, error: statsError } = await supabase
          .from('reservations')
          .select('status')
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString());

        if (!statsError && data) {
          const completed = data.filter((r: { status: string }) => r.status === 'completed').length;
          setTodayStats({ completed, total: data.length });
        }
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      }
    };

    loadTodayStats();
  }, [success]); // Recharger après chaque succès

  const handleScan = async (data: string) => {
    setScannerActive(false);
    setLoading(true);
    setError(null);

    try {
      const qrData: QRData = JSON.parse(data);

      // Fetch la réservation principale scannée
      const { data: mainReservation, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          *,
          lots(
            *,
            profiles(business_name, business_address, business_logo_url)
          ),
          profiles(full_name)
        `)
        .eq('id', qrData.reservationId)
        .single();

      if (fetchError) throw new Error('Réservation introuvable');

      const typedMainReservation = mainReservation as Reservation;

      // Vérifier le statut de la réservation principale
      if (typedMainReservation.status === 'completed') {
        throw new Error('Cette réservation a déjà été récupérée');
      }

      if (typedMainReservation.status === 'cancelled') {
        throw new Error('Cette réservation a été annulée');
      }

      // 🎯 MODE MULTI-RETRAIT : Chercher TOUTES les réservations actives de cet utilisateur
      const { data: allUserReservations, error: allReservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          lots(
            *,
            profiles(business_name, business_address, business_logo_url)
          ),
          profiles(full_name)
        `)
        .eq('user_id', qrData.userId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: true });

      if (allReservationsError) {
        console.error('Erreur récupération toutes les réservations:', allReservationsError);
      }

      const typedAllReservations = (allUserReservations || []) as Reservation[];

      // Si plusieurs réservations actives → Mode Multi-Retrait
      if (typedAllReservations.length > 1) {
        setReservations(typedAllReservations);
        setReservation(null); // Pas de réservation unique
        // Présélectionner la réservation scannée
        setSelectedReservationIds(new Set([qrData.reservationId]));
      } else {
        // Mode standard : une seule réservation
        setReservation(typedMainReservation);
        setReservations([]);
        setSelectedReservationIds(new Set());
      }

      setEnteredPin('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la lecture du QR code';
      setError(errorMessage);
      setReservation(null);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePin = async () => {
    // Mode Multi-Retrait
    if (reservations.length > 1) {
      return handleValidateMultiPickup();
    }

    // Mode Standard (une seule réservation)
    if (!reservation) return;

    if (enteredPin !== reservation.pickup_pin) {
      setPinError(true);
      setError('Code PIN incorrect');
      setTimeout(() => {
        setPinError(false);
        setEnteredPin('');
      }, 2000);
      return;
    }

    setPinError(false);

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
      setSuccessMessage('Retrait validé avec succès !');
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

  // 🎯 Nouvelle fonction : Validation groupée multi-retrait
  const handleValidateMultiPickup = async () => {
    if (selectedReservationIds.size === 0) {
      setError('Veuillez sélectionner au moins une réservation');
      return;
    }

    // Vérifier que le PIN correspond à au moins UNE des réservations sélectionnées
    const selectedReservations = reservations.filter(r => selectedReservationIds.has(r.id));
    const pinValid = selectedReservations.some(r => r.pickup_pin === enteredPin);

    if (!pinValid) {
      setPinError(true);
      setError('Code PIN incorrect pour les réservations sélectionnées');
      setTimeout(() => {
        setPinError(false);
        setEnteredPin('');
      }, 2000);
      return;
    }

    setPinError(false);
    setLoading(true);
    setError(null);

    try {
      // Valider toutes les réservations sélectionnées en parallèle
      const updatePromises = selectedReservations.map(async (reservation) => {
        // Update reservation status
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

        const { error: lotError } = await supabase
          .from('lots')
          .update({
            quantity_sold: newQuantitySold,
            quantity_reserved: newQuantityReserved,
          } as unknown as never)
          .eq('id', reservation.lot_id);

        if (lotError) throw lotError;
      });

      await Promise.all(updatePromises);

      setSuccess(true);
      setSuccessMessage(
        `🎉 ${selectedReservationIds.size} panier${selectedReservationIds.size > 1 ? 's' : ''} validé${selectedReservationIds.size > 1 ? 's' : ''} avec succès !`
      );
      
      setTimeout(() => {
        resetState();
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation groupée';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner/désélectionner une réservation
  const toggleReservationSelection = (reservationId: string) => {
    const newSelection = new Set(selectedReservationIds);
    if (newSelection.has(reservationId)) {
      newSelection.delete(reservationId);
    } else {
      newSelection.add(reservationId);
    }
    setSelectedReservationIds(newSelection);
  };

  // Sélectionner/désélectionner toutes les réservations
  const toggleSelectAll = () => {
    if (selectedReservationIds.size === reservations.length) {
      setSelectedReservationIds(new Set());
    } else {
      setSelectedReservationIds(new Set(reservations.map(r => r.id)));
    }
  };

  const resetState = () => {
    setReservation(null);
    setReservations([]);
    setSelectedReservationIds(new Set());
    setEnteredPin('');
    setError(null);
    setSuccess(false);
    setSuccessMessage('');
    setPinError(false);
  };

  // Validation visuelle du PIN en temps réel
  const pinMatch = () => {
    if (enteredPin.length !== 6) return false;
    
    // Mode Multi-Retrait
    if (reservations.length > 1) {
      const selectedReservations = reservations.filter(r => selectedReservationIds.has(r.id));
      return selectedReservations.some(r => r.pickup_pin === enteredPin);
    }
    
    // Mode Standard
    return reservation && reservation.pickup_pin === enteredPin;
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{
        backgroundImage: 'url("/slide-5.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-success-600/90 via-success-500/90 to-success-600/90"></div>
        
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl relative z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse">
            <CheckCircle size={56} className="text-white" strokeWidth={2.5} />
          </div>
          
          <h2 className="text-4xl font-bold text-black mb-3">
            {successMessage || '🎉 Retrait Validé !'}
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
            {selectedReservationIds.size > 1 
              ? `Tous les paniers ont été remis avec succès ! Merci de votre engagement anti-gaspi ! 💚`
              : `Le panier a été remis avec succès. Merci de votre engagement anti-gaspi ! 💚`
            }
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
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col relative overflow-hidden" style={{
        backgroundImage: 'url("/slide-3.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/50 pointer-events-none"></div>

      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-white via-primary-50/30 to-white border-b-2 border-gray-100 px-6 py-4 shadow-sm z-20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Logo et stats à gauche */}
          <div className="flex items-center gap-4 w-1/3">
            <img src="/logo-retrait.png" alt="EcoPanier" className="h-10 rounded-xl object-contain shadow-md" />
            {todayStats && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success-100 rounded-lg border border-success-200">
                <CheckCircle size={14} className="text-success-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-success-700">
                  {todayStats.completed}/{todayStats.total} aujourd'hui
                </span>
              </div>
            )}
          </div>
          
          {/* Titre centré */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-black flex items-center justify-center gap-2">
              <Scan size={24} className="text-primary-600" strokeWidth={2} />
              <span>Station de Retrait</span>
            </h1>
            <p className="text-xs text-gray-600 font-medium">Scannez • Validez • Remettez</p>
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
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 relative z-10">
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
      {!reservation && reservations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-7xl">
            

            {/* Layout 2 colonnes modernisé */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Scanner avec effet glassmorphism */}
              <div className="flex flex-col">
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-transparent to-secondary-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-primary-700">Étape 1</span>
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 mb-3">Scanner QR Code</h3>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        Activez la caméra pour identifier instantanément la réservation
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setScannerActive(true)}
                      disabled={loading}
                      className="group/btn relative w-full py-10 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white rounded-2xl hover:from-primary-700 hover:via-primary-800 hover:to-secondary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {/* Effet de particules */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <div className="relative flex flex-col items-center gap-5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse"></div>
                          <div className="relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300 shadow-2xl">
                            <Scan size={48} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl font-black block mb-2 drop-shadow-md">Activer le Scanner</span>
                          <span className="text-sm text-white/90 font-semibold flex items-center justify-center gap-2">
                            <Sparkles size={14} />
                            Cliquez pour démarrer
                          </span>
                        </div>
                      </div>
                    </button>
                    
                    {/* Statistiques rapides */}
                    {todayStats && todayStats.total > 0 && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-success-50 to-emerald-50 rounded-2xl border border-success-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center shadow-lg">
                              <CheckCircle size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold uppercase">Aujourd'hui</p>
                              <p className="text-lg font-black text-success-700">{todayStats.completed} retraits validés</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-success-600">
                              {Math.round((todayStats.completed / todayStats.total) * 100)}%
                            </div>
                            <p className="text-xs text-gray-600 font-semibold">Taux de succès</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite - Instructions modernisées */}
              <div className="flex flex-col gap-5">
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl overflow-hidden">
                  <div className="text-center mb-8">
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                      <Sparkles size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-purple-700">Guide Rapide</span>
                    </div> */}
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Processus de Retrait</h3>
                    <p className="text-gray-600 font-medium">3 étapes simples pour valider le retrait</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Étape 1 - Design moderne */}
                    <div className="group/step relative bg-gradient-to-br from-primary-50 via-white to-primary-50/50 rounded-2xl p-5 border-2 border-primary-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full blur-3xl group-hover/step:bg-primary-300/40 transition-all duration-500"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-primary-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                          <div className="relative w-14 h-14 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl flex items-center justify-center shadow-xl group-hover/step:scale-110 group-hover/step:-rotate-6 transition-all duration-300">
                            <Scan size={24} className="text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-black rounded-md">1</span>
                            <h4 className="text-xl font-black text-gray-900">Scanner le QR Code</h4>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-3 leading-relaxed">
                            Le client présente son QR code de réservation depuis son téléphone
                          </p>
                          <div className="flex items-center gap-2 text-xs text-primary-700 font-bold">
                            <CheckCircle size={14} strokeWidth={2.5} />
                            <span>Validation automatique instantanée</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Étape 2 - Design moderne */}
                    <div className="group/step relative bg-gradient-to-br from-warning-50 via-white to-orange-50/50 rounded-2xl p-5 border-2 border-warning-200 hover:border-warning-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-warning-200/30 rounded-full blur-3xl group-hover/step:bg-warning-300/40 transition-all duration-500"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-warning-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                          <div className="relative w-14 h-14 bg-gradient-to-br from-warning-600 via-orange-600 to-warning-800 rounded-2xl flex items-center justify-center shadow-xl group-hover/step:scale-110 group-hover/step:-rotate-6 transition-all duration-300">
                            <Lock size={24} className="text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-warning-600 text-white text-xs font-black rounded-md">2</span>
                            <h4 className="text-xl font-black text-gray-900">Vérifier le Code PIN</h4>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-3 leading-relaxed">
                            Saisissez le code PIN à 6 chiffres fourni par le client
                          </p>
                          <div className="flex items-center gap-2 text-xs text-warning-700 font-bold">
                            <Lock size={14} strokeWidth={2.5} />
                            <span>Double authentification sécurisée</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Étape 3 - Design moderne */}
                    <div className="group/step relative bg-gradient-to-br from-success-50 via-white to-emerald-50/50 rounded-2xl p-5 border-2 border-success-200 hover:border-success-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-success-200/30 rounded-full blur-3xl group-hover/step:bg-success-300/40 transition-all duration-500"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-success-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                          <div className="relative w-14 h-14 bg-gradient-to-br from-success-600 via-emerald-600 to-success-800 rounded-2xl flex items-center justify-center shadow-xl group-hover/step:scale-110 group-hover/step:-rotate-6 transition-all duration-300">
                            <CheckCircle size={24} className="text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-success-600 text-white text-xs font-black rounded-md">3</span>
                            <h4 className="text-xl font-black text-gray-900">Remettre le Panier</h4>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-3 leading-relaxed">
                            Validation finale et remise du panier au client satisfait
                          </p>
                          <div className="flex items-center gap-2 text-xs text-success-700 font-bold">
                            <Heart size={14} strokeWidth={2.5} className="fill-current" />
                            <span>Transaction anti-gaspi réussie !</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : reservations.length > 1 ? (
        // 🎯 MODE MULTI-RETRAIT : Plusieurs réservations actives
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden relative z-10">
          {/* Liste des réservations */}
          <div className="lg:w-1/2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
            {/* En-tête Mode Multi-Retrait */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Layers size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Mode Multi-Retrait</h3>
                  <p className="text-sm text-purple-100">
                    {reservations[0]?.profiles.full_name} • {reservations.length} panier{reservations.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                {selectedReservationIds.size === reservations.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            {/* Liste scrollable des réservations */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {reservations.map((res, index) => (
                <div
                  key={res.id}
                  onClick={() => toggleReservationSelection(res.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReservationIds.has(res.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox personnalisé */}
                    <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedReservationIds.has(res.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedReservationIds.has(res.id) && (
                        <Check size={16} className="text-white" strokeWidth={3} />
                      )}
                    </div>

                    {/* Numéro */}
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{res.lots.title}</h4>
                        {res.is_donation && (
                          <Heart size={14} className="text-red-500 flex-shrink-0" strokeWidth={2.5} />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShoppingBag size={12} strokeWidth={2} />
                          <span>Qté: {res.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          {res.is_donation ? (
                            <>
                              <Heart size={12} strokeWidth={2} className="text-red-500" />
                              <span className="text-red-600 font-semibold">Gratuit</span>
                            </>
                          ) : (
                            <>
                              <Euro size={12} strokeWidth={2} />
                              <span>{res.total_price.toFixed(2)}€</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={11} strokeWidth={2} />
                        <span className="truncate">{res.lots.profiles.business_name}</span>
                      </div>

                      {/* Code PIN si sélectionné */}
                      {selectedReservationIds.has(res.id) && (
                        <div className="mt-2 px-2 py-1 bg-purple-100 rounded text-xs font-mono font-bold text-purple-700 flex items-center gap-1.5">
                          <Lock size={11} strokeWidth={2.5} />
                          PIN: {res.pickup_pin}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé sélection */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Sélection : {selectedReservationIds.size}/{reservations.length}
                </span>
                <span className="font-bold text-purple-700">
                  Total : {reservations
                    .filter(r => selectedReservationIds.has(r.id))
                    .reduce((sum, r) => sum + (r.is_donation ? 0 : r.total_price), 0)
                    .toFixed(2)}€
                </span>
              </div>
            </div>
          </div>

          {/* Validation PIN (même logique qu'avant) */}
          <div className="lg:w-1/2 flex flex-col gap-3">
            <div className="flex-1 bg-gradient-to-br from-white via-warning-50/30 to-white rounded-xl p-4 border border-gray-200 shadow-lg flex flex-col justify-center min-h-0">
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 shadow-lg transition-all duration-300 ${
                  pinMatch() 
                    ? 'bg-gradient-to-br from-success-500 to-success-600 animate-pulse' 
                    : pinError
                    ? 'bg-gradient-to-br from-red-500 to-red-600 animate-shake'
                    : 'bg-gradient-to-br from-warning-500 to-warning-600'
                }`}>
                  {pinMatch() ? (
                    <CheckCircle size={24} className="text-white" strokeWidth={2.5} />
                  ) : pinError ? (
                    <XCircle size={24} className="text-white" strokeWidth={2.5} />
                  ) : (
                    <Lock size={24} className="text-white" strokeWidth={2.5} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pinMatch() ? '✓ PIN Valide' : pinError ? '✗ PIN Incorrect' : 'Validation Groupée'}
                </h3>
                <p className="text-xs text-gray-600">
                  {pinMatch() 
                    ? `Prêt à valider ${selectedReservationIds.size} panier${selectedReservationIds.size > 1 ? 's' : ''}`
                    : pinError
                    ? 'Vérifiez le code'
                    : 'Saisissez un code PIN valide'
                  }
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value.replace(/\D/g, ''));
                      setPinError(false);
                      setError(null);
                    }}
                    className={`w-full px-4 py-4 text-center text-4xl font-mono font-bold rounded-xl outline-none transition-all duration-300 tracking-[0.8rem] shadow-lg ${
                      pinMatch()
                        ? 'border-2 border-success-500 bg-gradient-to-br from-success-50 to-success-100 ring-2 ring-success-200'
                        : pinError
                        ? 'border-2 border-red-500 bg-gradient-to-br from-red-50 to-red-100 ring-2 ring-red-200 animate-shake'
                        : 'border-2 border-warning-300 bg-gradient-to-br from-white to-warning-50 focus:border-warning-500 focus:ring-2 focus:ring-warning-100'
                    }`}
                    placeholder="● ● ● ● ● ●"
                    autoFocus
                    disabled={loading}
                  />
                  
                  {/* Indicateurs visuels */}
                  <div className="mt-2 flex justify-center gap-1.5">
                    {[...Array(6)].map((_, i) => {
                      const isFilled = i < enteredPin.length;
                      const isCorrect = pinMatch() && isFilled;
                      const isWrong = pinError && isFilled;
                      
                      return (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isCorrect
                              ? 'bg-gradient-to-r from-success-500 to-success-600 scale-110 shadow-md'
                              : isWrong
                              ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110 shadow-md'
                              : isFilled
                              ? 'bg-gradient-to-r from-warning-500 to-warning-600 scale-110 shadow-md'
                              : 'bg-gray-300'
                          }`}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Message de validation */}
                  {pinMatch() && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-success-600 font-semibold text-xs animate-fade-in">
                      <Sparkles size={12} strokeWidth={2.5} />
                      <span>Code vérifié ✓</span>
                    </div>
                  )}
                </div>
                
                <div className={`rounded-lg p-2.5 border transition-all duration-300 ${
                  pinMatch()
                    ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200'
                    : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      pinMatch() ? 'bg-success-500' : 'bg-purple-500'
                    }`}>
                      <Lock size={12} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${pinMatch() ? 'text-success-800' : 'text-purple-800'}`}>
                        Code PIN Client
                      </p>
                      <p className={`text-[10px] ${pinMatch() ? 'text-success-700' : 'text-purple-700'}`}>
                        {pinMatch() ? `Valider ${selectedReservationIds.size} panier${selectedReservationIds.size > 1 ? 's' : ''}` : 'Code à 6 chiffres'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <button
                onClick={resetState}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border-2 border-gray-200 transition-all font-bold text-sm shadow-md hover:shadow-lg"
              >
                ← Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={selectedReservationIds.size === 0 || enteredPin.length !== 6 || loading || !pinMatch()}
                className={`py-3 rounded-lg transition-all font-bold text-sm shadow-lg flex items-center justify-center gap-2 ${
                  pinMatch() && !loading && selectedReservationIds.size > 0
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Validation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} strokeWidth={2.5} />
                    <span>{pinMatch() ? `Valider (${selectedReservationIds.size})` : 'PIN requis'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : reservation ? (
        // MODE STANDARD : Une seule réservation
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden relative z-10">
          {/* Détails de la réservation */}
          <div className="lg:w-1/2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
            {/* En-tête avec image */}
            <div className="relative flex-shrink-0">
              {reservation.lots.image_urls && reservation.lots.image_urls.length > 0 ? (
                <div className="h-28 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
                  <img 
                    src={reservation.lots.image_urls[0]} 
                    alt={reservation.lots.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="h-28 bg-gradient-to-br from-primary-100 via-secondary-100 to-primary-50 flex items-center justify-center">
                  <Package size={40} className="text-primary-300" strokeWidth={1.5} />
                </div>
              )}
              
              {/* Badge statut */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-lg backdrop-blur-sm ${
                reservation.status === 'pending'
                    ? 'bg-warning-500/90 text-white border-warning-600'
                    : 'bg-success-500/90 text-white border-success-600'
              }`}>
                {reservation.status === 'pending' ? '⏳ En Attente' : '✅ Confirmée'}
              </span>
            </div>

              {/* Badge don */}
              {reservation.is_donation && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-600 shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                    <Heart size={12} strokeWidth={2.5} />
                    Don solidaire
                  </span>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Package size={16} className="text-primary-600" strokeWidth={2} />
                  Détails commande
                </h3>
              </div>

              <div className="space-y-2">
                {/* Produit */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg p-2.5 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <ShoppingBag size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">Produit</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5 truncate">{reservation.lots.title}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5 line-clamp-1">{reservation.lots.description}</div>
                    </div>
                  </div>
                </div>

                {/* Client */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-2.5 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <User size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">Client</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5 truncate">{reservation.profiles.full_name}</div>
                    </div>
                  </div>
                </div>

                {/* Quantité et Prix */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-2.5 border border-green-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Package size={12} className="text-green-600" strokeWidth={2} />
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">Quantité</span>
                    </div>
                    <div className="text-xl font-bold text-green-700">{reservation.quantity}</div>
                    <div className="text-[10px] text-gray-600">unité(s)</div>
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-lg p-2.5 border border-primary-200">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {reservation.is_donation ? (
                        <Heart size={12} className="text-red-500" strokeWidth={2} />
                      ) : (
                        <Euro size={12} className="text-primary-600" strokeWidth={2} />
                      )}
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">
                        {reservation.is_donation ? 'Don' : 'Prix'}
                      </span>
                    </div>
                    {reservation.is_donation ? (
                      <div className="text-xl font-bold text-red-600 flex items-center gap-1">
                        <Heart size={16} className="text-red-500" strokeWidth={2.5} />
                        <span className="text-sm">Gratuit</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-primary-700">{reservation.total_price.toFixed(2)}€</div>
                        <div className="text-[10px] text-gray-600">
                          {reservation.quantity} × {reservation.lots.discounted_price.toFixed(2)}€
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Commerçant */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-2.5 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">Commerçant</span>
                      <div className="text-sm font-bold text-gray-900 mt-0.5 truncate">{reservation.lots.profiles.business_name}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5 truncate flex items-center gap-1">
                        <MapPin size={10} className="text-gray-500" strokeWidth={2} />
                        {reservation.lots.profiles.business_address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horaires de retrait */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-lg p-2.5 border border-indigo-200">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <Clock size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-600 uppercase font-semibold">Horaires</span>
                      <div className="text-xs font-bold text-gray-900 mt-0.5">
                        {format(new Date(reservation.lots.pickup_start), 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1.5">
                        <span>{format(new Date(reservation.lots.pickup_start), 'HH:mm', { locale: fr })}</span>
                        <span>→</span>
                        <span>{format(new Date(reservation.lots.pickup_end), 'HH:mm', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caractéristiques spéciales */}
                {(reservation.lots.requires_cold_chain || reservation.lots.is_urgent) && (
                  <div className="flex gap-1.5 flex-wrap">
                    {reservation.lots.requires_cold_chain && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold border border-blue-200">
                        ❄️ Froid
                      </span>
                    )}
                    {reservation.lots.is_urgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-semibold border border-red-200">
                        ⚡ Urgent
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validation PIN */}
          <div className="lg:w-1/2 flex flex-col gap-3">
            <div className="flex-1 bg-gradient-to-br from-white via-warning-50/30 to-white rounded-xl p-4 border border-gray-200 shadow-lg flex flex-col justify-center min-h-0">
              <div className="text-center mb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 shadow-lg transition-all duration-300 ${
                  pinMatch() 
                    ? 'bg-gradient-to-br from-success-500 to-success-600 animate-pulse' 
                    : pinError
                    ? 'bg-gradient-to-br from-red-500 to-red-600 animate-shake'
                    : 'bg-gradient-to-br from-warning-500 to-warning-600'
                }`}>
                  {pinMatch() ? (
                    <CheckCircle size={24} className="text-white" strokeWidth={2.5} />
                  ) : pinError ? (
                    <XCircle size={24} className="text-white" strokeWidth={2.5} />
                  ) : (
                    <Lock size={24} className="text-white" strokeWidth={2.5} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pinMatch() ? '✓ PIN Valide' : pinError ? '✗ PIN Incorrect' : 'Validation'}
                </h3>
                <p className="text-xs text-gray-600">
                  {pinMatch() 
                    ? 'Prêt à valider'
                    : pinError
                    ? 'Vérifiez le code'
                    : 'Saisissez le code PIN'}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value.replace(/\D/g, ''));
                      setPinError(false);
                      setError(null);
                    }}
                    className={`w-full px-4 py-4 text-center text-4xl font-mono font-bold rounded-xl outline-none transition-all duration-300 tracking-[0.8rem] shadow-lg ${
                      pinMatch()
                        ? 'border-2 border-success-500 bg-gradient-to-br from-success-50 to-success-100 ring-2 ring-success-200'
                        : pinError
                        ? 'border-2 border-red-500 bg-gradient-to-br from-red-50 to-red-100 ring-2 ring-red-200 animate-shake'
                        : 'border-2 border-warning-300 bg-gradient-to-br from-white to-warning-50 focus:border-warning-500 focus:ring-2 focus:ring-warning-100'
                    }`}
                    placeholder="● ● ● ● ● ●"
                    autoFocus
                    disabled={loading}
                  />
                  
                  {/* Indicateurs visuels améliorés */}
                  <div className="mt-2 flex justify-center gap-1.5">
                    {[...Array(6)].map((_, i) => {
                      const isFilled = i < enteredPin.length;
                      const isCorrect = pinMatch() && isFilled;
                      const isWrong = pinError && isFilled;
                      
                      return (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isCorrect
                              ? 'bg-gradient-to-r from-success-500 to-success-600 scale-110 shadow-md'
                              : isWrong
                              ? 'bg-gradient-to-r from-red-500 to-red-600 scale-110 shadow-md'
                              : isFilled
                              ? 'bg-gradient-to-r from-warning-500 to-warning-600 scale-110 shadow-md'
                              : 'bg-gray-300'
                          }`}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Message de validation */}
                  {pinMatch() && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-success-600 font-semibold text-xs animate-fade-in">
                      <Sparkles size={12} strokeWidth={2.5} />
                      <span>Code vérifié ✓</span>
                    </div>
                  )}
                </div>
                
                <div className={`rounded-lg p-2.5 border transition-all duration-300 ${
                  pinMatch()
                    ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200'
                    : 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      pinMatch() ? 'bg-success-500' : 'bg-warning-500'
                    }`}>
                      <Lock size={12} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${pinMatch() ? 'text-success-800' : 'text-warning-800'}`}>
                        Code PIN Client
                      </p>
                      <p className={`text-[10px] ${pinMatch() ? 'text-success-700' : 'text-warning-700'}`}>
                        {pinMatch() ? 'Prêt à valider' : 'Code à 6 chiffres'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <button
                onClick={resetState}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border-2 border-gray-200 transition-all font-bold text-sm shadow-md hover:shadow-lg"
              >
                ← Annuler
              </button>
              <button
                onClick={handleValidatePin}
                disabled={enteredPin.length !== 6 || loading || !pinMatch()}
                className={`py-3 rounded-lg transition-all font-bold text-sm shadow-lg flex items-center justify-center gap-2 ${
                  pinMatch() && !loading
                    ? 'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Validation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} strokeWidth={2.5} />
                    <span>{pinMatch() ? 'Valider' : 'PIN requis'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

