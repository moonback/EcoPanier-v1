import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { deleteImages, formatCurrency, formatDate } from '../../utils/helpers';
import {
  LotCard,
  LotFormModal,
  MakeFreeModal,
  MakeAllFreeModal,
  BulkDeleteModal,
  BulkMakeFreeModal,
  DeleteLotModal,
  SuccessModal,
  ErrorModal,
  InfoModal,
  type Lot,
} from './lot-management';
import { Trash2, Gift, Crown } from 'lucide-react';
import { MERCHANT_DAILY_LOT_LIMIT, MERCHANT_SUBSCRIPTION_PRICE, fetchMerchantSubscriptionInfo, getMerchantLotQuota } from '../../utils/subscriptionService';
import type { MerchantLotQuota, MerchantSubscriptionInfo } from '../../utils/subscriptionService';

interface LotManagementProps {
  onCreateLotClick?: (handler: () => void) => void;
  onMakeAllFreeClick?: (handler: () => void, count: number) => void;
  onSelectionModeClick?: (handler: () => void) => void;
  onSelectionModeChange?: (isActive: boolean) => void;
  onToggleSoldOutClick?: (handler: () => void, count: number, isHidden: boolean) => void;
}

export const LotManagement = ({ onCreateLotClick, onMakeAllFreeClick, onSelectionModeClick, onSelectionModeChange, onToggleSoldOutClick }: LotManagementProps = {}) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [showMakeFreeModal, setShowMakeFreeModal] = useState(false);
  const [lotToMakeFree, setLotToMakeFree] = useState<Lot | null>(null);
  const [showMakeAllFreeModal, setShowMakeAllFreeModal] = useState(false);
  const [processingMassConversion, setProcessingMassConversion] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ quantity?: number; message?: string; title?: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [selectedLotIds, setSelectedLotIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkMakeFreeModal, setShowBulkMakeFreeModal] = useState(false);
  const [processingBulkDelete, setProcessingBulkDelete] = useState(false);
  const [processingBulkMakeFree, setProcessingBulkMakeFree] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<Lot | null>(null);
  const [processingDelete, setProcessingDelete] = useState(false);
  const { profile } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<MerchantSubscriptionInfo | null>(null);
  const [lotQuota, setLotQuota] = useState<MerchantLotQuota | null>(null);

  const showQuotaLimitModal = useCallback(
    (customMessage?: string) => {
      setInfoMessage(
        customMessage ??
          `Vous avez atteint la limite quotidienne de ${MERCHANT_DAILY_LOT_LIMIT} lots.\n\nActivez l'abonnement commerçant depuis votre Portefeuille pour publier en illimité.`
      );
      setShowInfoModal(true);
    },
    [setInfoMessage, setShowInfoModal]
  );

  const loadSubscriptionInfo = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const info = await fetchMerchantSubscriptionInfo(profile.id);
      setSubscriptionInfo(info);
      const quota = await getMerchantLotQuota(profile.id, info);
      setLotQuota(quota);
    } catch (error) {
      console.error("Erreur lors du chargement des informations d'abonnement:", error);
    }
  }, [profile?.id, profile?.subscription_status, profile?.subscription_expires_at]);

  useEffect(() => {
    loadSubscriptionInfo();
  }, [loadSubscriptionInfo]);

  const refreshLotQuota = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const quota = await getMerchantLotQuota(profile.id, subscriptionInfo ?? undefined);
      setLotQuota(quota);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du quota de lots:', error);
    }
  }, [profile?.id, subscriptionInfo]);

  const ensureCanCreateLot = useCallback(async () => {
    if (!profile?.id) {
      return false;
    }

    let info = subscriptionInfo;

    if (!info) {
      try {
        info = await fetchMerchantSubscriptionInfo(profile.id);
        setSubscriptionInfo(info);
      } catch (error) {
        console.error("Erreur lors de la récupération du statut d'abonnement:", error);
        setErrorMessage("Impossible de vérifier votre abonnement. Veuillez réessayer.");
        setShowErrorModal(true);
        return false;
      }
    }

    if (info.status === 'active') {
      setLotQuota({
        limit: null,
        used: 0,
        remaining: null,
        hasActiveSubscription: true,
      });
      return true;
    }

    try {
      const quota = await getMerchantLotQuota(profile.id, info);
      setLotQuota(quota);

      if (!quota.hasActiveSubscription && quota.limit !== null && quota.remaining !== null && quota.remaining <= 0) {
        showQuotaLimitModal();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du quota de publication:', error);
      setErrorMessage('Impossible de vérifier votre quota de publication. Veuillez réessayer.');
      setShowErrorModal(true);
      return false;
    }
  }, [profile?.id, subscriptionInfo, showQuotaLimitModal, setErrorMessage, setShowErrorModal]);

  const hasActiveSubscription = subscriptionInfo?.status === 'active';
  const remainingLots = !hasActiveSubscription ? lotQuota?.remaining ?? null : null;
  const remainingLotsLabel =
    remainingLots === null
      ? null
      : remainingLots <= 0
        ? "Aucune publication restante aujourd'hui"
        : `${remainingLots} lot${remainingLots > 1 ? 's' : ''} restant${remainingLots > 1 ? 's' : ''} aujourd'hui`;

  // Enregistrer le handler pour ouvrir le modal de création depuis le header
  useEffect(() => {
    if (onCreateLotClick) {
      const handleCreate = () => {
        void (async () => {
          const canCreate = await ensureCanCreateLot();
          if (!canCreate) {
            return;
          }
          setEditingLot(null);
          setShowModal(true);
        })();
      };
      onCreateLotClick(handleCreate);
    }
  }, [onCreateLotClick, ensureCanCreateLot]);

  // Enregistrer le handler pour passer tous les lots en don depuis le header
  useEffect(() => {
    if (onMakeAllFreeClick) {
      const eligibleLotsCount = lots.filter(lot => {
        const remainingQty = lot.quantity_total - lot.quantity_sold;
        return !lot.is_free && remainingQty > 0;
      }).length;
      
      onMakeAllFreeClick(handleMakeAllFree, eligibleLotsCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots]); // Ne pas inclure onMakeAllFreeClick dans les dépendances pour éviter la boucle infinie

  // Enregistrer le handler pour le mode sélection depuis le header
  useEffect(() => {
    if (onSelectionModeClick) {
      onSelectionModeClick(toggleSelectionMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSelectionModeClick]);

  // Notifier le parent des changements du mode sélection
  useEffect(() => {
    if (onSelectionModeChange) {
      onSelectionModeChange(selectionMode);
    }
  }, [selectionMode, onSelectionModeChange]);

  // Enregistrer le handler pour toggle sold out depuis le header
  useEffect(() => {
    if (onToggleSoldOutClick) {
      const handleToggleSoldOut = () => {
        setHideSoldOut(prev => !prev);
      };
      
      // Calculer les lots épuisés
      const soldOutCount = lots.filter(lot => {
        const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return remainingQty <= 0;
      }).length;
      
      onToggleSoldOutClick(handleToggleSoldOut, soldOutCount, hideSoldOut);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots, hideSoldOut, onToggleSoldOutClick]);

  // Nettoyage automatique des lots épuisés depuis plus de 24h
  const cleanupOldSoldOutLots = useCallback(async (lots: Lot[]) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const lot of lots) {
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;

      if (availableQty <= 0) {
        const updatedAt = new Date(lot.updated_at);

        if (updatedAt < oneDayAgo) {
          try {
            if (lot.image_urls && lot.image_urls.length > 0) {
              await deleteImages(lot.image_urls);
            }

            await supabase.from('lots').delete().eq('id', lot.id);
            console.log(`Lot ${lot.id} supprimé automatiquement (épuisé depuis > 24h)`);
          } catch (error) {
            console.error(`Erreur lors de la suppression du lot ${lot.id}:`, error);
          }
        }
      }
    }
  }, []);

  // Récupérer les lots
  const fetchLots = useCallback(async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      await cleanupOldSoldOutLots(data);

      const { data: updatedData, error: refreshError } = await supabase
        .from('lots')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (refreshError) throw refreshError;
      setLots(updatedData);
      refreshLotQuota();
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, cleanupOldSoldOutLots, refreshLotQuota]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // Gérer l'ouverture du modal "Passer en gratuit"
  const handleMakeFree = (lot: Lot) => {
    if (lot.is_free) {
      setInfoMessage('Ce lot est déjà gratuit et disponible pour les bénéficiaires.');
      setShowInfoModal(true);
      return;
    }

    const remainingQty = lot.quantity_total - lot.quantity_sold;
    if (remainingQty <= 0) {
      setErrorMessage('Ce lot n\'a plus de stock disponible pour être passé en gratuit.');
      setShowErrorModal(true);
      return;
    }

    setLotToMakeFree(lot);
    setShowMakeFreeModal(true);
  };

  // Confirmer le passage en gratuit
  const confirmMakeFree = async () => {
    if (!lotToMakeFree) return;

    const remainingQty = lotToMakeFree.quantity_total - lotToMakeFree.quantity_sold;

    try {
      // Annuler les réservations pending
      if (lotToMakeFree.quantity_reserved > 0) {
        const { error: cancelError } = await supabase
          .from('reservations')
          // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('lot_id', lotToMakeFree.id)
          .eq('status', 'pending');

        if (cancelError) {
          console.warn('Erreur lors de l\'annulation des réservations:', cancelError);
        }
      }

      // Mettre à jour le lot
      const { error } = await supabase
        .from('lots')
        // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
        .update({
          is_free: true,
          discounted_price: 0,
          original_price: 0,
          status: 'available',
          quantity_total: remainingQty,
          quantity_reserved: 0,
          quantity_sold: 0,
          is_urgent: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lotToMakeFree.id);

      if (error) throw error;

      setShowMakeFreeModal(false);
      setLotToMakeFree(null);
      fetchLots();

      // Afficher le modal de succès
      setSuccessData({ quantity: remainingQty });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erreur lors de la conversion en gratuit:', error);
      setErrorMessage('Impossible de passer le lot en gratuit. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  // Gérer l'ouverture du modal pour passer tous les lots en gratuit
  const handleMakeAllFree = useCallback(() => {
    const eligibleLots = lots.filter(lot => {
      const remainingQty = lot.quantity_total - lot.quantity_sold;
      return !lot.is_free && remainingQty > 0;
    });

    if (eligibleLots.length === 0) {
      setInfoMessage('Aucun lot éligible pour être passé en gratuit.\n\nTous vos lots sont soit déjà gratuits, soit épuisés.');
      setShowInfoModal(true);
      return;
    }

    setShowMakeAllFreeModal(true);
  }, [lots]);

  // Confirmer le passage en gratuit de tous les lots
  const confirmMakeAllFree = async () => {
    setProcessingMassConversion(true);
    
    const eligibleLots = lots.filter(lot => {
      const remainingQty = lot.quantity_total - lot.quantity_sold;
      return !lot.is_free && remainingQty > 0;
    });

    let successCount = 0;
    let errorCount = 0;
    let totalMealsSaved = 0;

    for (const lot of eligibleLots) {
      try {
        const remainingQty = lot.quantity_total - lot.quantity_sold;
        
        // Annuler les réservations pending
        if (lot.quantity_reserved > 0) {
          await supabase
            .from('reservations')
            // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('lot_id', lot.id)
            .eq('status', 'pending');
        }

        // Mettre à jour le lot
        const { error } = await supabase
          .from('lots')
          // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
          .update({
            is_free: true,
            discounted_price: 0,
            original_price: 0,
            status: 'available',
            quantity_total: remainingQty,
            quantity_reserved: 0,
            quantity_sold: 0,
            is_urgent: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lot.id);

        if (error) {
          console.error(`Erreur pour le lot ${lot.id}:`, error);
          errorCount++;
        } else {
          successCount++;
          totalMealsSaved += remainingQty;
        }
      } catch (error) {
        console.error(`Erreur lors de la conversion du lot ${lot.id}:`, error);
        errorCount++;
      }
    }

    setProcessingMassConversion(false);
    setShowMakeAllFreeModal(false);
    fetchLots();

    if (successCount > 0) {
      const message = 
        `${successCount} lot${successCount > 1 ? 's' : ''} passé${successCount > 1 ? 's' : ''} en gratuit avec succès !` +
        (errorCount > 0 ? `\n\n⚠️ Attention : ${errorCount} lot${errorCount > 1 ? 's' : ''} n'${errorCount > 1 ? 'ont' : 'a'} pas pu être converti${errorCount > 1 ? 's' : ''}.` : '');
      setSuccessData({ quantity: totalMealsSaved, message });
      setShowSuccessModal(true);
    } else if (errorCount > 0) {
      setErrorMessage('Erreur lors de la conversion des lots. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  // Ouvrir le modal de suppression
  const handleDelete = (id: string) => {
    const lot = lots.find((l) => l.id === id);
    if (lot) {
      setLotToDelete(lot);
      setShowDeleteModal(true);
    }
  };

  // Confirmer la suppression d'un lot
  const confirmDelete = async () => {
    if (!lotToDelete) return;

    setProcessingDelete(true);

    try {
      if (lotToDelete.image_urls && lotToDelete.image_urls.length > 0) {
        await deleteImages(lotToDelete.image_urls);
      }

      const { error } = await supabase.from('lots').delete().eq('id', lotToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setLotToDelete(null);
      fetchLots();

      setSuccessData({ 
        quantity: undefined, 
        message: 'Lot supprimé avec succès.\n\n⚠️ Rappel : Ce lot n\'a pas pu être distribué et contribue au gaspillage alimentaire.',
        title: '⚠️ Lot supprimé'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting lot:', error);
      setErrorMessage('Erreur lors de la suppression du lot. Veuillez réessayer.');
      setShowErrorModal(true);
    } finally {
      setProcessingDelete(false);
    }
  };

  // Ouvrir le modal d'édition
  const handleEdit = (lot: Lot) => {
    setEditingLot(lot);
    setShowModal(true);
  };

  // Gérer la sélection d'un lot
  const handleSelectLot = (lotId: string, selected: boolean) => {
    setSelectedLotIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(lotId);
      } else {
        newSet.delete(lotId);
      }
      return newSet;
    });
  };

  // Activer/désactiver le mode sélection
  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const newMode = !prev;
      if (onSelectionModeChange) {
        onSelectionModeChange(newMode);
      }
      if (!newMode) {
        setSelectedLotIds(new Set());
      }
      return newMode;
    });
  };

  // Sélectionner/désélectionner tous les lots
  const handleSelectAll = () => {
    const allLotIds = new Set(lots.map((lot) => lot.id));
    if (selectedLotIds.size === allLotIds.size) {
      setSelectedLotIds(new Set());
    } else {
      setSelectedLotIds(allLotIds);
    }
  };

  // Confirmer la suppression multiple
  const confirmBulkDelete = async () => {
    if (selectedLotIds.size === 0) return;

    setProcessingBulkDelete(true);

    const selectedIds = Array.from(selectedLotIds);
    let successCount = 0;
    let errorCount = 0;

    for (const lotId of selectedIds) {
      try {
        const lot = lots.find((l) => l.id === lotId);
        if (!lot) continue;

        if (lot.image_urls && lot.image_urls.length > 0) {
          await deleteImages(lot.image_urls);
        }

        const { error } = await supabase.from('lots').delete().eq('id', lotId);

        if (error) {
          console.error(`Erreur lors de la suppression du lot ${lotId}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Erreur lors de la suppression du lot ${lotId}:`, error);
        errorCount++;
      }
    }

    setProcessingBulkDelete(false);
    setShowBulkDeleteModal(false);
    setSelectedLotIds(new Set());
    setSelectionMode(false);
    fetchLots();

    if (successCount > 0) {
      const message = 
        `${successCount} lot${successCount > 1 ? 's' : ''} supprimé${successCount > 1 ? 's' : ''} avec succès.` +
        (errorCount > 0 ? `\n\n⚠️ Attention : ${errorCount} lot${errorCount > 1 ? 's' : ''} n'${errorCount > 1 ? 'ont' : 'a'} pas pu être supprimé${errorCount > 1 ? 's' : ''}.` : '') +
        `\n\n⚠️ Ces lots n'ont pas pu être distribués et contribuent au gaspillage alimentaire.`;
      setSuccessData({ 
        quantity: undefined, 
        message,
        title: '⚠️ Lots supprimés'
      });
      setShowSuccessModal(true);
    } else if (errorCount > 0) {
      setErrorMessage('Erreur lors de la suppression des lots. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  // Confirmer le passage en don multiple
  const confirmBulkMakeFree = async () => {
    if (selectedLotIds.size === 0) return;

    setProcessingBulkMakeFree(true);

    const selectedLots = lots.filter((lot) => selectedLotIds.has(lot.id));
    const eligibleLots = selectedLots.filter((lot) => {
      const remainingQty = lot.quantity_total - lot.quantity_sold;
      return !lot.is_free && remainingQty > 0;
    });

    let successCount = 0;
    let errorCount = 0;
    let totalMealsSaved = 0;

    for (const lot of eligibleLots) {
      try {
        const remainingQty = lot.quantity_total - lot.quantity_sold;

        // Annuler les réservations pending
        if (lot.quantity_reserved > 0) {
          await supabase
            .from('reservations')
            // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('lot_id', lot.id)
            .eq('status', 'pending');
        }

        // Mettre à jour le lot
        const { error } = await supabase
          .from('lots')
          // @ts-expect-error Bug connu: Supabase 2.57.4 infère incorrectement les types comme 'never'
          .update({
            is_free: true,
            discounted_price: 0,
            original_price: 0,
            status: 'available',
            quantity_total: remainingQty,
            quantity_reserved: 0,
            quantity_sold: 0,
            is_urgent: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lot.id);

        if (error) {
          console.error(`Erreur pour le lot ${lot.id}:`, error);
          errorCount++;
        } else {
          successCount++;
          totalMealsSaved += remainingQty;
        }
      } catch (error) {
        console.error(`Erreur lors de la conversion du lot ${lot.id}:`, error);
        errorCount++;
      }
    }

    setProcessingBulkMakeFree(false);
    setShowBulkMakeFreeModal(false);
    setSelectedLotIds(new Set());
    setSelectionMode(false);
    fetchLots();

    if (successCount > 0) {
      const message = 
        `${successCount} lot${successCount > 1 ? 's' : ''} passé${successCount > 1 ? 's' : ''} en gratuit avec succès !` +
        (errorCount > 0 ? `\n\n⚠️ Attention : ${errorCount} lot${errorCount > 1 ? 's' : ''} n'${errorCount > 1 ? 'ont' : 'a'} pas pu être converti${errorCount > 1 ? 's' : ''}.` : '');
      setSuccessData({ quantity: totalMealsSaved, message });
      setShowSuccessModal(true);
    } else if (errorCount > 0) {
      setErrorMessage('Erreur lors de la conversion des lots. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Calculer les lots éligibles pour le bouton
  const eligibleLotsCount = lots.filter(lot => {
    const remainingQty = lot.quantity_total - lot.quantity_sold;
    return !lot.is_free && remainingQty > 0;
  }).length;


  // Séparer les lots gratuits (dons) et les lots payants
  const freeLots = lots.filter(lot => lot.is_free);
  const paidLots = lots.filter(lot => !lot.is_free);

  // Filtrer les lots à afficher selon le filtre "masquer épuisés"
  const displayedFreeLots = hideSoldOut
    ? freeLots.filter(lot => {
        const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return remainingQty > 0;
      })
    : freeLots;

  const displayedPaidLots = hideSoldOut
    ? paidLots.filter(lot => {
        const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return remainingQty > 0;
      })
    : paidLots;

  // Calculer les lots éligibles pour le passage en don
  const eligibleLotsForDon = lots.filter((lot) => {
    if (!selectedLotIds.has(lot.id)) return false;
    const remainingQty = lot.quantity_total - lot.quantity_sold;
    return !lot.is_free && remainingQty > 0;
  });

  return (
    <div className={selectionMode && selectedLotIds.size > 0 ? 'pb-24' : ''}>
      {/* Barre d'actions avec sélection */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Bouton "Tout sélectionner" quand en mode sélection */}
        {selectionMode && lots.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md border border-gray-200"
          >
            {selectedLotIds.size === lots.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        )}

      </div>

      {subscriptionInfo && (
        <div className="mb-6">
          <div
            className={`card border p-4 sm:p-5 ${
              hasActiveSubscription
                ? 'border-emerald-200 bg-emerald-50/90'
                : 'border-amber-200 bg-amber-50/90'
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                    hasActiveSubscription ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  <Crown className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {hasActiveSubscription
                      ? 'Abonnement commerçant actif'
                      : `Limite quotidienne de ${MERCHANT_DAILY_LOT_LIMIT} lots`}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {hasActiveSubscription
                      ? `Publication illimitée jusqu'au ${
                          subscriptionInfo.expiresAt
                            ? formatDate(subscriptionInfo.expiresAt)
                            : 'prochain renouvellement'
                        }.`
                      : `Publiez jusqu'à ${MERCHANT_DAILY_LOT_LIMIT} lots par jour sans abonnement.`}
                  </p>
                  {!hasActiveSubscription && remainingLotsLabel && (
                    <p className="text-sm font-semibold text-gray-800">
                      {remainingLotsLabel}
                    </p>
                  )}
                </div>
              </div>
              {hasActiveSubscription ? (
                <div className="text-sm font-semibold text-emerald-700 sm:text-right">
                  {subscriptionInfo.expiresAt
                    ? `Renouvellement le ${formatDate(subscriptionInfo.expiresAt)}`
                    : 'Renouvellement automatique actif'}
                </div>
              ) : (
                <div className="text-sm text-gray-800 sm:text-right">
                  <p className="font-semibold">Passez à l'abonnement illimité</p>
                  <p className="text-gray-600">
                    Activez-le dans l'onglet Portefeuille pour {formatCurrency(MERCHANT_SUBSCRIPTION_PRICE)} / mois.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barre d'actions flottante */}
      {selectionMode && selectedLotIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-gray-300 shadow-2xl animate-fade-in-up" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Section gauche : Compteur et bouton désélectionner */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{selectedLotIds.size}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedLotIds.size} lot{selectedLotIds.size > 1 ? 's' : ''} sélectionné{selectedLotIds.size > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                >
                  Tout désélectionner
                </button>
              </div>

              {/* Section droite : Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {eligibleLotsForDon.length > 0 && (
                  <button
                    onClick={() => setShowBulkMakeFreeModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
                  >
                    <Gift className="w-5 h-5" strokeWidth={2.5} />
                    <span>Passer en don ({eligibleLotsForDon.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                  <span>Supprimer ({selectedLotIds.size})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section des dons solidaires */}
      {displayedFreeLots.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Dons <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 font-extrabold">Solidaires</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {displayedFreeLots.length} don{displayedFreeLots.length > 1 ? 's' : ''}
            </span>
          </div>
          
          

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedFreeLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMakeFree={handleMakeFree}
                isSelected={selectedLotIds.has(lot.id)}
                onSelect={handleSelectLot}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section des produits en vente */}
      {displayedPaidLots.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Produits en&nbsp;<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 font-extrabold">Vente</span>
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200/80 to-transparent"></div>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-semibold shadow-sm">
              {displayedPaidLots.length} produit{displayedPaidLots.length > 1 ? 's' : ''}
            </span>
          </div>

          

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedPaidLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMakeFree={handleMakeFree}
                isSelected={selectedLotIds.has(lot.id)}
                onSelect={handleSelectLot}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Message si aucun lot */}
      {displayedFreeLots.length === 0 && displayedPaidLots.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit disponible</h3>
          <p className="text-gray-600 mb-6">Commencez par créer votre premier panier anti-gaspi !</p>
          <button
            onClick={async () => {
              const canCreate = await ensureCanCreateLot();
              if (!canCreate) {
                return;
              }
              setEditingLot(null);
              setShowModal(true);
            }}
            className="btn-primary px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Créer un panier
          </button>
        </div>
      )}

      {/* Modal de formulaire */}
      {showModal && profile && (
        <LotFormModal
          editingLot={editingLot}
          merchantId={profile.id}
          hasActiveSubscription={hasActiveSubscription}
          dailyLotLimit={MERCHANT_DAILY_LOT_LIMIT}
          onQuotaExceeded={showQuotaLimitModal}
          onClose={() => {
            setShowModal(false);
            setEditingLot(null);
          }}
          onSuccess={fetchLots}
        />
      )}

      {/* Modal de confirmation pour passer en gratuit */}
      {showMakeFreeModal && lotToMakeFree && (
        <MakeFreeModal
          lot={lotToMakeFree}
          onConfirm={confirmMakeFree}
          onCancel={() => {
            setShowMakeFreeModal(false);
            setLotToMakeFree(null);
          }}
        />
      )}

      {/* Modal de confirmation pour passer tous les lots en gratuit */}
      <MakeAllFreeModal
        isOpen={showMakeAllFreeModal}
        eligibleLotsCount={eligibleLotsCount}
        isProcessing={processingMassConversion}
        onConfirm={confirmMakeAllFree}
        onCancel={() => setShowMakeAllFreeModal(false)}
      />

      {/* Modal de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        title={successData?.title || "✅ Lot passé en gratuit avec succès !"}
        message={successData?.message || "Vos invendus sont maintenant disponibles gratuitement pour les bénéficiaires."}
        quantity={successData?.quantity}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessData(null);
        }}
      />

      {/* Modal d'erreur */}
      <ErrorModal
        isOpen={showErrorModal}
        title="❌ Une erreur est survenue"
        message={errorMessage}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
      />

      {/* Modal d'information */}
      <InfoModal
        isOpen={showInfoModal}
        title="ℹ️ Information"
        message={infoMessage}
        onClose={() => {
          setShowInfoModal(false);
          setInfoMessage('');
        }}
      />

      {/* Modal de suppression multiple */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        selectedCount={selectedLotIds.size}
        isProcessing={processingBulkDelete}
        eligibleForDonCount={eligibleLotsForDon.length}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
        onSuggestDon={() => {
          setShowBulkDeleteModal(false);
          setShowBulkMakeFreeModal(true);
        }}
      />

      {/* Modal de passage en don multiple */}
      <BulkMakeFreeModal
        isOpen={showBulkMakeFreeModal}
        selectedCount={selectedLotIds.size}
        eligibleCount={eligibleLotsForDon.length}
        isProcessing={processingBulkMakeFree}
        onConfirm={confirmBulkMakeFree}
        onCancel={() => setShowBulkMakeFreeModal(false)}
      />

      {/* Modal de suppression individuelle */}
      {lotToDelete && (
        <DeleteLotModal
          isOpen={showDeleteModal}
          lot={lotToDelete}
          isProcessing={processingDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setLotToDelete(null);
          }}
          onSuggestDon={() => {
            setShowDeleteModal(false);
            setLotToDelete(null);
            handleMakeFree(lotToDelete);
          }}
        />
      )}
    </div>
  );
};
