import { useState, useEffect, type SyntheticEvent } from 'react';
import { QRScanner } from '../shared/QRScanner';
import { PickupHelp } from './PickupHelp';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
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

type SuspendedBasketWithLot = {
  id: string;
  amount: number;
  lot?: {
    id: string;
    title: string;
    status: string;
    quantity_total: number;
    quantity_reserved: number;
    quantity_sold: number;
    merchant_id: string;
  } | null;
};

interface QRData {
  reservationId?: string;
  pin?: string;
  userId?: string;
  beneficiaryId?: string;
  type?: 'reservation' | 'beneficiary';
}

export const PickupStation = () => {
  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();

  // État local
  const [scannerActive, setScannerActive] = useState(false);
  const [helpActive, setHelpActive] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
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
  const [suspendedBaskets, setSuspendedBaskets] = useState<Array<{
    id: string;
    amount: number;
    lot?: {
      id: string;
      title: string;
      discounted_price: number;
      original_price: number;
      category: string;
      image_urls: string[] | null;
      pickup_start: string;
      pickup_end: string;
      status: string;
      quantity_total: number;
      quantity_reserved: number;
      quantity_sold: number;
      merchant_id: string;
    } | null;
  }>>([]);
  const [selectedBasketIds, setSelectedBasketIds] = useState<Set<string>>(new Set());
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<{
    id: string;
    full_name: string;
    role: string;
    beneficiary_id: string | null;
  } | null>(null);

  const merchantLogoUrl = profile?.business_logo_url || '/logo-retrait.png';
  const merchantLogoAlt = profile?.business_name ? `Logo ${profile.business_name}` : 'Logo EcoPanier';

  const handleMerchantLogoError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/logo-retrait.png';
  };

  // Charger les statistiques du jour au montage
  useEffect(() => {
    const loadTodayStats = async () => {
      if (!profile || profile.role !== 'merchant') return;

      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data, error: statsError } = await supabase
          .from('reservations')
          .select(`
            status,
            lots!inner(merchant_id)
          `)
          .eq('lots.merchant_id', profile.id)
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
  }, [success, profile]); // Recharger après chaque succès

  const handleScan = async (data: string) => {
    setScannerActive(false);
    setLoading(true);
    setError(null);
    setSuspendedBaskets([]);
    setSelectedBasketIds(new Set());
    setBeneficiaryProfile(null);

    if (!profile || profile.role !== 'merchant') {
      setError('Accès réservé aux commerçants');
      setLoading(false);
      return;
    }

    try {
      // Essayer de parser comme JSON (réservation) ou utiliser directement comme UUID (bénéficiaire)
      let qrData: QRData;
      let beneficiaryId: string | null = null;

      try {
        qrData = JSON.parse(data);
        // Si c'est un JSON avec reservationId, c'est une réservation
        if (qrData.reservationId) {
          qrData.type = 'reservation';
        }
      } catch {
        // Si ce n'est pas du JSON, c'est probablement un UUID de bénéficiaire
        beneficiaryId = data.trim();
        qrData = { type: 'beneficiary', beneficiaryId };
      }

      // Si c'est un QR code de bénéficiaire
      if (qrData.type === 'beneficiary' || beneficiaryId) {
        const userId = beneficiaryId || qrData.beneficiaryId;
        if (!userId) {
          throw new Error('QR code invalide');
        }

        // Vérifier que c'est un bénéficiaire
        const { data: beneficiaryData, error: beneficiaryError } = await supabase
          .from('profiles')
          .select('id, full_name, role, beneficiary_id')
          .eq('id', userId)
          .eq('role', 'beneficiary')
          .single();

        if (beneficiaryError || !beneficiaryData) {
          throw new Error('Bénéficiaire introuvable');
        }

        setBeneficiaryProfile(beneficiaryData);

        // Charger les paniers suspendus disponibles pour ce bénéficiaire et ce commerçant
        const { data: baskets, error: basketsError } = await supabase
          .from('suspended_baskets')
          .select(`
            *,
            lot:lots!lot_id(
              id,
              title,
              discounted_price,
              original_price,
              category,
              image_urls,
              pickup_start,
              pickup_end,
              status,
              quantity_total,
              quantity_reserved,
              quantity_sold,
              merchant_id
            )
          `)
          .eq('status', 'available')
          .eq('merchant_id', profile.id)
          .is('claimed_by', null);

        if (basketsError) {
          console.error('Erreur chargement paniers:', basketsError);
          throw new Error('Impossible de charger les paniers suspendus');
        }

        // Filtrer pour ne garder que ceux avec un lot disponible
        const availableBaskets = (baskets || []).filter((basket: SuspendedBasketWithLot) => {
          if (!basket.lot) return false;
          const lot = basket.lot as {
            id: string;
            title: string;
            status: string;
            quantity_total: number;
            quantity_reserved: number;
            quantity_sold: number;
            merchant_id: string;
          };
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          return lot.status === 'available' && lot.merchant_id === profile.id && availableQty > 0;
        });

        if (availableBaskets.length === 0) {
          throw new Error('Aucun panier suspendu disponible pour ce bénéficiaire');
        }

        setSuspendedBaskets(availableBaskets);
        setReservation(null);
        setReservations([]);
        setEnteredPin('');
        setLoading(false);
        return;
      }

      // Sinon, c'est une réservation normale
      if (!qrData.reservationId) {
        throw new Error('QR code invalide');
      }

      // Fetch la réservation principale scannée avec filtre par commerçant
      const { data: mainReservation, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          *,
          lots!inner(
            *,
            merchant_id,
            profiles(business_name, business_address, business_logo_url)
          ),
          profiles(full_name)
        `)
        .eq('id', qrData.reservationId)
        .eq('lots.merchant_id', profile.id)
        .single();

      if (fetchError) throw new Error('Réservation introuvable ou n\'appartient pas à votre commerce');

      const typedMainReservation = mainReservation as Reservation;

      // Vérifier le statut de la réservation principale
      if (typedMainReservation.status === 'completed') {
        throw new Error('Cette réservation a déjà été récupérée');
      }

      if (typedMainReservation.status === 'cancelled') {
        throw new Error('Cette réservation a été annulée');
      }

      // 🎯 MODE MULTI-RETRAIT : Chercher TOUTES les réservations actives de cet utilisateur pour CE COMMERÇANT
      const { data: allUserReservations, error: allReservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          lots!inner(
            *,
            merchant_id,
            profiles(business_name, business_address, business_logo_url)
          ),
          profiles(full_name)
        `)
        .eq('user_id', qrData.userId || '')
        .eq('lots.merchant_id', profile.id)
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
        setSelectedReservationIds(new Set([qrData.reservationId!]));
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
      setSuspendedBaskets([]);
      setBeneficiaryProfile(null);
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

  // Fonction pour valider les paniers suspendus sélectionnés
  const handleValidateSuspendedBaskets = async () => {
    if (selectedBasketIds.size === 0) {
      setError('Veuillez sélectionner au moins un panier suspendu');
      return;
    }

    if (!beneficiaryProfile) {
      setError('Bénéficiaire introuvable');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { suspendedBasketService } = await import('../../utils/suspendedBasketService');
      
      // Valider tous les paniers sélectionnés en parallèle
      const validationPromises = Array.from(selectedBasketIds).map(async (basketId) => {
        // Récupérer le panier suspendu et créer une réservation
        await suspendedBasketService.claimBasket(basketId, beneficiaryProfile.id);
      });

      await Promise.all(validationPromises);

      // Récupérer les réservations créées pour les marquer comme complétées
      const { data: newReservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, lot_id, quantity')
        .eq('user_id', beneficiaryProfile.id)
        .in('status', ['confirmed'])
        .order('created_at', { ascending: false })
        .limit(selectedBasketIds.size);

      if (!reservationsError && newReservations) {
        // Marquer les réservations comme complétées
        const completionPromises = newReservations.map(async (reservation) => {
          const reservationData = reservation as { id: string; lot_id: string; quantity: number };
          
          const { error: updateError } = await supabase
            .from('reservations')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            } as unknown as never)
            .eq('id', reservationData.id);

          if (updateError) throw updateError;

          // Mettre à jour les quantités du lot
          const { data: lot, error: lotFetchError } = await supabase
            .from('lots')
            .select('quantity_sold, quantity_reserved')
            .eq('id', reservationData.lot_id)
            .single();

          if (lotFetchError) throw lotFetchError;

          const lotData = lot as { quantity_sold: number; quantity_reserved: number };
          const newQuantitySold = (lotData?.quantity_sold || 0) + reservationData.quantity;
          const newQuantityReserved = Math.max(0, (lotData?.quantity_reserved || 0) - reservationData.quantity);

          const { error: lotUpdateError } = await supabase
            .from('lots')
            .update({
              quantity_sold: newQuantitySold,
              quantity_reserved: newQuantityReserved,
            } as unknown as never)
            .eq('id', reservationData.lot_id);

          if (lotUpdateError) throw lotUpdateError;
        });

        await Promise.all(completionPromises);
      }

      setSuccess(true);
      setSuccessMessage(
        `🎉 ${selectedBasketIds.size} panier${selectedBasketIds.size > 1 ? 's suspendus' : ' suspendu'} validé${selectedBasketIds.size > 1 ? 's' : ''} avec succès !`
      );
      
      setTimeout(() => {
        resetState();
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation des paniers suspendus';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner/désélectionner un panier suspendu
  const toggleBasketSelection = (basketId: string) => {
    const newSelection = new Set(selectedBasketIds);
    if (newSelection.has(basketId)) {
      newSelection.delete(basketId);
    } else {
      newSelection.add(basketId);
    }
    setSelectedBasketIds(newSelection);
  };

  const resetState = () => {
    setReservation(null);
    setReservations([]);
    setSuspendedBaskets([]);
    setSelectedBasketIds(new Set());
    setBeneficiaryProfile(null);
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

  // Early return si l'utilisateur n'est pas un commerçant
  if (!profile || profile.role !== 'merchant') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock size={56} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold text-black mb-3">Accès Refusé</h2>
          <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
            La Station de Retrait est réservée aux commerçants uniquement.
          </p>
        </div>
      </div>
    );
  }

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
              ? `Tous les paniers ont été remis avec succès! 💚`
              : `Le panier a été remis avec succès! 💚`
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
      <div className="relative min-h-screen bg-neutral-50 bg-[url('/slide-5.png')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 section-gradient opacity-70"></div>

        <div className="relative flex min-h-screen flex-col overflow-y-auto lg:overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Logo commerçant et stats */}
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
                    <img
                      src={merchantLogoUrl}
                      alt={merchantLogoAlt}
                      className="h-full w-full object-cover"
                      onError={handleMerchantLogoError}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {profile?.business_name ?? 'EcoPanier'}
                    </span>
                    <span className="text-xs font-medium text-gray-500">Mode commerçant</span>
                  </div>
                </div>
                {todayStats && (
                  <div className="hidden items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-1.5 sm:flex">
                    <CheckCircle size={14} className="text-success-600" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-success-700">
                      {todayStats.completed}/{todayStats.total} aujourd'hui
                    </span>
                  </div>
                )}
              </div>

              {/* Titre */}
              <div className="flex flex-col items-start gap-1 text-left sm:items-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
                  <Sparkles size={12} />
                  Espace commerçant
                </span>
                <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
                  <Scan size={22} className="text-primary-600" strokeWidth={2} />
                  Station de Retrait
                </h1>
                <p className="text-xs font-medium text-gray-600">Scannez • Validez • Remettez</p>
              </div>

              {/* Actions header */}
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                {todayStats && (
                  <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-3 py-1.5 sm:hidden">
                    <CheckCircle size={14} className="text-success-600" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-success-700">
                      {todayStats.completed}/{todayStats.total} aujourd'hui
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setHelpActive(true)}
                  className="rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm font-semibold text-primary-600 shadow-sm transition-all hover:border-primary-200 hover:text-primary-700"
                  aria-label="Ouvrir l'aide"
                >
                  <HelpCircle size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </header>

          {/* Message d'erreur */}
          {error && (
            <div className="relative z-10 px-4 pt-4 sm:px-6 lg:px-10">
              <div className="mx-auto flex w-full max-w-4xl items-start gap-3 rounded-2xl border border-red-100 bg-red-50/90 p-4 shadow-lg">
                <AlertCircle size={20} className="text-red-600" />
                <p className="flex-1 text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="rounded-lg p-1 transition-all hover:bg-red-100"
                >
                  <XCircle size={20} className="text-red-600" />
                </button>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-10 flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-10">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
              {suspendedBaskets.length > 0 ? (
        // 🎯 MODE PANIERS SUSPENDUS : Affichage des paniers suspendus disponibles
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Liste des paniers suspendus */}
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-accent-200/60 bg-white/90 shadow-xl backdrop-blur">
            {/* En-tête */}
            <div className="flex items-center justify-between bg-gradient-to-r from-accent-600 via-pink-600 to-accent-700 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Heart size={24} strokeWidth={2.5} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Paniers suspendus</h3>
                  <p className="text-sm text-pink-100">
                    {beneficiaryProfile?.full_name} • {suspendedBaskets.length} panier{suspendedBaskets.length > 1 ? 's' : ''} disponible{suspendedBaskets.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedBasketIds.size === suspendedBaskets.length) {
                    setSelectedBasketIds(new Set());
                  } else {
                    setSelectedBasketIds(new Set(suspendedBaskets.map((b) => b.id)));
                  }
                }}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition-all hover:bg-white/20"
              >
                {selectedBasketIds.size === suspendedBaskets.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>

            {/* Liste scrollable des paniers */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {suspendedBaskets.map((basket, index: number) => {
                const lot = basket.lot;
                if (!lot) return null;
                
                return (
                  <div
                    key={basket.id}
                    onClick={() => toggleBasketSelection(basket.id)}
                    className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                      selectedBasketIds.has(basket.id)
                        ? 'border-accent-500 bg-accent-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-accent-300 hover:bg-accent-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedBasketIds.has(basket.id)
                          ? 'bg-accent-600 border-accent-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedBasketIds.has(basket.id) && (
                          <Check size={16} className="text-white" strokeWidth={3} />
                        )}
                      </div>

                      {/* Numéro */}
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>

                      {/* Image du lot */}
                      {lot.image_urls && lot.image_urls.length > 0 ? (
                        <img
                          src={lot.image_urls[0]}
                          alt={lot.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-start justify-between gap-2">
                          <h4 className="truncate text-sm font-bold text-gray-900">{lot.title}</h4>
                          <Heart size={14} className="text-accent-600 flex-shrink-0" strokeWidth={2.5} />
                        </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <ShoppingBag size={12} strokeWidth={2} />
                            <span>Qté: 1</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Heart size={12} strokeWidth={2} className="text-accent-600" />
                            <span className="text-accent-600 font-semibold">Gratuit</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={11} strokeWidth={2} />
                          <span className="truncate">{profile?.business_name}</span>
                        </div>

                        {/* Montant offert */}
                        <div className="mt-2 rounded bg-accent-100 px-2 py-1 text-xs font-semibold text-accent-700">
                          Offert : {basket.amount.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Résumé sélection */}
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
              <div className="flex flex-col items-start justify-between gap-1 text-sm sm:flex-row sm:items-center">
                <span className="font-medium text-gray-600">
                  Sélection : {selectedBasketIds.size}/{suspendedBaskets.length}
                </span>
                <span className="font-bold text-accent-700">
                  {selectedBasketIds.size} panier{selectedBasketIds.size > 1 ? 's' : ''} gratuit{selectedBasketIds.size > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="flex h-full flex-col rounded-2xl border border-accent-200/60 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-pink-600 shadow-lg">
                  <Heart size={24} className="text-white fill-current" strokeWidth={2.5} />
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">
                  Validation Paniers Suspendus
                </h3>
                <p className="text-xs text-gray-600">
                  {selectedBasketIds.size > 0
                    ? `Prêt à valider ${selectedBasketIds.size} panier${selectedBasketIds.size > 1 ? 's' : ''}`
                    : 'Sélectionnez au moins un panier'}
                </p>
            </div>

            {/* Informations bénéficiaire */}
            {beneficiaryProfile && (
              <div className="mb-4 rounded-xl border border-accent-100 bg-white/70 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600 uppercase">Bénéficiaire</span>
                  </div>
                <p className="font-bold text-gray-900">{beneficiaryProfile.full_name}</p>
                {beneficiaryProfile.beneficiary_id && (
                  <p className="mt-1 font-mono text-xs text-gray-600">{beneficiaryProfile.beneficiary_id}</p>
                )}
              </div>
            )}

            {/* Bouton de validation */}
            <button
              onClick={handleValidateSuspendedBaskets}
              disabled={selectedBasketIds.size === 0 || loading}
              className={`mt-auto w-full rounded-xl py-4 text-sm font-bold text-white transition-all duration-300 shadow-lg ${
                selectedBasketIds.size > 0 && !loading
                  ? 'bg-gradient-to-r from-accent-600 to-pink-600 hover:from-accent-700 hover:to-pink-700 hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Validation...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Heart size={18} className="fill-current" />
                  Valider {selectedBasketIds.size} panier{selectedBasketIds.size > 1 ? 's' : ''}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : !reservation && reservations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-7xl">
            

            {/* Layout colonne unique modernisé */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/40 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-transparent to-secondary-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-center mb-3">
                      <h3 className="text-xl font-black text-gray-900 mb-1">Scanner QR Code</h3>
                      <p className="text-gray-600 text-sm">Activez la caméra pour identifier la réservation</p>
                    </div>
                    <button
                      onClick={() => setScannerActive(true)}
                      disabled={loading}
                      className="group/btn w-full py-4 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white rounded-xl hover:from-primary-700 hover:via-primary-800 hover:to-secondary-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover/btn:scale-105 group-hover/btn:rotate-2 transition-all duration-200 shadow-xl">
                          <Scan size={36} className="text-white drop-shadow" strokeWidth={2.5} />
                        </div>
                        <span className="text-base font-bold drop-shadow">Activer le Scanner</span>
                        <span className="text-xs text-white/80 flex items-center gap-1">
                          <Sparkles size={12} /> Cliquez pour démarrer
                        </span>
                      </div>
                    </button>
                    {todayStats && todayStats.total > 0 && (
                      <div className="mt-4 p-2 bg-success-50 rounded-xl border border-success-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-success-500 rounded-lg flex items-center justify-center shadow">
                              <CheckCircle size={16} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-600 font-semibold uppercase mb-0.5">Aujourd'hui</p>
                              <p className="text-sm font-black text-success-700">{todayStats.completed} retraits</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-success-600">
                              {Math.round((todayStats.completed / todayStats.total) * 100)}%
                            </div>
                            <p className="text-[10px] text-gray-600 font-semibold">succès</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setProcessModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-primary-200 bg-white px-4 py-2 text-xs font-bold text-primary-700 shadow transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 hover:shadow-md"
                >
                  <Sparkles size={14} />
                  Processus de retrait
                </button>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-shrink-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-shrink-0">
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
          </div>
        </div>
      </div>

      {processModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setProcessModalOpen(false)}
          ></div>
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Processus de Retrait</h3>
              </div>
              <button
                type="button"
                onClick={() => setProcessModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 transition-all hover:border-primary-200 hover:text-primary-600"
                aria-label="Fermer le processus de retrait"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <p className="text-sm font-medium text-gray-600">
                Suivez ces trois étapes pour valider en toute sérénité la remise du panier à votre client.
              </p>
              <div className="space-y-4">
                <div className="group/step relative overflow-hidden rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-50/50 p-5 transition-all duration-300 hover:border-primary-400 hover:shadow-xl">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary-200/30 blur-3xl transition-all duration-500 group-hover/step:bg-primary-300/40"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-primary-400 opacity-50 blur-lg"></div>
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white shadow-xl transition-all duration-300 group-hover/step:-rotate-6 group-hover/step:scale-110">
                        <Scan size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-primary-600 px-2 py-0.5 text-xs font-black text-white">1</span>
                        <h4 className="text-xl font-black text-gray-900">Scanner le QR Code</h4>
                      </div>
                      <p className="mb-3 text-sm font-medium leading-relaxed text-gray-700">
                        Présentez le QR code de réservation vers la caméra afin d'identifier automatiquement le client et son panier.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary-700">
                        <CheckCircle size={14} strokeWidth={2.5} />
                        <span>Validation instantanée du panier</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="group/step relative overflow-hidden rounded-2xl border-2 border-warning-200 bg-gradient-to-br from-warning-50 via-white to-orange-50/50 p-5 transition-all duration-300 hover:border-warning-400 hover:shadow-xl">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-warning-200/30 blur-3xl transition-all duration-500 group-hover/step:bg-warning-300/40"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-warning-400 opacity-50 blur-lg"></div>
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-warning-600 via-orange-600 to-warning-800 text-white shadow-xl transition-all duration-300 group-hover/step:-rotate-6 group-hover/step:scale-110">
                        <Lock size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-warning-600 px-2 py-0.5 text-xs font-black text-white">2</span>
                        <h4 className="text-xl font-black text-gray-900">Vérifier le code PIN</h4>
                      </div>
                      <p className="mb-3 text-sm font-medium leading-relaxed text-gray-700">
                        Demandez le code PIN à 6 chiffres au client et saisissez-le pour sécuriser l'opération de retrait.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-warning-700">
                        <Lock size={14} strokeWidth={2.5} />
                        <span>Double contrôle de sécurité</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="group/step relative overflow-hidden rounded-2xl border-2 border-success-200 bg-gradient-to-br from-success-50 via-white to-emerald-50/50 p-5 transition-all duration-300 hover:border-success-400 hover:shadow-xl">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-success-200/30 blur-3xl transition-all duration-500 group-hover/step:bg-success-300/40"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-success-400 opacity-50 blur-lg"></div>
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-success-600 via-emerald-600 to-success-800 text-white shadow-xl transition-all duration-300 group-hover/step:-rotate-6 group-hover/step:scale-110">
                        <CheckCircle size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-success-600 px-2 py-0.5 text-xs font-black text-white">3</span>
                        <h4 className="text-xl font-black text-gray-900">Remettre le panier</h4>
                      </div>
                      <p className="mb-3 text-sm font-medium leading-relaxed text-gray-700">
                        Validez la réservation, remettez le panier et félicitez votre client pour son geste anti-gaspi.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-success-700">
                        <Heart size={14} strokeWidth={2.5} className="fill-current" />
                        <span>Transaction solidaire réussie</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProcessModalOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-primary-700 hover:to-secondary-700 hover:shadow-xl"
              >
                <CheckCircle size={18} />
                Compris, retourner au scan
              </button>
            </div>
          </div>
        </div>
      )}

      <QRScanner
        isActive={scannerActive}
        onScan={handleScan}
        onClose={() => setScannerActive(false)}
      />

      {helpActive && <PickupHelp onClose={() => setHelpActive(false)} />}
    </>
  );
};

