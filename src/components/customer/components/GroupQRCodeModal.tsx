import { useRef, useState, useEffect } from 'react';
import { X, Download, Key, Maximize2, Package } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';
import type { Database } from '../../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface GroupQRCodeModalProps {
  reservations: Reservation[]; // Liste de réservations du même groupe
  userId: string;
  onClose: () => void;
}

/**
 * Modal pour afficher le QR code d'un groupe de réservations (panier)
 * Affiche un seul QR code et PIN pour plusieurs produits du même commerçant
 */
export function GroupQRCodeModal({
  reservations,
  userId,
  onClose,
}: GroupQRCodeModalProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [enlargedQR, setEnlargedQR] = useState(false);

  if (reservations.length === 0) {
    return null;
  }

  // Toutes les réservations ont le même PIN et cart_group_id
  const firstReservation = reservations[0];
  const pin = firstReservation.pickup_pin;
  const cartGroupId = firstReservation.cart_group_id;
  const merchantName = firstReservation.lots.profiles.business_name;
  const merchantAddress = firstReservation.lots.profiles.business_address;

  // Calculer le total
  const totalPrice = reservations.reduce((sum, r) => sum + r.total_price, 0);
  const totalQuantity = reservations.reduce((sum, r) => sum + r.quantity, 0);

  // Données du QR code incluant le cart_group_id
  const qrData = JSON.stringify({
    cartGroupId,
    pin,
    userId,
    reservationIds: reservations.map(r => r.id),
    timestamp: new Date().toISOString(),
    type: 'group', // Identifier qu'il s'agit d'un groupe
  });

  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;

    try {
      const qrSvg = qrCodeRef.current.querySelector('svg');
      if (!qrSvg) {
        alert('QR Code non trouvé');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Canvas non supporté');
        return;
      }

      // Dimensions adaptées au contenu
      const width = 600;
      const height = 900 + (reservations.length * 20); // Hauteur dynamique
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
      ctx.fillText('Panier Groupé', width / 2, 130);

      // Nombre de produits
      ctx.font = '18px Arial';
      ctx.fillStyle = '#4b5563';
      ctx.fillText(`${reservations.length} produit${reservations.length > 1 ? 's' : ''}`, width / 2, 160);

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
          ctx.fillText('Code PIN Unique', width / 2, pinY + 35);

          // Code PIN
          ctx.fillStyle = '#1e40af';
          ctx.font = 'bold 48px monospace';
          ctx.fillText(pin, width / 2, pinY + 85);

          // Informations commerçant
          let currentY = 650;
          ctx.fillStyle = '#6b7280';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(`Commerçant: ${merchantName}`, width / 2, currentY);
          currentY += 30;
          
          ctx.font = '16px Arial';
          ctx.fillText(`Total: ${totalQuantity} article${totalQuantity > 1 ? 's' : ''} - ${totalPrice.toFixed(2)}€`, width / 2, currentY);
          currentY += 40;

          // Liste des produits
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 16px Arial';
          ctx.fillText('Produits à retirer:', width / 2, currentY);
          currentY += 25;

          ctx.font = '14px Arial';
          ctx.fillStyle = '#6b7280';
          reservations.forEach((reservation, index) => {
            const text = `${index + 1}. ${reservation.lots.title} (x${reservation.quantity})`;
            if (text.length > 50) {
              ctx.fillText(text.substring(0, 50) + '...', width / 2, currentY);
            } else {
              ctx.fillText(text, width / 2, currentY);
            }
            currentY += 20;
          });

          // Footer
          currentY += 20;
          ctx.fillStyle = '#9ca3af';
          ctx.font = '12px Arial';
          ctx.fillText('Présentez ce QR code et le code PIN au commerçant', width / 2, currentY);

          // Télécharger
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `EcoPanier-Panier-${pin}.png`;
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
      console.error('Erreur téléchargement:', error);
      alert('Erreur: ' + (error as Error).message);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
          {/* En-tête */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package size={24} strokeWidth={2} />
                <h2 className="text-2xl font-bold">Panier Groupé</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <p className="text-primary-100 text-sm">
              {reservations.length} produit{reservations.length > 1 ? 's' : ''} • {merchantName}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Info importante */}
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <p className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-lg">✨</span>
                <span>
                  <strong>Un seul QR code</strong> pour retirer tous vos produits en une fois !
                </span>
              </p>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <div
                ref={qrCodeRef}
                className={`bg-gray-50 rounded-xl p-6 flex items-center justify-center border-2 border-gray-200 cursor-pointer transition-all ${
                  enlargedQR ? 'scale-150' : 'hover:scale-105'
                }`}
                onClick={() => setEnlargedQR(!enlargedQR)}
              >
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                <Maximize2 size={12} />
                Cliquez pour agrandir
              </p>
            </div>

            {/* Code PIN */}
            <div className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Key size={20} className="text-primary-600" strokeWidth={2} />
                <p className="text-sm font-semibold text-primary-900">Code PIN Unique</p>
              </div>
              <p className="text-4xl font-bold text-center text-primary-600 tracking-wider font-mono">
                {pin}
              </p>
            </div>

            {/* Liste des produits */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                📦 Produits inclus
              </h3>
              <div className="space-y-2">
                {reservations.map((reservation, index) => (
                  <div
                    key={reservation.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {reservation.lots.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Quantité: {reservation.quantity} • {formatCurrency(reservation.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {totalQuantity} article{totalQuantity > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                📍 Instructions de retrait
              </h4>
              <ol className="text-xs text-blue-800 space-y-1">
                <li>1. Rendez-vous chez {merchantName}</li>
                <li>2. Présentez ce QR code au commerçant</li>
                <li>3. Communiquez le code PIN: <strong>{pin}</strong></li>
                <li>4. Récupérez tous vos produits en une fois</li>
              </ol>
            </div>

            {/* Bouton télécharger */}
            <button
              onClick={handleDownloadQR}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download size={20} strokeWidth={2} />
              Télécharger le QR Code
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

