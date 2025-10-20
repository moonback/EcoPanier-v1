import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDateTime, generatePIN } from '../../utils/helpers';
import { Package, MapPin, Clock, Heart, CheckCircle, XCircle, Download } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'] & {
  profiles: { business_name: string; business_address: string };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskLotsListProps {
  profile: Profile;
  dailyCount: number;
  onReservationMade: () => void;
  onActivity: () => void;
}

export const KioskLotsList = ({ profile, dailyCount, onReservationMade, onActivity }: KioskLotsListProps) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [reserving, setReserving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ 
    pin: string; 
    lot: string;
    merchant: string;
    pickupTime: string;
  } | null>(null);
  const [showAddressTooltip, setShowAddressTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetchFreeLots();
  }, []);

  const fetchFreeLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*, profiles(business_name, business_address)')
        .eq('status', 'available')
        .eq('is_free', true) // Utiliser le champ is_free
        .eq('discounted_price', 0) // Double vérification
        .gt('quantity_total', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const availableLots = (data as Lot[]).filter(lot => {
        const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
        return availableQty > 0;
      });

      setLots(availableLots);
    } catch (error) {
      console.error('Error fetching free lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLot = (lot: Lot) => {
    setSelectedLot(lot);
    onActivity();
  };

  const handleReserve = async () => {
    if (!selectedLot || dailyCount >= 2) return;

    setReserving(true);
    onActivity();

    try {
      const availableQty = selectedLot.quantity_total - selectedLot.quantity_reserved - selectedLot.quantity_sold;
      if (availableQty < 1) {
        alert('Ce panier n\'est plus disponible');
        setSelectedLot(null);
        setReserving(false);
        return;
      }

      const pin = generatePIN();
      const today = new Date().toISOString().split('T')[0];

      // Créer la réservation
      const { error: reservationError } = await supabase.from('reservations').insert({
        lot_id: selectedLot.id,
        user_id: profile.id,
        quantity: 1,
        total_price: 0,
        pickup_pin: pin,
        status: 'pending',
        is_donation: false,
      });

      if (reservationError) throw reservationError;

      // Mettre à jour le lot
      const { error: updateError } = await supabase
        .from('lots')
        .update({
          quantity_reserved: selectedLot.quantity_reserved + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLot.id);

      if (updateError) throw updateError;

      // Mettre à jour la limite quotidienne
      const { data: limitData, error: limitFetchError } = await supabase
        .from('beneficiary_daily_limits')
        .select('*')
        .eq('beneficiary_id', profile.id)
        .eq('date', today)
        .maybeSingle();

      if (limitFetchError && limitFetchError.code !== 'PGRST116') throw limitFetchError;

      if (limitData) {
        await supabase
          .from('beneficiary_daily_limits')
          .update({ reservation_count: limitData.reservation_count + 1 })
          .eq('id', limitData.id);
      } else {
        await supabase
          .from('beneficiary_daily_limits')
          .insert({
            beneficiary_id: profile.id,
            date: today,
            reservation_count: 1,
          });
      }

      // Afficher le message de succès avec le PIN
      setSuccessMessage({ 
        pin, 
        lot: selectedLot.title,
        merchant: selectedLot.profiles.business_name,
        pickupTime: formatDateTime(selectedLot.pickup_start)
      });
      setSelectedLot(null);
      fetchFreeLots();
      onReservationMade();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (dailyCount >= 2) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-success-50 to-accent-50 rounded-full mb-3">
          <Heart size={48} className="text-success-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          Vous avez vos 2 paniers du jour ! 🎉
        </h3>
        <p className="text-sm text-gray-600">
          Revenez demain pour de nouveaux paniers 🌅
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Message d'aide en haut */}
      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-accent-50 rounded-lg border border-blue-200 animate-fade-in">
        <p className="text-sm text-center font-semibold text-blue-900">
          👆 <strong>Cliquez sur un panier</strong> pour le réserver gratuitement • Maximum <strong>2 paniers par jour</strong>
        </p>
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
            <Package size={48} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">
            Aucun panier disponible 🔍
          </h3>
          <p className="text-sm text-gray-600">
            Revenez bientôt ! ⏰
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" onClick={() => setShowAddressTooltip(null)}>
          {lots.map((lot) => {
            const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;

            return (
              <div
                key={lot.id}
                className="group bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-soft-md transition-all border border-gray-100 hover:border-accent-300 text-left relative"
              >
                {/* Image */}
                <div 
                  onClick={() => handleSelectLot(lot)}
                  className="relative h-24 bg-gradient-to-br from-accent-100 via-pink-100 to-accent-100 cursor-pointer"
                >
                  {lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={32} className="text-accent-300" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-1.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
                    <Heart size={10} strokeWidth={2} />
                    <span>GRATUIT</span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-2">
                  <h3 
                    onClick={() => handleSelectLot(lot)}
                    className="text-xs font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight cursor-pointer"
                  >
                    {lot.title}
                  </h3>

                  <div className="space-y-0.5 text-xs text-gray-600 mb-2">
                    <div className="relative flex items-center gap-1">
                      <MapPin size={10} className="flex-shrink-0" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddressTooltip(showAddressTooltip === lot.id ? null : lot.id);
                          onActivity();
                        }}
                        className="truncate text-xs hover:text-accent-600 transition-colors font-medium underline decoration-dotted"
                      >
                        {lot.profiles.business_name}
                      </button>
                      
                      {/* Tooltip avec adresse */}
                      {showAddressTooltip === lot.id && (
                        <div className="absolute left-0 top-full mt-1 z-10 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 shadow-lg min-w-[200px] animate-fade-in">
                          <p className="font-semibold mb-0.5">📍 Adresse :</p>
                          <p className="leading-tight">{lot.profiles.business_address}</p>
                          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={10} className="flex-shrink-0" />
                      <span className="font-bold text-pink-600 text-xs">{availableQty} dispo</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectLot(lot)}
                    className="w-full py-1.5 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 group-hover:from-accent-700 group-hover:to-pink-700 transition-all"
                  >
                    <Heart size={12} strokeWidth={2} />
                    <span>Réserver</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation */}
      {selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 max-h-[90vh] overflow-y-auto animate-fade-in-up shadow-soft-xl border-2 border-accent-200">
            <h3 className="text-base font-bold mb-3 text-gray-900 text-center">
              Confirmer la réservation ?
            </h3>

            {/* Image du produit */}
            <div className="mb-3 relative h-32 bg-gradient-to-br from-accent-100 via-pink-100 to-accent-100 rounded-lg overflow-hidden border-2 border-accent-200">
              {selectedLot.image_urls.length > 0 ? (
                <img
                  src={selectedLot.image_urls[0]}
                  alt={selectedLot.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package size={48} className="text-accent-300" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-accent-600 to-accent-700 text-white px-2 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg border-2 border-white">
                <Heart size={12} strokeWidth={2} />
                <span>GRATUIT</span>
              </div>
            </div>

            <div className="mb-4 p-3 bg-accent-50 rounded-lg border border-accent-200">
              <h4 className="text-sm font-bold text-accent-900 mb-1 line-clamp-2">{selectedLot.title}</h4>
              <div className="space-y-0.5 text-xs text-accent-700">
                <p><strong>Commerçant:</strong> {selectedLot.profiles.business_name}</p>
                <p><strong>Retrait:</strong> {formatDateTime(selectedLot.pickup_start)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedLot(null);
                  onActivity();
                }}
                disabled={reserving}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm border border-gray-300 flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="flex-1 py-3 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-semibold text-sm shadow-soft-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {reserving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Réservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Confirmer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès avec PIN */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-3 z-[100] animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 text-center animate-fade-in-up shadow-soft-xl border-4 border-success-400">
            <div className="inline-flex p-3 bg-gradient-to-br from-success-100 to-accent-100 rounded-full mb-3 shadow-lg">
              <CheckCircle size={48} className="text-success-600" strokeWidth={2} />
            </div>

            <h3 className="text-xl font-bold text-success-900 mb-2">
              🎉 Réservation confirmée !
            </h3>

            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {successMessage.lot}
            </p>

            {/* Instruction TRÈS visible - Toujours affichée */}
            <div className="mb-3 p-4 bg-gradient-to-r from-warning-100 to-warning-200 rounded-xl border-3 border-warning-400 shadow-lg animate-pulse">
              <p className="text-base font-bold text-warning-900 mb-2 flex items-center justify-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span>NOTEZ BIEN CE CODE !</span>
              </p>
              <p className="text-sm text-warning-900 font-semibold leading-relaxed">
                Prenez une photo ou téléchargez-le.<br />
                Sans ce code, vous ne pourrez PAS récupérer votre panier.
              </p>
            </div>

            {/* Code PIN */}
            <div className="mb-4 p-4 bg-gradient-to-br from-accent-50 to-pink-50 rounded-xl border-3 border-accent-300 shadow-lg">
              <p className="text-base font-bold text-accent-900 mb-3 flex items-center justify-center gap-2">
                <span className="text-xl">🔑</span>
                <span>Votre Code PIN</span>
              </p>
              <div className="p-3 bg-white rounded-lg border-2 border-accent-400 mb-2">
                <p className="font-mono font-bold text-5xl text-accent-700 tracking-wider animate-pulse">
                  {successMessage.pin}
                </p>
              </div>
              <p className="text-xs text-accent-800 font-bold">
                À présenter au commerçant : {successMessage.merchant}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Créer une image simple avec le code PIN
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  canvas.width = 600;
                  canvas.height = 500;

                  // Fond
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, 600, 500);

                  // Header gradient
                  const gradient = ctx.createLinearGradient(0, 0, 600, 80);
                  gradient.addColorStop(0, '#ec4899');
                  gradient.addColorStop(1, '#f472b6');
                  ctx.fillStyle = gradient;
                  ctx.fillRect(0, 0, 600, 80);

                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 32px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('EcoPanier - Code de Retrait', 300, 50);

                  // Panier
                  ctx.fillStyle = '#1f2937';
                  ctx.font = 'bold 20px Arial';
                  ctx.fillText(successMessage.lot.substring(0, 40), 300, 130);

                  // Box PIN
                  ctx.fillStyle = '#fef3c7';
                  ctx.strokeStyle = '#fbbf24';
                  ctx.lineWidth = 4;
                  ctx.fillRect(100, 180, 400, 150);
                  ctx.strokeRect(100, 180, 400, 150);

                  ctx.fillStyle = '#78350f';
                  ctx.font = 'bold 24px Arial';
                  ctx.fillText('CODE PIN', 300, 220);

                  ctx.fillStyle = '#92400e';
                  ctx.font = 'bold 72px monospace';
                  ctx.fillText(successMessage.pin, 300, 295);

                  // Infos
                  ctx.fillStyle = '#6b7280';
                  ctx.font = '16px Arial';
                  ctx.fillText(`Commercant: ${successMessage.merchant}`, 300, 380);
                  ctx.fillText(`Retrait: ${successMessage.pickupTime}`, 300, 410);

                  ctx.fillStyle = '#dc2626';
                  ctx.font = 'bold 18px Arial';
                  ctx.fillText('CONSERVEZ CE CODE !', 300, 460);

                  // Download
                  const dataUrl = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = `EcoPanier-PIN-${successMessage.pin}.png`;
                  link.click();

                  onActivity();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-sm shadow-soft-md"
              >
                <Download size={18} />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => {
                  setSuccessMessage(null);
                  onActivity();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-bold text-sm shadow-soft-md"
              >
                J'ai noté
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

