import { DollarSign, Gift } from 'lucide-react';
import { formatCurrency } from '../../../../utils/helpers';
import type { LotFormState } from '../types';

interface PricingStepProps {
  formState: LotFormState;
}

export const PricingStep = ({ formState }: PricingStepProps) => {
  const { formData, setFormData } = formState;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-2">Prix et Quantité</h4>
        <p className="text-gray-600">Définissez vos tarifs anti-gaspi</p>
      </div>

      {/* Choix : Gratuit ou Payant */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <label className="block text-sm font-bold text-gray-800 mb-3">Type de lot</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                is_free: false,
                original_price: formData.is_free ? 0 : formData.original_price,
                discounted_price: formData.is_free ? 0 : formData.discounted_price,
              })
            }
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              !formData.is_free
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-300'
            }`}
          >
            <DollarSign size={18} strokeWidth={2.5} />
            <span>Payant</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                is_free: true,
                original_price: 0,
                discounted_price: 0,
              })
            }
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              formData.is_free
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-green-300'
            }`}
          >
            <Gift size={18} strokeWidth={2.5} />
            <span>Gratuit</span>
          </button>
        </div>
        {formData.is_free && (
          <div className="mt-3 p-3 bg-white rounded-lg border-2 border-green-300">
            <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span>Lot solidaire gratuit</span>
            </p>
            <p className="text-xs text-green-700 mt-1">
              Ce lot sera visible uniquement par les bénéficiaires et sera entièrement gratuit.
              C'est un geste généreux contre le gaspillage alimentaire !
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={formData.is_free ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="text-red-500">*</span> Prix original (€)
          </label>
          <div className="relative">
            <DollarSign
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.original_price}
              onChange={(e) =>
                setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })
              }
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="0.00"
              disabled={formData.is_free}
              required={!formData.is_free}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.is_free ? 'Gratuit - Prix désactivé' : 'Prix de vente habituel'}
          </p>
        </div>

        <div className={formData.is_free ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="text-red-500">*</span> Prix réduit (€)
          </label>
          <div className="relative">
            <DollarSign
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.discounted_price}
              onChange={(e) => {
                const newPrice = parseFloat(e.target.value) || 0;
                // Automatiquement passer en mode gratuit si prix = 0
                setFormData({
                  ...formData,
                  discounted_price: newPrice,
                  is_free: newPrice === 0,
                  original_price: newPrice === 0 ? 0 : formData.original_price,
                });
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="0.00"
              disabled={formData.is_free}
              required={!formData.is_free}
            />
          </div>
          {!formData.is_free ? (
            <p className="text-xs text-green-600 mt-1">
              {formData.original_price > 0 && formData.discounted_price > 0
                ? `Réduction de ${Math.round((1 - formData.discounted_price / formData.original_price) * 100)}%`
                : 'Prix anti-gaspillage'}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Gratuit - Prix désactivé</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <span className="text-red-500">*</span> Quantité disponible
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity_total}
          onChange={(e) =>
            setFormData({ ...formData, quantity_total: parseInt(e.target.value) || 1 })
          }
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="1"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Nombre d'unités à vendre</p>
      </div>

      {formData.original_price > 0 &&
        formData.discounted_price > 0 &&
        formData.quantity_total > 0 && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">📊 Résumé</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Chiffre d'affaires potentiel</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(formData.discounted_price * formData.quantity_total)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Économie client</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    (formData.original_price - formData.discounted_price) * formData.quantity_total
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

