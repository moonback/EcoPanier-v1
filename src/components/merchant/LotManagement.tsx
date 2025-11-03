import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { deleteImages } from '../../utils/helpers';
import {
  LotCard,
  LotFormModal,
  MakeFreeModal,
  MakeAllFreeModal,
  SuccessModal,
  ErrorModal,
  InfoModal,
  type Lot,
} from './lot-management';

interface LotManagementProps {
  onCreateLotClick?: (handler: () => void) => void;
  onMakeAllFreeClick?: (handler: () => void, count: number) => void;
}

export const LotManagement = ({ onCreateLotClick, onMakeAllFreeClick }: LotManagementProps = {}) => {
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
  const [successData, setSuccessData] = useState<{ quantity: number; message?: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const { profile } = useAuthStore();

  // Enregistrer le handler pour ouvrir le modal de création depuis le header
  useEffect(() => {
    if (onCreateLotClick) {
      const handleCreate = () => {
        setEditingLot(null);
        setShowModal(true);
      };
      onCreateLotClick(handleCreate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [lots, onMakeAllFreeClick]);

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
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, cleanupOldSoldOutLots]);

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
  const handleMakeAllFree = () => {
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
  };

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

  // Supprimer un lot
  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce lot ?')) return;

    try {
      const { data: lot, error: fetchError } = await supabase
        .from('lots')
        .select('image_urls')
        .eq('id', id)
        .single() as { data: { image_urls: string[] } | null; error: unknown };

      if (fetchError) throw fetchError;

      if (lot?.image_urls && lot.image_urls.length > 0) {
        await deleteImages(lot.image_urls);
      }

      const { error } = await supabase.from('lots').delete().eq('id', id);

      if (error) throw error;

      fetchLots();
    } catch (error) {
      console.error('Error deleting lot:', error);
      setErrorMessage('Erreur lors de la suppression du lot. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  // Ouvrir le modal d'édition
  const handleEdit = (lot: Lot) => {
    setEditingLot(lot);
    setShowModal(true);
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

  // Calculer les lots épuisés
  const soldOutCount = lots.filter(lot => {
    const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
    return remainingQty <= 0;
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

  return (
    <div>
      {/* Boutons d'action */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Bouton pour masquer/afficher les épuisés */}
        {soldOutCount > 0 && (
          <button
            onClick={() => setHideSoldOut(!hideSoldOut)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              hideSoldOut
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {hideSoldOut ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              )}
            </svg>
            <span className="font-medium">
              {hideSoldOut ? 'Afficher' : 'Masquer'} épuisés ({soldOutCount})
            </span>
          </button>
        )}

      </div>

      {/* Section des dons solidaires */}
      {displayedFreeLots.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="13" rx="2" className="stroke-current" />
                  <path d="M12 7v13M2 12h20" strokeLinecap="round" strokeLinejoin="round" className="stroke-current" />
                  <path d="M7.5 7A2.5 2.5 0 1 1 12 4.5 2.5 2.5 0 0 1 16.5 7" strokeLinecap="round" strokeLinejoin="round" className="stroke-current" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">🎁 Dons Solidaires</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {displayedFreeLots.length} don{displayedFreeLots.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💚</span>
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Impact Solidaire</p>
                <p className="text-xs text-green-700">
                  Ces produits sont offerts gratuitement aux bénéficiaires pour lutter contre le gaspillage alimentaire
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedFreeLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMakeFree={handleMakeFree}
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">💰 Produits en Vente</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {displayedPaidLots.length} produit{displayedPaidLots.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💼</span>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Vente Anti-Gaspi</p>
                <p className="text-xs text-blue-700">
                  Ces produits sont vendus à prix réduits pour valoriser vos invendus tout en réduisant le gaspillage
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedPaidLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMakeFree={handleMakeFree}
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
            onClick={() => {
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
        title="✅ Lot passé en gratuit avec succès !"
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
    </div>
  );
};
