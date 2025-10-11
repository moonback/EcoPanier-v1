import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Info, X } from 'lucide-react';

interface DemoData {
  reservationId: string;
  pin: string;
  userId: string;
  lotId: string;
  timestamp: string;
}

export const PickupStationDemo = ({ onClose }: { onClose: () => void }) => {
  const [demoData] = useState<DemoData>({
    reservationId: 'demo-reservation-123',
    pin: '123456',
    userId: 'demo-user-456',
    lotId: 'demo-lot-789',
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mode Démonstration</h2>
          <p className="text-gray-600">
            Scannez ce QR code pour tester la station de retrait
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <QRCodeSVG
                value={JSON.stringify(demoData)}
                size={250}
                level="H"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 space-y-3">
            <h3 className="font-bold text-gray-800 mb-3">Informations de test :</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Code PIN</p>
                <p className="font-mono font-bold text-lg text-blue-600">123456</p>
              </div>
              <div>
                <p className="text-gray-600">ID Réservation</p>
                <p className="font-mono text-xs text-gray-800 break-all">
                  {demoData.reservationId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Note :</strong> Ce QR code est uniquement à des fins de test. 
              Pour valider de vraies réservations, utilisez les QR codes générés 
              depuis l'espace client.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Fermer
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

