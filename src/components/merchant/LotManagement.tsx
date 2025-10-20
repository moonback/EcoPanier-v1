import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { deleteImages } from '../../utils/helpers';
import { LotCard } from './lot-management/LotCard';
import { LotFormModal } from './lot-management/LotFormModal';
import { MakeFreeModal } from './lot-management/MakeFreeModal';
import type { Lot } from './lot-management/types';

interface LotManagementProps {
  onCreateLotClick?: (handler: () => void) => void;
}

export const LotManagement = ({ onCreateLotClick }: LotManagementProps = {}) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [showMakeFreeModal, setShowMakeFreeModal] = useState(false);
  const [lotToMakeFree, setLotToMakeFree] = useState<Lot | null>(null);
  const [showMakeAllFreeModal, setShowMakeAllFreeModal] = useState(false);
  const [processingMassConversion, setProcessingMassConversion] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(true);
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
      alert('✅ Ce lot est déjà gratuit !');
      return;
    }

    const remainingQty = lot.quantity_total - lot.quantity_sold;
    if (remainingQty <= 0) {
      alert('❌ Ce lot n\'a plus de stock disponible');
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

      alert(
        `✅ Lot passé en gratuit avec succès !\n\n🎁 ${remainingQty} repas sauvés du gaspillage et offerts aux bénéficiaires.`
      );
    } catch (error) {
      console.error('Erreur lors de la conversion en gratuit:', error);
      alert('❌ Impossible de passer le lot en gratuit. Veuillez réessayer.');
    }
  };

  // Gérer l'ouverture du modal pour passer tous les lots en gratuit
  const handleMakeAllFree = () => {
    const eligibleLots = lots.filter(lot => {
      const remainingQty = lot.quantity_total - lot.quantity_sold;
      return !lot.is_free && remainingQty > 0;
    });

    if (eligibleLots.length === 0) {
      alert('ℹ️ Aucun lot éligible pour être passé en gratuit.\n\nTous vos lots sont soit déjà gratuits, soit épuisés.');
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
      alert(
        `✅ Conversion réussie !\n\n` +
        `🎁 ${successCount} lot${successCount > 1 ? 's' : ''} passé${successCount > 1 ? 's' : ''} en gratuit\n` +
        `🍽️ ${totalMealsSaved} repas sauvés et offerts aux bénéficiaires\n` +
        (errorCount > 0 ? `\n⚠️ ${errorCount} lot${errorCount > 1 ? 's' : ''} en erreur` : '')
      );
    } else if (errorCount > 0) {
      alert(`❌ Erreur lors de la conversion des lots. Veuillez réessayer.`);
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
      alert('Erreur lors de la suppression');
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

  // Filtrer les lots à afficher
  const displayedLots = hideSoldOut
    ? lots.filter(lot => {
        const remainingQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return remainingQty > 0;
      })
    : lots;

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

        {/* Bouton pour passer tous les lots en gratuit */}
        {eligibleLotsCount > 0 && (
          <button
            onClick={handleMakeAllFree}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
            <span className="font-semibold">
              Tout passer en don ({eligibleLotsCount})
            </span>
          </button>
        )}
      </div>

      {/* Grille de lots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedLots.map((lot) => (
          <LotCard
            key={lot.id}
            lot={lot}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMakeFree={handleMakeFree}
          />
        ))}
      </div>

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
      {showMakeAllFreeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Passer tous les lots en don ?
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong className="text-green-600">{eligibleLotsCount} lot{eligibleLotsCount > 1 ? 's' : ''}</strong> sera{eligibleLotsCount > 1 ? 'ont' : ''} converti{eligibleLotsCount > 1 ? 's' : ''} en gratuit et mis à disposition des bénéficiaires.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-yellow-800 text-xs font-medium mb-1">
                      ⚠️ Action importante
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Les réservations en cours seront annulées</li>
                      <li>Les prix seront remis à zéro</li>
                      <li>Les lots seront marqués comme urgents</li>
                      <li>Cette action est irréversible</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-green-800 text-xs">
                      💚 <strong>Impact solidaire :</strong> Vous allez sauver des repas du gaspillage et aider les personnes en précarité.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMakeAllFreeModal(false)}
                disabled={processingMassConversion}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmMakeAllFree}
                disabled={processingMassConversion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingMassConversion ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Conversion...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Confirmer le don</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
