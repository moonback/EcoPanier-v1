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
          ctx.fillText(`Prix: ${reservation.total_price.toFixed(2)} EUR`, width / 2, infoY + 75);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black">Code de retrait</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Titre du panier */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">Invendu :</span>
          <h3 className="text-xl font-bold text-black">
            {reservation.lots.title}
          </h3>
        </div>

        {/* QR Code et PIN côte à côte */}
        <div className="flex gap-4 mb-6">
          {/* QR Code à gauche */}
          <div ref={qrCodeRef} className="flex-1 flex flex-col items-center gap-2 p-3 bg-white rounded-xl border-2 border-gray-100 shadow-lg">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-gray-600 font-semibold">QR Code</p>
              <button
                onClick={() => setEnlargedQR(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Agrandir"
              >
                <Maximize2 size={14} className="text-gray-600" />
              </button>
            </div>
            <div 
              onClick={() => setEnlargedQR(true)}
              className="p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors"
            >
              <QRCodeSVG value={qrData} size={160} level="H" />
            </div>
          </div>

          {/* Code PIN à droite */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200 shadow-lg">
            <div className="text-center">
              <p className="text-sm text-primary-800 font-bold mb-2 flex items-center justify-center gap-1">
                <Key size={16} />
                <span>Code PIN</span>
              </p>
              <p className="font-mono font-bold text-5xl text-primary-700 tracking-wider">
                {reservation.pickup_pin}
              </p>
              <p className="text-xs text-primary-600 mt-2">À présenter au commerçant</p>
            </div>
          </div>
        </div>

        {/* Informations de retrait */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-1 text-sm text-blue-900">
            <p><strong>Commercant:</strong> {reservation.lots.profiles.business_name}</p>
            <p><strong>Adresse:</strong> {reservation.lots.profiles.business_address}</p>
            <p><strong>Retrait:</strong> {formatDateTime(reservation.lots.pickup_start)}</p>
            <p><strong>Quantite:</strong> {reservation.quantity}</p>
            <p><strong>Prix:</strong> {reservation.total_price.toFixed(2)} EUR</p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <Download size={20} />
            <span>Télécharger</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modal QR Code agrandi */}
      {enlargedQR && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setEnlargedQR(false)}
        >
          <div className="relative">
            <button
              onClick={() => setEnlargedQR(false)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} className="text-gray-900" />
            </button>
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <QRCodeSVG value={qrData} size={400} level="H" />
              <p className="text-center mt-4 font-mono font-bold text-2xl text-gray-900">
            {reservation.pickup_pin}
          </p>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

