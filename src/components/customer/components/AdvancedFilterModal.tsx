import { useState } from 'react';
import { X, Filter, Zap, Euro, Package, TrendingUp } from 'lucide-react';
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Filtres avancés</h3>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-neutral-600">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, category: '' })}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  localFilters.category === ''
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                }`}
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocalFilters({ ...localFilters, category: cat })}
                  className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                    localFilters.category === cat
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              <Euro className="w-4 h-4 inline mr-2" />
              Fourchette de prix
            </label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Prix minimum</span>
                  <span className="text-sm font-semibold text-primary-600">{localFilters.minPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Prix maximum</span>
                  <span className="text-sm font-semibold text-primary-600">{localFilters.maxPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>
          </div>

          {/* Quantité minimale */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Quantité minimale disponible
            </label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Au moins {localFilters.minQuantity} unités</span>
              <span className="text-sm font-semibold text-success-600">{localFilters.minQuantity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={localFilters.minQuantity}
              onChange={(e) => setLocalFilters({ ...localFilters, minQuantity: Number(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-success-600"
            />
          </div>

          {/* Lots urgents uniquement */}
          <div>
            <label className="flex items-center gap-3 p-4 bg-accent-50 border-2 border-accent-200 rounded-xl cursor-pointer hover:border-accent-300 transition-all">
              <input
                type="checkbox"
                checked={localFilters.onlyUrgent}
                onChange={(e) => setLocalFilters({ ...localFilters, onlyUrgent: e.target.checked })}
                className="w-5 h-5 text-accent-600 rounded focus:ring-accent-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-600" />
                  <span className="text-sm font-semibold text-neutral-900">Lots urgents uniquement</span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">Afficher seulement les lots à récupérer rapidement</p>
              </div>
            </label>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Trier par
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'urgent' })}
                className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                  localFilters.sortBy === 'urgent'
                    ? 'bg-accent-600 text-white border-accent-600 shadow-md'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-accent-300'
                }`}
              >
                🔥 Urgence
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'price_asc' })}
                className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                  localFilters.sortBy === 'price_asc'
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                }`}
              >
                💰 Prix ↑
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'price_desc' })}
                className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                  localFilters.sortBy === 'price_desc'
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                }`}
              >
                💰 Prix ↓
              </button>
              <button
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'quantity_desc' })}
                className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                  localFilters.sortBy === 'quantity_desc'
                    ? 'bg-success-600 text-white border-success-600 shadow-md'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-success-300'
                }`}
              >
                📦 Quantité
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all font-medium"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            Appliquer ({activeFiltersCount})
          </button>
        </div>
      </div>
    </div>
  );
}

