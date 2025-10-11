import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export const QRScanner = ({ onScan, onClose, isActive }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      onScan(result[0].rawValue);
    }
  };

  const handleError = (error: any) => {
    console.error('Scanner error:', error);
    setError('Erreur d\'accès à la caméra. Veuillez autoriser l\'accès à la caméra.');
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Camera size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold">Scanner le QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment',
            }}
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            Placez le QR code de la réservation dans le cadre
          </p>
        </div>
      </div>
    </div>
  );
};

