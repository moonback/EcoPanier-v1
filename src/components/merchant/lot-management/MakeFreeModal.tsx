import { Gift, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import type { Lot } from './types';

interface MakeFreeModalProps {
  lot: Lot;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MakeFreeModal = ({ lot, onConfirm, onCancel }: MakeFreeModalProps) => {
  const remainingQty = lot.quantity_total - lot.quantity_sold;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Gift className="w-10 h-10 text-green-600" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center">Passer en gratuit ?</h3>
          <p className="text-green-50 text-center mt-2 text-sm">
            Action solidaire contre le gaspillage
          </p>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          {/* Informations du lot */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-start gap-3">
              {lot.image_urls && lot.image_urls.length > 0 ? (
                <img
                  src={lot.image_urls[0]}
                  alt={lot.title}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-lg truncate">{lot.title}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Quantité restante:</span>
                    <span className="font-bold text-green-700">{remainingQty} unité(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Prix actuel:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(lot.discounted_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message explicatif */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Ce qui va se passer :</span>
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  Le lot deviendra <strong>entièrement gratuit</strong> (0€)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  Visible uniquement pour les <strong>bénéficiaires</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  Les réservations en cours seront <strong>annulées</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  Action <strong>définitive</strong> et irréversible
                </span>
              </li>
            </ul>
          </div>

          {/* Impact solidaire */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <p className="font-bold text-green-900 text-sm">Impact solidaire</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Vous sauvez <strong>{remainingQty} repas</strong> du gaspillage et aidez les
                  personnes dans le besoin !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" strokeWidth={2.5} />
            <span>Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

