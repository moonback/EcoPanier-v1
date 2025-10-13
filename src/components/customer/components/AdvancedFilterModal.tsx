import { useState } from 'react';
import { X } from 'lucide-react';
import { categories } from '../../../utils/helpers';

export interface AdvancedFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  onlyUrgent: boolean;
  minQuantity: number;
  sortBy: 'price_asc' | 'price_desc' | 'quantity_desc' | 'urgent';
}

interface AdvancedFilterModalProps {
  filters: AdvancedFilters;
  onApplyFilters: (filters: AdvancedFilters) => void;
  onClose: () => void;
}

export function AdvancedFilterModal({
  filters,
  onApplyFilters,
  onClose,
}: AdvancedFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: AdvancedFilters = {
      category: '',
      minPrice: 0,
      maxPrice: 100,
      onlyUrgent: false,
      minQuantity: 1,
      sortBy: 'urgent'
    };
    setLocalFilters(defaultFilters);
  };

  const activeFiltersCount = 
    (localFilters.category ? 1 : 0) +
    (localFilters.onlyUrgent ? 1 : 0) +
    (localFilters.minQuantity > 1 ? 1 : 0) +
    ((localFilters.minPrice > 0 || localFilters.maxPrice < 100) ? 1 : 0);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-black">Filtres</h3>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-gray-600 font-light mt-1">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-bold text-black mb-3">
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, category: '' })}
                className={`p-3 rounded-lg font-medium transition-all ${
                  localFilters.category === ''
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocalFilters({ ...localFilters, category: cat })}
                  className={`p-3 rounded-lg font-medium transition-all text-sm ${
                    localFilters.category === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-bold text-black mb-3">
              Fourchette de prix
            </label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-light">Prix minimum</span>
                  <span className="text-sm font-semibold text-black">{localFilters.minPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-light">Prix maximum</span>
                  <span className="text-sm font-semibold text-black">{localFilters.maxPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            </div>
          </div>

          {/* Quantité minimale */}
          <div>
            <label className="block text-sm font-bold text-black mb-3">
              Quantité minimale disponible
            </label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-light">Au moins {localFilters.minQuantity} unités</span>
              <span className="text-sm font-semibold text-black">{localFilters.minQuantity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={localFilters.minQuantity}
              onChange={(e) => setLocalFilters({ ...localFilters, minQuantity: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* Lots urgents uniquement */}
          <div>
            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <input
                type="checkbox"
                checked={localFilters.onlyUrgent}
                onChange={(e) => setLocalFilters({ ...localFilters, onlyUrgent: e.target.checked })}
                className="w-5 h-5 text-black rounded focus:ring-gray-200 cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-black">Lots urgents uniquement</span>
                <p className="text-xs text-gray-600 mt-1 font-light">Afficher seulement les lots à récupérer rapidement</p>
              </div>
            </label>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-bold text-black mb-3">
              Trier par
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'urgent' })}
                className={`p-3 rounded-lg font-medium transition-all text-sm ${
                  localFilters.sortBy === 'urgent'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 Urgence
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'price_asc' })}
                className={`p-3 rounded-lg font-medium transition-all text-sm ${
                  localFilters.sortBy === 'price_asc'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💰 Prix ↑
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'price_desc' })}
                className={`p-3 rounded-lg font-medium transition-all text-sm ${
                  localFilters.sortBy === 'price_desc'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💰 Prix ↓
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'quantity_desc' })}
                className={`p-3 rounded-lg font-medium transition-all text-sm ${
                  localFilters.sortBy === 'quantity_desc'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📦 Quantité
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
          >
            Appliquer ({activeFiltersCount})
          </button>
        </div>
      </div>
    </div>
  );
}
