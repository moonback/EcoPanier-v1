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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Mode Démonstration</h2>
          <p className="text-gray-600 font-light">
            Scannez ce QR code pour tester la station
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <QRCodeSVG
                value={JSON.stringify(demoData)}
                size={250}
                level="H"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-black mb-4">Informations de test</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-light mb-1">Code PIN</p>
                <p className="font-mono font-bold text-2xl text-black">123456</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-light mb-1">ID Réservation</p>
                <p className="font-mono text-xs text-gray-800 break-all font-light">
                  {demoData.reservationId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-light">
              <strong className="font-semibold">Note :</strong> Ce QR code est uniquement à des fins de test. 
              Pour valider de vraies réservations, utilisez les QR codes générés depuis l'espace client.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Fermer
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition font-medium"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

