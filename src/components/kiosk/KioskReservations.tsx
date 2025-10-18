import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, Key, Heart, QrCode, Download, Maximize2, X } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface KioskReservationsProps {
  profile: Profile;
  onActivity: () => void;
  showOnlyPending?: boolean;
}

export const KioskReservations = ({ profile, onActivity, showOnlyPending = false }: KioskReservationsProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showAddressTooltip, setShowAddressTooltip] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [enlargedQR, setEnlargedQR] = useState(false);

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id);

      if (showOnlyPending) {
        query = query.eq('status', 'pending');
      }

      query = query.order('created_at', { ascending: false }).limit(10);

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    onActivity();
  };

  const handleDownloadQR = () => {
    if (!selectedReservation || !qrCodeRef.current) return;
    
    onActivity();

    try {
      // Obtenir le SVG du QR code
      const qrSvg = qrCodeRef.current.querySelector('svg');
      if (!qrSvg) {
        alert('QR Code non trouve');
        return;
      }

      // Créer un canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Canvas non supporte');
        return;
      }

      // Dimensions
      const width = 600;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // Fond blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // En-tête avec gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 80);
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(1, '#f472b6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 80);

      // Logo/Titre
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EcoPanier', width / 2, 50);

      // Titre
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Code de Retrait', width / 2, 130);

      // Nom du panier
      ctx.font = '18px Arial';
      ctx.fillStyle = '#4b5563';
      const title = selectedReservation.lots.title;
      if (title.length > 40) {
        ctx.fillText(title.substring(0, 40) + '...', width / 2, 160);
      } else {
        ctx.fillText(title, width / 2, 160);
      }

      // QR Code - Conversion SVG en DataURL
      const svgString = new XMLSerializer().serializeToString(qrSvg);
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      const img = new Image();
      
      img.onload = () => {
        try {
          // Dessiner le QR code centré
          const qrSize = 250;
          const qrX = (width - qrSize) / 2;
          const qrY = 200;
          
          // Fond gris pour le QR
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
          
          // Dessiner le QR code
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // Code PIN
          const pinY = 500;
          
          // Fond du PIN
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          const pinBoxWidth = 400;
          const pinBoxHeight = 120;
          const pinBoxX = (width - pinBoxWidth) / 2;
          ctx.fillRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);
          ctx.strokeRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);

          // Label PIN
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('Code PIN', width / 2, pinY + 35);

          // Code PIN
          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 48px monospace';
          ctx.fillText(selectedReservation.pickup_pin, width / 2, pinY + 85);

          // Informations en bas
          const infoY = 650;
          ctx.fillStyle = '#6b7280';
          ctx.font = '16px Arial';
          ctx.fillText(`Commercant: ${selectedReservation.lots.profiles.business_name}`, width / 2, infoY);
          ctx.fillText(`Retrait: ${formatDateTime(selectedReservation.lots.pickup_start)}`, width / 2, infoY + 25);
          ctx.fillText(`Quantite: ${selectedReservation.quantity}`, width / 2, infoY + 50);

          // Footer
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.fillText('EcoPanier', width / 2, infoY + 90);

          // Télécharger l'image directement via toDataURL
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `EcoPanier-${selectedReservation.pickup_pin}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        } catch (err) {
          console.error('Erreur dessin:', err);
          alert('Erreur lors du dessin');
        }
      };

      img.onerror = (err) => {
        console.error('Erreur chargement image:', err);
        alert('Erreur chargement QR');
      };

      img.src = svgDataUrl;

    } catch (error) {
      console.error('Erreur telechargement:', error);
      alert('Erreur: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex p-4 bg-gradient-to-br from-accent-50 to-pink-50 rounded-full mb-3">
          <Package size={48} className="text-accent-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          {showOnlyPending ? 'Aucune réservation active 📦' : 'Aucune réservation 🎁'}
        </h3>
        <p className="text-sm text-gray-600">
          {showOnlyPending ? 'Réservez un panier pour le voir ici !' : 'Réservez votre premier panier !'}
        </p>
      </div>
    );
  }

  return (
    <div onClick={() => setShowAddressTooltip(null)}>
      {/* Message d'aide */}
      {showOnlyPending && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-accent-50 rounded-lg border border-blue-200 animate-fade-in">
          <p className="text-sm text-center font-semibold text-blue-900">
            📱 <strong>Cliquez sur "QR Code"</strong> pour voir votre code de retrait • <strong>Cliquez sur le nom</strong> pour voir l'adresse
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-lg shadow-soft overflow-hidden border border-gray-100"
          >
            <div
              className={`p-2 ${
                reservation.status === 'pending'
                  ? 'bg-gradient-to-br from-accent-50 to-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-gradient-to-br from-success-50 to-white'
                  : 'bg-gradient-to-br from-gray-50 to-white'
              }`}
            >
              {/* Statut */}
              <div className="flex justify-between items-start gap-1 mb-2">
                <h3 className="font-bold text-xs text-black line-clamp-2 flex-1 leading-tight">
                  {reservation.lots.title}
                </h3>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 border ${
                    reservation.status === 'pending'
                      ? 'bg-warning-100 text-warning-800 border-warning-300'
                      : reservation.status === 'completed'
                      ? 'bg-success-100 text-success-800 border-success-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {reservation.status === 'pending'
                    ? '⏳'
                    : reservation.status === 'completed'
                    ? '✅'
                    : '❌'}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-0.5 text-xs text-gray-700 mb-2">
                <div className="relative flex items-center gap-1">
                  <MapPin size={10} className="flex-shrink-0" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddressTooltip(showAddressTooltip === reservation.id ? null : reservation.id);
                      onActivity();
                    }}
                    className="truncate hover:text-accent-600 transition-colors font-medium underline decoration-dotted"
                  >
                    {reservation.lots.profiles.business_name}
                  </button>
                  
                  {/* Tooltip avec adresse */}
                  {showAddressTooltip === reservation.id && (
                    <div className="absolute left-0 top-full mt-1 z-10 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 shadow-lg min-w-[200px] animate-fade-in">
                      <p className="font-semibold mb-0.5">📍 Adresse :</p>
                      <p className="leading-tight">{reservation.lots.profiles.business_address}</p>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Package size={10} className="flex-shrink-0" />
                  <span className="font-bold">Qté: {reservation.quantity}</span>
                </div>
              </div>

              {/* Code PIN */}
              <div className="mb-2 p-2 bg-gradient-to-r from-accent-100 to-pink-100 rounded-lg border border-accent-200">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-0.5">
                    <Key size={10} />
                    <span className="text-xs font-bold text-accent-900">PIN</span>
                  </div>
                  <Heart size={10} className="text-accent-600" strokeWidth={2} />
                </div>
                <p className="font-mono font-bold text-xl text-accent-700 text-center tracking-wider leading-tight">
                  {reservation.pickup_pin}
                </p>
              </div>

              {/* Bouton QR Code */}
              {reservation.status === 'pending' && (
                <button
                  onClick={() => handleShowQR(reservation)}
                  className="w-full py-1.5 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-bold text-xs shadow-soft flex items-center justify-center gap-1"
                >
                  <QrCode size={12} strokeWidth={2} />
                  <span>QR Code</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR Code */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-4 text-center animate-fade-in-up shadow-soft-xl border-2 border-accent-200">
            <h3 className="text-base font-bold mb-3 text-gray-900 text-center">
              QR Code de Retrait
            </h3>

            {/* Titre du panier */}
            <div className="text-center mb-3">
              <h4 className="text-sm font-bold text-black line-clamp-2">
                {selectedReservation.lots.title}
              </h4>
            </div>

            {/* Message d'aide */}
            <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-center text-blue-900">
                <strong>💡</strong> Cliquez sur le QR pour l'agrandir
              </p>
            </div>

            {/* QR Code et PIN côte à côte */}
            <div className="flex gap-2 mb-3">
              {/* QR Code à gauche */}
              <div ref={qrCodeRef} className="flex-1 flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 shadow-soft">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-gray-600 font-semibold">QR Code</p>
                  <button
                    onClick={() => {
                      setEnlargedQR(true);
                      onActivity();
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    title="Agrandir"
                  >
                    <Maximize2 size={12} className="text-gray-600" />
                  </button>
                </div>
                <div 
                  onClick={() => {
                    setEnlargedQR(true);
                    onActivity();
                  }}
                  className="p-1 bg-gray-50 rounded cursor-pointer hover:bg-accent-50 transition-colors"
                >
                  <QRCodeSVG
                    value={JSON.stringify({
                      reservationId: selectedReservation.id,
                      pin: selectedReservation.pickup_pin,
                      userId: profile.id,
                    })}
                    size={120}
                    level="H"
                  />
                </div>
              </div>

              {/* Code PIN à droite */}
              <div className="flex-1 flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-accent-50 to-pink-50 rounded-lg border-2 border-accent-200 shadow-soft">
                <div className="text-center">
                  <p className="text-xs font-bold text-accent-900 mb-1 flex items-center justify-center gap-1">
                    <Key size={12} />
                    <span>Code PIN</span>
                  </p>
                  <p className="font-mono font-bold text-3xl text-accent-700 tracking-wider">
                    {selectedReservation.pickup_pin}
                  </p>
                  <p className="text-xs text-accent-600 mt-1">À présenter</p>
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-0.5 text-xs text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <MapPin size={12} />
                  <span className="font-medium">{selectedReservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Clock size={12} />
                  <span>{formatDateTime(selectedReservation.lots.pickup_start)}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Package size={12} />
                  <span>Quantité: {selectedReservation.quantity}</span>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 py-2 bg-gradient-to-r from-accent-600 to-pink-600 text-white rounded-lg hover:from-accent-700 hover:to-pink-700 transition-all font-semibold text-sm shadow-soft-md flex items-center justify-center gap-1.5"
              >
                <Download size={16} />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => {
                  setSelectedReservation(null);
                  onActivity();
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm border border-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code agrandi */}
      {enlargedQR && selectedReservation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={() => {
            setEnlargedQR(false);
            onActivity();
          }}
        >
          <div className="relative">
            <button
              onClick={() => {
                setEnlargedQR(false);
                onActivity();
              }}
              className="absolute -top-10 right-0 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} className="text-gray-900" />
            </button>
            <div className="bg-white p-4 rounded-xl shadow-2xl">
              <QRCodeSVG 
                value={JSON.stringify({
                  reservationId: selectedReservation.id,
                  pin: selectedReservation.pickup_pin,
                  userId: profile.id,
                })}
                size={300} 
                level="H" 
              />
              <p className="text-center mt-3 font-mono font-bold text-xl text-gray-900">
                {selectedReservation.pickup_pin}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

