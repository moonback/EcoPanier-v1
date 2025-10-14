import { X, RotateCcw, Filter, Apple, Croissant, Beef, Fish, Milk, ShoppingBag, ChefHat, Package, Euro, Zap } from 'lucide-react';
import { categories, getCategoryLabel } from '../../../utils/helpers';
import type { AdvancedFilters } from './AdvancedFilterModal';

interface FilterSidebarProps {
  filters: AdvancedFilters;
  onApplyFilters: (filters: AdvancedFilters) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar de filtres pour parcourir les lots
 * Visible en permanence sur desktop, collapsible sur mobile
 */
export function FilterSidebar({
  filters,
  onApplyFilters,
  onReset,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const handleFilterChange = (newFilters: Partial<AdvancedFilters>) => {
    onApplyFilters({ ...filters, ...newFilters });
  };

  const activeFiltersCount = 
    (filters.category ? 1 : 0) +
    (filters.onlyUrgent ? 1 : 0) +
    (filters.minQuantity > 1 ? 1 : 0) +
    ((filters.minPrice > 0 || filters.maxPrice < 100) ? 1 : 0);

  // Mapping des catégories vers leurs icônes
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'fruits_legumes': Apple,
      'boulangerie': Croissant,
      'boucherie': Beef,
      'poissonnerie': Fish,
      'produits_laitiers': Milk,
      'epicerie': ShoppingBag,
      'plats_prepares': ChefHat,
      'autres': Package,
    };
    return iconMap[category] || Package;
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200/50
          transform transition-transform duration-300 ease-in-out
          z-50 lg:z-10
          flex flex-col shadow-xl lg:shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Filtres</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-500 font-medium">
                    {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Bouton Réinitialiser - icône en haut */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="p-2.5 hover:bg-red-50 rounded-xl transition-all group"
                  aria-label="Réinitialiser les filtres"
                  title="Réinitialiser les filtres"
                >
                  <RotateCcw className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                </button>
              )}
              {/* Bouton Fermer - mobile seulement */}
              <button
                onClick={onClose}
                className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Fermer les filtres"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Badge filtres actifs - plus visible */}
          {activeFiltersCount > 0 && (
            <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200/50 rounded-xl p-3">
              <p className="text-sm text-primary-700 font-semibold text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} appliqué{activeFiltersCount > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Catégorie */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Catégorie
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleFilterChange({ category: '' })}
                className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                  filters.category === ''
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${filters.category === '' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-primary-50'}`}>
                  <Package className={`w-4 h-4 ${filters.category === '' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`} />
                </div>
                <span className="font-semibold">Toutes les catégories</span>
              </button>
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange({ category: cat })}
                    className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                      filters.category === cat
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${filters.category === cat ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-primary-50'}`}>
                      <IconComponent className={`w-4 h-4 ${filters.category === cat ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`} />
                    </div>
                    <span className="font-semibold">{getCategoryLabel(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary-600" />
              Fourchette de prix
            </label>
            <div className="bg-white border border-gray-200 p-5 rounded-xl space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-semibold">Prix minimum</span>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">{filters.minPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-semibold">Prix maximum</span>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">{filters.maxPrice}€</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700"
                />
              </div>
            </div>
          </div>

          {/* Quantité minimale */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Quantité minimale
            </label>
            <div className="bg-white border border-gray-200 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 font-semibold">Au moins {filters.minQuantity} unités</span>
                <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">{filters.minQuantity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={filters.minQuantity}
                onChange={(e) => handleFilterChange({ minQuantity: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700"
              />
            </div>
          </div>

          {/* Lots urgents uniquement */}
          <div>
            <label className="flex items-center gap-4 p-5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl cursor-pointer hover:from-red-100 hover:to-orange-100 transition-all group">
              <input
                type="checkbox"
                checked={filters.onlyUrgent}
                onChange={(e) => handleFilterChange({ onlyUrgent: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-200 cursor-pointer"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
                  <Zap className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-red-700">Lots urgents</span>
                  <p className="text-xs text-red-600 mt-1 font-medium">À récupérer rapidement</p>
                </div>
              </div>
            </label>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              Trier par
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleFilterChange({ sortBy: 'urgent' })}
                className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                  filters.sortBy === 'urgent'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-red-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${filters.sortBy === 'urgent' ? 'bg-white/20' : 'bg-red-50 group-hover:bg-red-100'}`}>
                  <Zap className={`w-4 h-4 ${filters.sortBy === 'urgent' ? 'text-white' : 'text-red-600'}`} />
                </div>
                <span className="font-semibold">Urgence</span>
              </button>
              <button
                onClick={() => handleFilterChange({ sortBy: 'price_asc' })}
                className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                  filters.sortBy === 'price_asc'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${filters.sortBy === 'price_asc' ? 'bg-white/20' : 'bg-green-50 group-hover:bg-green-100'}`}>
                  <Euro className={`w-4 h-4 ${filters.sortBy === 'price_asc' ? 'text-white' : 'text-green-600'}`} />
                </div>
                <span className="font-semibold">Prix croissant</span>
              </button>
              <button
                onClick={() => handleFilterChange({ sortBy: 'price_desc' })}
                className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                  filters.sortBy === 'price_desc'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${filters.sortBy === 'price_desc' ? 'bg-white/20' : 'bg-green-50 group-hover:bg-green-100'}`}>
                  <Euro className={`w-4 h-4 ${filters.sortBy === 'price_desc' ? 'text-white' : 'text-green-600'}`} />
                </div>
                <span className="font-semibold">Prix décroissant</span>
              </button>
              <button
                onClick={() => handleFilterChange({ sortBy: 'quantity_desc' })}
                className={`p-4 rounded-xl font-medium transition-all text-left flex items-center gap-3 group ${
                  filters.sortBy === 'quantity_desc'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${filters.sortBy === 'quantity_desc' ? 'bg-white/20' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                  <Package className={`w-4 h-4 ${filters.sortBy === 'quantity_desc' ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <span className="font-semibold">Quantité disponible</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer - Informations */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50 p-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-gray-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600 font-medium">
                Filtres automatiques
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

