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

  return (
    <div>
      {/* Grille de lots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {lots.map((lot) => (
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
    </div>
  );
};
