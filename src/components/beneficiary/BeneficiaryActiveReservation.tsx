// Imports externes
import { MapPin, Clock, Key, Heart, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Imports internes
import { formatDateTime } from '../../utils/helpers';

// Imports types
import type { Database } from '../../lib/database.types';

type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  lots: Database['public']['Tables']['lots']['Row'] & {
    profiles: {
      business_name: string;
      business_address: string;
    };
  };
};

interface BeneficiaryActiveReservationProps {
  reservation: Reservation;
}

/**
 * Widget pour afficher la réservation active du bénéficiaire
 * ULTRA-VISIBLE : QR Code et PIN en très grand pour Mode Kiosque
 * Layout vertical simple pour accessibilité maximale
 */
export function BeneficiaryActiveReservation({ reservation }: BeneficiaryActiveReservationProps) {
  // Générer les données du QR Code
  const qrData = JSON.stringify({
    reservationId: reservation.id,
    pin: reservation.pickup_pin,
    userId: reservation.user_id,
    lotId: reservation.lot_id,
    timestamp: new Date().toISOString(),
  });

  // Fonction pour télécharger le QR Code
  const handleDownloadQR = () => {
    const svg = document.querySelector('#beneficiary-qr-code svg');
    if (!svg) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
      ctx.fillText('Panier Solidaire Gratuit', width / 2, 130);

      const svgString = new XMLSerializer().serializeToString(svg);
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      
      const img = new Image();
      
      img.onload = () => {
        const qrSize = 250;
        const qrX = (width - qrSize) / 2;
        const qrY = 180;
        
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        const pinY = 480;
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
        ctx.fillText(reservation.pickup_pin, width / 2, pinY + 85);

        const infoY = 640;
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.fillText(`Commerçant: ${reservation.lots.profiles.business_name}`, width / 2, infoY);
        ctx.fillText(`Retrait: ${formatDateTime(reservation.lots.pickup_start)}`, width / 2, infoY + 25);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.fillText('EcoPanier - Panier Solidaire Gratuit', width / 2, infoY + 60);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `EcoPanier-${reservation.pickup_pin}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      img.src = svgDataUrl;
    } catch (error) {
      console.error('Erreur téléchargement QR Code:', error);
    }
  };

  // Render principal
  return (
    <div className="card bg-gradient-to-br from-accent-50 via-pink-50 to-accent-100 rounded-2xl md:rounded-3xl border-4 border-accent-300 p-6 md:p-8 shadow-2xl">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3">
          <span className="text-3xl">📦</span>
          <span>Votre panier à récupérer</span>
        </h2>
        <span className="px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full text-sm md:text-base font-bold shadow-lg animate-pulse">
          ✓ Réservé
        </span>
      </div>

      {/* Titre du lot */}
      <div className="mb-6 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 shadow-md">
        <h3 className="text-xl md:text-3xl font-bold text-black text-center">
          {reservation.lots.title}
        </h3>
        <p className="text-sm md:text-base text-gray-600 text-center mt-2 font-light">
          Quantité : {reservation.quantity}
        </p>
      </div>

      {/* QR Code - TRÈS GRAND pour Mode Kiosque */}
      <div className="mb-6 p-6 md:p-8 bg-white rounded-xl md:rounded-2xl border-4 border-accent-200 shadow-2xl">
        <p className="text-base md:text-xl font-bold text-gray-800 text-center mb-4">
          Présentez ce QR Code au commerçant
        </p>
        <div id="beneficiary-qr-code" className="flex justify-center p-4 bg-gray-50 rounded-xl">
          <QRCodeSVG
            value={qrData}
            size={Math.min(300, window.innerWidth - 120)} // Adaptatif, max 300px
            level="H"
            includeMargin={true}
          />
        </div>
        
        {/* Bouton de téléchargement */}
        <button
          onClick={handleDownloadQR}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 md:py-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all font-semibold shadow-lg text-base md:text-lg"
        >
          <Download size={24} strokeWidth={2} />
          <span>Télécharger le QR Code</span>
        </button>
      </div>

      {/* Code PIN - TRÈS GRAND */}
      <div className="mb-6 p-6 md:p-8 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-xl md:rounded-2xl border-4 border-warning-300 shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Key size={32} className="text-warning-700" strokeWidth={2.5} />
          <p className="text-lg md:text-2xl font-bold text-warning-900">
            Code PIN de retrait
          </p>
        </div>
        <p className="text-5xl md:text-7xl font-bold text-warning-700 tracking-widest text-center py-4 font-mono">
          {reservation.pickup_pin}
        </p>
        <p className="text-sm md:text-base text-warning-800 text-center font-medium">
          À communiquer au commerçant
        </p>
      </div>

      {/* Informations du commerçant */}
      <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 shadow-md space-y-4">
        <div className="flex items-start gap-3 md:gap-4">
          <MapPin size={28} className="text-accent-600 flex-shrink-0 mt-1" strokeWidth={2} />
          <div>
            <p className="text-lg md:text-xl font-bold text-black">
              {reservation.lots.profiles.business_name}
            </p>
            <p className="text-base md:text-lg text-gray-600 font-light">
              {reservation.lots.profiles.business_address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Clock size={28} className="text-accent-600 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm md:text-base text-gray-600 font-medium">Heure de retrait</p>
            <p className="text-lg md:text-xl font-bold text-black">
              {formatDateTime(reservation.lots.pickup_start)}
            </p>
          </div>
        </div>
      </div>

      {/* Badge Panier Solidaire */}
      <div className="mt-6 p-4 md:p-6 bg-gradient-to-r from-accent-100 to-pink-100 rounded-xl md:rounded-2xl border-2 border-accent-200 shadow-md">
        <div className="flex items-center justify-center gap-3">
          <Heart size={28} className="text-accent-600" strokeWidth={2} />
          <p className="text-base md:text-xl font-bold text-accent-700">
            ❤️ PANIER SOLIDAIRE GRATUIT
          </p>
        </div>
      </div>
    </div>
  );
}

