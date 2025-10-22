import { useRef, useState } from 'react';
import { X, Download, Key, Maximize2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '../../../utils/helpers';
import type { Database } from '../../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface QRCodeModalProps {
  reservation: Reservation;
  userId: string;
  onClose: () => void;
}

/**
 * Modal pour afficher le QR code d'une réservation
 * Affiche le QR code et le code PIN pour le retrait
 */
export function QRCodeModal({
  reservation,
  userId,
  onClose,
}: QRCodeModalProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [enlargedQR, setEnlargedQR] = useState(false);

  const qrData = JSON.stringify({
    reservationId: reservation.id,
    pin: reservation.pickup_pin,
    userId,
    lotId: reservation.lot_id,
    timestamp: new Date().toISOString(),
  });

  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;

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
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
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
      const title = reservation.lots.title;
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
          ctx.fillStyle = '#dbeafe';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          const pinBoxWidth = 400;
          const pinBoxHeight = 120;
          const pinBoxX = (width - pinBoxWidth) / 2;
          ctx.fillRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);
          ctx.strokeRect(pinBoxX, pinY, pinBoxWidth, pinBoxHeight);

          // Label PIN
          ctx.fillStyle = '#1e3a8a';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('Code PIN', width / 2, pinY + 35);

          // Code PIN
          ctx.fillStyle = '#1e40af';
          ctx.font = 'bold 48px monospace';
          ctx.fillText(reservation.pickup_pin, width / 2, pinY + 85);

          // Informations en bas
          const infoY = 650;
          ctx.fillStyle = '#6b7280';
          ctx.font = '16px Arial';
          ctx.fillText(`Commercant: ${reservation.lots.profiles.business_name}`, width / 2, infoY);
          ctx.fillText(`Retrait: ${formatDateTime(reservation.lots.pickup_start)}`, width / 2, infoY + 25);
          ctx.fillText(`Quantite: ${reservation.quantity}`, width / 2, infoY + 50);

          // Prix
          ctx.fillText(`Prix: ${reservation.total_price.toFixed(2)}€`, width / 2, infoY + 75);

          // Footer
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.fillText('EcoPanier', width / 2, infoY + 110);

          // Télécharger l'image
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `EcoPanier-${reservation.pickup_pin}.png`;
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 lg:p-8 my-auto shadow-2xl">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">Code de retrait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors active:scale-95"
            aria-label="Fermer"
          >
            <X size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Titre du panier */}
        <div className="text-center mb-4 sm:mb-5">
          <span className="text-xs sm:text-sm text-gray-600">Invendu :</span>
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black mt-1">
            {reservation.lots.title}
          </h3>
        </div>
        

        {/* QR Code et PIN - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* QR Code */}
          <div ref={qrCodeRef} className="flex-1 flex flex-col items-center gap-2 p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-100 shadow-lg">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">QR Code</p>
              <button
                onClick={() => setEnlargedQR(true)}
                className="p-1 sm:p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-all active:scale-95"
                title="Agrandir"
              >
                <Maximize2 size={14} className="sm:w-4 sm:h-4 text-gray-600" />
              </button>
            </div>
            <div 
              onClick={() => setEnlargedQR(true)}
              className="w-full flex justify-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 active:border-primary-400 transition-all hover:shadow-md active:scale-95"
            >
              <QRCodeSVG value={qrData} size={140} className="w-full max-w-[140px] sm:max-w-[160px] h-auto pointer-events-none" level="H" />
            </div>
            <p className="text-[10px] text-gray-500 text-center font-medium mt-1">Toucher pour agrandir</p>
          </div>

          {/* Code PIN */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200 shadow-lg">
            <div className="text-center w-full">
              <p className="text-xs sm:text-sm text-primary-800 font-bold mb-2 sm:mb-3 flex items-center justify-center gap-1.5">
                <Key size={14} className="sm:w-4 sm:h-4" />
                <span>Code PIN</span>
              </p>
              <p className="font-mono font-bold text-3xl sm:text-4xl lg:text-5xl text-primary-700 tracking-wider">
                {reservation.pickup_pin}
              </p>
              <p className="text-[10px] sm:text-xs text-primary-600 mt-2">À présenter au commerçant</p>
            </div>
          </div>
        </div>

        {/* Informations de retrait */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-blue-900">
            <p className="break-words"><strong>Commerçant:</strong> {reservation.lots.profiles.business_name}</p>
            <p className="break-words"><strong>Adresse:</strong> {reservation.lots.profiles.business_address}</p>
            <p className="break-words"><strong>Retrait:</strong> {formatDateTime(reservation.lots.pickup_start)}</p>
            <p><strong>Quantité:</strong> {reservation.quantity}</p>
            <p><strong>Prix:</strong> {reservation.total_price.toFixed(2)} €</p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-sm active:bg-primary-800 transition-all active:scale-95 font-semibold text-sm sm:text-base"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span>Télécharger</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 active:bg-gray-400 transition-all active:scale-95 font-semibold text-sm sm:text-base"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modal QR Code agrandi */}
      {enlargedQR && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6 animate-fade-in"
          onClick={() => setEnlargedQR(false)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setEnlargedQR(false)}
              className="absolute -top-10 sm:-top-12 right-0 p-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white active:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
              aria-label="Fermer"
            >
              <X size={20} className="sm:w-6 sm:h-6 text-gray-900" />
            </button>
            <div 
              className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center">
                <QRCodeSVG 
                  value={qrData} 
                  size={280}
                  className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px] h-auto"
                  level="H" 
                />
              </div>
              <p className="text-center mt-4 sm:mt-6 font-mono font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 tracking-wider">
                {reservation.pickup_pin}
              </p>
              <p className="text-center mt-2 text-xs sm:text-sm text-gray-600 font-semibold">
                Code PIN de retrait
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

