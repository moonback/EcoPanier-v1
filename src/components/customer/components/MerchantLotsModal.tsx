import { X, Package, MapPin, Store } from 'lucide-react';
import type { Database } from '../../../lib/database.types';
import { LotCard } from './LotCard';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
  };
};

interface MerchantLotsModalProps {
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
  merchantLogoUrl?: string | null;
  onClose: () => void;
  onLotSelect: (lot: Lot) => void;
  onReserve: (lot: Lot) => void;
}

export function MerchantLotsModal({
  merchantId,
  merchantName,
  merchantAddress,
  merchantLogoUrl,
  onClose,
  onLotSelect,
  onReserve,
}: MerchantLotsModalProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchantLots = async () => {
      try {
        const { data, error } = await supabase
          .from('lots')
          .select(`
            *,
            profiles!merchant_id (
              business_name,
              business_address,
              business_logo_url
            )
          `)
          .eq('merchant_id', merchantId)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLots(data as Lot[]);
      } catch (error) {
        console.error('Erreur lors du chargement des lots du commerçant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantLots();
  }, [merchantId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Logo du commerçant */}
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-xl bg-gray-100 border-2 border-gray-200">
              {merchantLogoUrl ? (
                <img
                  src={merchantLogoUrl}
                  alt={merchantName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Store className={`w-8 h-8 text-gray-400 ${merchantLogoUrl ? 'hidden' : ''}`} strokeWidth={1.5} />
            </div>

            {/* Infos commerçant */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <Store className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  {merchantName}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 font-light">
                <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="truncate">{merchantAddress}</span>
              </div>
              {lots.length > 0 && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium">
                  <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{lots.length} produit{lots.length > 1 ? 's' : ''} disponible{lots.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : lots.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                <Package size={64} className="text-gray-300" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">
                Aucun produit disponible
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Ce commerçant n'a pas de produits disponibles pour le moment. 
                Revenez plus tard ! ⏰
              </p>
            </div>
          ) : (
            <div className="grid gap-3
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5">
              {lots.map((lot) => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  onReserve={onReserve}
                  onViewDetails={onLotSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

