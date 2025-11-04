import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '../../utils/helpers';
import { Package, MapPin, Clock, Key, Heart, Download, Maximize2, X } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: { business_name: string; business_address: string };
  };
};

export const BeneficiaryReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { profile } = useAuthStore();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [enlargedQR, setEnlargedQR] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const [enlargedQrSize, setEnlargedQrSize] = useState(320);

  useEffect(() => {
    fetchReservations();
  }, []);

  // Calculer la taille du QR code en fonction de la largeur de l'écran
  useEffect(() => {
    const calculateQrSize = () => {
      const width = window.innerWidth;
      // QR code normal dans le modal
      setQrSize(width < 640 ? 200 : 180);
      // QR code agrandi
      setEnlargedQrSize(Math.min(width - 64, 320));
    };

    calculateQrSize();
    window.addEventListener('resize', calculateQrSize);
    
    return () => window.removeEventListener('resize', calculateQrSize);
  }, []);

  const fetchReservations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, lots(*, profiles(business_name, business_address))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!selectedReservation || !qrCodeRef.current) return;

    try {
      const qrSvg = qrCodeRef.current.querySelector('svg');
      if (!qrSvg) {
        alert('QR Code non trouve');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Canvas non supporte');
        return;
      }

      const width = 600;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // Fond blanc
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // En-tête gradient rose (bénéficiaire)
      const gradient = ctx.createLinearGradient(0, 0, width, 80);
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(1, '#f472b6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EcoPanier', width / 2, 50);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Code de Retrait', width / 2, 130);

      ctx.font = '18px Arial';
      ctx.fillStyle = '#4b5563';
      const title = selectedReservation.lots.title;
      if (title.length > 40) {
        ctx.fillText(title.substring(0, 40) + '...', width / 2, 160);
      } else {
        ctx.fillText(title, width / 2, 160);
      }

      const svgString = new XMLSerializer().serializeToString(qrSvg);
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      const img = new Image();
      
      img.onload = () => {
        try {
          const qrSize = 250;
          const qrX = (width - qrSize) / 2;
          const qrY = 200;
          
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          const pinY = 500;
          
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          const pinBoxWidth = 400;
          const pinBoxHeight = 120;
          const pinBoxX = (width - pinBoxWidth) / 2;
          ctx.fillRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);
          ctx.strokeRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);

          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('Code PIN', width / 2, pinY + 35);

          ctx.fillStyle = '#92400e';
          ctx.font = 'bold 48px monospace';
          ctx.fillText(selectedReservation.pickup_pin, width / 2, pinY + 85);

          const infoY = 650;
          ctx.fillStyle = '#6b7280';
          ctx.font = '16px Arial';
          ctx.fillText(`Commercant: ${selectedReservation.lots.profiles.business_name}`, width / 2, infoY);
          ctx.fillText(`Retrait: ${formatDateTime(selectedReservation.lots.pickup_start)}`, width / 2, infoY + 25);
          ctx.fillText(`Quantite: ${selectedReservation.quantity}`, width / 2, infoY + 50);

          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.fillText('EcoPanier - Panier Solidaire Gratuit', width / 2, infoY + 90);

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

      img.onerror = () => {
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
      <div className="flex justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-gradient-to-br from-accent-50 to-pink-50 rounded-full mb-6">
          <Package size={64} className="text-accent-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-bold text-black mb-3">
          Vos paniers solidaires vous attendent ! 🎁
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-light">
          Vous n'avez pas encore de réservation. Explorez les paniers solidaires 
          disponibles et profitez du programme solidaire ! ❤️
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold hover:from-accent-700 hover:to-accent-800 transition-all shadow-lg"
        >
          Découvrir les paniers solidaires
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all border-2 border-gray-100 hover:border-gray-200"
          >
            <div
              className={`p-4 ${
                reservation.status === 'pending'
                  ? 'bg-gradient-to-br from-accent-50 to-pink-50'
                  : reservation.status === 'completed'
                  ? 'bg-gradient-to-br from-success-50 to-white'
                  : 'bg-gradient-to-br from-gray-50 to-white'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-bold text-base text-black line-clamp-2 flex-1 group-hover:text-accent-600 transition-colors">
                  {reservation.lots.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border-2 shadow-sm ${
                    reservation.status === 'pending'
                      ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-700 border-warning-300'
                      : reservation.status === 'completed'
                      ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  {reservation.status === 'pending'
                    ? '⏳ En attente'
                    : reservation.status === 'completed'
                    ? '✅ Récupéré'
                    : '❌ Annulé'}
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{reservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{formatDateTime(reservation.lots.pickup_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-semibold">Quantité: {reservation.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-mono font-bold text-sm sm:text-base text-pink-700">
                    PIN: {reservation.pickup_pin}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-accent-100 to-pink-100 rounded-xl border-2 border-accent-200 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <Heart size={16} className="text-accent-600" strokeWidth={2} />
                  <p className="text-xs font-bold text-accent-700">
                    ❤️ PANIER SOLIDAIRE
                  </p>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  📱 Voir mon QR Code
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 my-auto animate-fade-in-up">
            {/* Header avec bouton fermer mobile-friendly */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                QR Code de Retrait
              </h3>
              <button
                onClick={() => {
                  setSelectedReservation(null);
                  setEnlargedQR(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden"
                aria-label="Fermer"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            {/* Titre du panier */}
            <div className="text-center mb-4">
              <span className="text-xs sm:text-sm text-gray-600">Invendu :</span>
              <h3 className="text-base sm:text-lg font-bold text-black mt-1">
                {selectedReservation.lots.title}
              </h3>
            </div>

            {/* Message d'aide */}
            <div className="mb-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-center text-blue-900">
                <strong>💡 Astuce :</strong> Touchez le QR code pour l'agrandir
              </p>
            </div>

            {/* QR Code et PIN - Layout optimisé mobile */}
            <div className="flex flex-col gap-4 mb-4">
               {/* QR Code - Pleine largeur sur mobile, centré et plus grand */}
               <div ref={qrCodeRef} className="flex flex-col items-center gap-2.5 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-lg">
                 <div className="flex items-center justify-between w-full mb-1">
                   <p className="text-xs sm:text-sm text-gray-700 font-semibold">QR Code</p>
                   <button
                     onClick={() => setEnlargedQR(true)}
                     className="p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                     title="Agrandir"
                     aria-label="Agrandir le QR code"
                   >
                     <Maximize2 size={16} className="sm:w-4 sm:h-4 text-gray-600" />
                   </button>
                 </div>
                 <div 
                   onClick={() => setEnlargedQR(true)}
                   className="p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-300 cursor-pointer active:scale-[0.98] transition-transform touch-manipulation shadow-md"
                 >
                   <QRCodeSVG 
                     value={JSON.stringify({
                       reservationId: selectedReservation.id,
                       pin: selectedReservation.pickup_pin,
                       userId: profile?.id,
                     })}
                     size={qrSize}
                     level="H"
                     className="w-full h-auto"
                   />
                 </div>
                 <p className="text-xs text-gray-500 text-center mt-1">Touchez pour agrandir</p>
               </div>

               {/* Code PIN - Pleine largeur sur mobile */}
               <div className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-accent-50 to-pink-50 rounded-xl border-2 border-accent-300 shadow-lg">
                 <div className="text-center w-full">
                   <p className="text-sm sm:text-base text-accent-800 font-bold mb-3 flex items-center justify-center gap-2">
                     <Key size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                     <span>Code PIN</span>
                   </p>
                   <p className="font-mono font-bold text-5xl sm:text-6xl text-accent-700 tracking-wider mb-2">
                     {selectedReservation.pickup_pin}
                   </p>
                   <p className="text-xs sm:text-sm text-accent-600 font-medium">À présenter au commerçant</p>
                 </div>
               </div>
             </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">{selectedReservation.lots.profiles.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{formatDateTime(selectedReservation.lots.pickup_start)}</span>
                </div>
              </div>
            </div>
            
            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <Download size={20} />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => setSelectedReservation(null)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Fermer
              </button>
            </div>
           </div>
         </div>
       )}

       {/* Modal QR Code agrandi - Optimisé mobile */}
       {enlargedQR && selectedReservation && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4 sm:p-6 animate-fade-in"
           onClick={() => setEnlargedQR(false)}
         >
           <div className="relative w-full max-w-lg">
             {/* Header avec bouton fermer et message d'aide */}
             <div className="absolute -top-10 sm:-top-12 left-0 right-0 flex items-center justify-between mb-2">
               <p className="text-white text-xs sm:text-sm text-center flex-1">
                 Touchez pour fermer
               </p>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   setEnlargedQR(false);
                 }}
                 className="p-2.5 sm:p-3 bg-white rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg touch-manipulation flex-shrink-0 ml-2"
                 aria-label="Fermer"
               >
                 <X size={20} className="sm:w-6 sm:h-6 text-gray-900" />
               </button>
             </div>
             
             {/* QR Code agrandi - Responsive */}
             <div 
               className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl"
               onClick={(e) => e.stopPropagation()}
             >
               <QRCodeSVG 
                 value={JSON.stringify({
                   reservationId: selectedReservation.id,
                   pin: selectedReservation.pickup_pin,
                   userId: profile?.id,
                 })}
                 size={enlargedQrSize}
                 level="H"
                 className="w-full h-auto"
               />
               <div className="mt-4 sm:mt-6 text-center">
                 <p className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold">Code PIN</p>
                 <p className="font-mono font-bold text-3xl sm:text-4xl text-gray-900 tracking-wider">
                   {selectedReservation.pickup_pin}
                 </p>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };
