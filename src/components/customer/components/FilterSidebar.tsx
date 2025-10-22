import { X, RotateCcw, Filter, Package, Euro, Zap, ArrowUpDown, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
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


  return (
    <>
      {/* Overlay mobile avec animation */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          w-80 bg-gradient-to-br from-white via-gray-50/50 to-white
          border-r border-gray-200/80 shadow-2xl
          transform transition-all duration-500 ease-out
          z-50 lg:z-10
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header avec effet glassmorphism */}
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Filter className="w-5 h-5 text-white" />
                {/* Effet brillant */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Filtres</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-primary-600 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Bouton Réinitialiser - amélioré */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 group hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  aria-label="Réinitialiser les filtres"
                  title="Réinitialiser les filtres"
                >
                  <RotateCcw className="w-4 h-4 text-red-500 group-hover:text-red-600 group-hover:rotate-180 transition-all duration-500" />
                </button>
              )}
              {/* Bouton Fermer - mobile seulement */}
              <button
                onClick={onClose}
                className="lg:hidden p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Fermer les filtres"
              >
                <X className="w-4 h-4 text-gray-600 hover:text-gray-800 transition-colors" />
              </button>
            </div>
          </div>
          
          {/* Badge filtres actifs - design moderne */}
          {activeFiltersCount > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-50 via-secondary-50 to-primary-50 border-2 border-primary-200/60 rounded-2xl p-3 shadow-sm animate-fade-in-up">
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
              <p className="relative text-xs text-primary-700 font-bold text-center flex items-center justify-center gap-2">
                <span className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
                  <span className="relative w-2 h-2 bg-primary-600 rounded-full"></span>
                </span>
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} appliqué{activeFiltersCount > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Contenu scrollable avec scroll personnalisé */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100">
          {/* Catégorie */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 px-2">
              <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Catégorie</span>
            </label>
            <div className="space-y-2.5">
              {/* Toutes les catégories */}
              <button
                onClick={() => handleFilterChange({ category: '' })}
                aria-pressed={filters.category === ''}
                className={`group relative w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-primary-400 overflow-hidden
                  ${
                    filters.category === ''
                      ? 'bg-primary-600 text-white shadow-md border-primary-600 hover:bg-primary-700 hover:shadow-lg scale-[1.02]'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-200 hover:shadow-md hover:scale-[1.01]'
                  }
                `}
              >
                {/* Effet de brillance */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${filters.category === '' ? 'opacity-100' : 'opacity-0'}`}></div>
                <span className="relative font-bold text-sm">{filters.category === '' ? '✨ ' : ''}Toutes les catégories</span>
                <Package className={`relative w-4 h-4 transition-all duration-300 ${
                  filters.category === '' ? 'text-white rotate-12' : 'text-primary-600 group-hover:rotate-6'
                }`} />
              </button>
              
              {/* Liste des catégories */}
              {categories.map((cat) => {
                const selected = filters.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange({ category: cat })}
                    aria-pressed={selected}
                    className={`group relative w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-primary-400 overflow-hidden
                      ${
                        selected
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-200/50 border-primary-600 hover:shadow-2xl hover:shadow-primary-300/50 scale-[1.02]'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-primary-200 hover:shadow-md hover:scale-[1.01]'
                      }
                    `}
                  >
                    {/* Effet de brillance */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${selected ? 'opacity-100' : 'opacity-0'}`}></div>
                    <span className="relative font-bold text-sm">{selected ? '✨ ' : ''}{getCategoryLabel(cat)}</span>
                    <Package className={`relative w-4 h-4 transition-all duration-300 ${
                      selected ? 'text-white rotate-12' : 'text-primary-600 group-hover:rotate-6'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200"></div>

          {/* Prix */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 px-2">
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                <Euro className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Fourchette de prix</span>
            </label>
            <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white border-2 border-gray-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5">
              {/* Effet de bordure brillante au survol */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Curseur double pour fourchette */}
              <div className="relative flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-bold">Prix minimum</span>
                  <span className="text-sm font-extrabold text-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1.5 rounded-xl shadow-sm">
                    {filters.minPrice}€
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={filters.maxPrice}
                  step="1"
                  value={filters.minPrice}
                  aria-label="Prix minimum"
                  onChange={(e) =>
                    handleFilterChange({
                      minPrice: Math.min(Number(e.target.value), filters.maxPrice),
                    })
                  }
                  className="w-full h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 transition-all shadow-inner"
                />
              </div>
              <div className="relative flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-bold">Prix maximum</span>
                  <span className="text-sm font-extrabold text-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1.5 rounded-xl shadow-sm">
                    {filters.maxPrice}€
                  </span>
                </div>
                <input
                  type="range"
                  min={filters.minPrice}
                  max="100"
                  step="1"
                  value={filters.maxPrice}
                  aria-label="Prix maximum"
                  onChange={(e) =>
                    handleFilterChange({
                      maxPrice: Math.max(Number(e.target.value), filters.minPrice),
                    })
                  }
                  className="w-full h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 transition-all shadow-inner"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={() => handleFilterChange({ minPrice: 0, maxPrice: 100 })}
                  className="px-3 py-1.5 text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
                  disabled={filters.minPrice === 0 && filters.maxPrice === 100}
                  aria-label="Réinitialiser la fourchette de prix"
                >
                  Réinitialiser
                </button>
                <span className="text-[10px] text-gray-600 font-semibold bg-gray-100 px-2.5 py-1.5 rounded-lg">
                  {filters.minPrice}€ - {filters.maxPrice}€
                </span>
              </div>
            </div>
          </div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200"></div>

          {/* Quantité minimale */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 px-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Quantité minimale</span>
            </label>
            <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white border-2 border-gray-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-700 font-bold">Au moins {filters.minQuantity} unité{filters.minQuantity > 1 ? 's' : ''}</span>
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-primary-600" />
                  <span className="text-sm font-extrabold text-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 px-3 py-1.5 rounded-xl shadow-sm">
                    {filters.minQuantity}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={filters.minQuantity}
                onChange={(e) => handleFilterChange({ minQuantity: Number(e.target.value) })}
                className="w-full h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 transition-all shadow-inner"
              />
              {/* Indicateurs visuels */}
              <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-medium">
                <span>1</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200"></div>

          {/* Lots urgents uniquement */}
          <div>
            <label className="group relative flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-2 border-red-200/60 rounded-2xl cursor-pointer hover:from-red-100 hover:via-orange-100 hover:to-red-100 transition-all duration-300 hover:shadow-lg hover:shadow-red-100 hover:scale-[1.02] overflow-hidden">
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <input
                type="checkbox"
                checked={filters.onlyUrgent}
                onChange={(e) => handleFilterChange({ onlyUrgent: e.target.checked })}
                className="relative w-4 h-4 text-red-600 bg-white border-2 border-red-300 rounded-md focus:ring-2 focus:ring-red-200 cursor-pointer transition-all"
              />
              <div className="relative flex items-center gap-2.5 flex-1">
                <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 rounded-xl transition-all shadow-sm">
                  <Zap className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-extrabold text-red-700 flex items-center gap-1.5">
                    Lots urgents uniquement
                    {filters.onlyUrgent && <span className="text-xs">✨</span>}
                  </span>
                  <p className="text-[10px] text-red-600 mt-0.5 font-semibold">⚡ À récupérer rapidement</p>
                </div>
              </div>
            </label>
          </div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200"></div>

          {/* Tri */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 px-2">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                <ArrowUpDown className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Trier par</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {/* Urgence */}
              <div className="relative group/tooltip">
                <button
                  onClick={() => handleFilterChange({ sortBy: 'urgent' })}
                  aria-pressed={filters.sortBy === 'urgent'}
                  className={`relative w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-red-400 overflow-hidden
                    ${
                      filters.sortBy === 'urgent'
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-200/50 border-red-600 hover:shadow-2xl scale-110'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:border-red-200 hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {/* Effet de brillance */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/tooltip:translate-x-full transition-transform duration-700 ${filters.sortBy === 'urgent' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <Zap className={`relative w-5 h-5 transition-all duration-300 ${
                    filters.sortBy === 'urgent' ? 'text-white animate-pulse' : 'text-red-600 group-hover/tooltip:text-red-700'
                  }`} />
                </button>
                {/* Tooltip amélioré */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-90 group-hover/tooltip:scale-100">
                  <div className="bg-gray-900/95 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl border border-white/10">
                    ⚡ Urgence
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix croissant */}
              <div className="relative group/tooltip">
                <button
                  onClick={() => handleFilterChange({ sortBy: 'price_asc' })}
                  aria-pressed={filters.sortBy === 'price_asc'}
                  className={`relative w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-green-400 overflow-hidden
                    ${
                      filters.sortBy === 'price_asc'
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl shadow-green-200/50 border-green-600 hover:shadow-2xl scale-110'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:border-green-200 hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {/* Effet de brillance */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/tooltip:translate-x-full transition-transform duration-700 ${filters.sortBy === 'price_asc' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <TrendingUp className={`relative w-5 h-5 transition-all duration-300 ${
                    filters.sortBy === 'price_asc' ? 'text-white' : 'text-green-600 group-hover/tooltip:text-green-700'
                  }`} />
                </button>
                {/* Tooltip amélioré */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-90 group-hover/tooltip:scale-100">
                  <div className="bg-gray-900/95 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl border border-white/10">
                    💰 Prix ↗
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix décroissant */}
              <div className="relative group/tooltip">
                <button
                  onClick={() => handleFilterChange({ sortBy: 'price_desc' })}
                  aria-pressed={filters.sortBy === 'price_desc'}
                  className={`relative w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-blue-400 overflow-hidden
                    ${
                      filters.sortBy === 'price_desc'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-200/50 border-blue-600 hover:shadow-2xl scale-110'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {/* Effet de brillance */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/tooltip:translate-x-full transition-transform duration-700 ${filters.sortBy === 'price_desc' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <TrendingDown className={`relative w-5 h-5 transition-all duration-300 ${
                    filters.sortBy === 'price_desc' ? 'text-white' : 'text-blue-600 group-hover/tooltip:text-blue-700'
                  }`} />
                </button>
                {/* Tooltip amélioré */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-90 group-hover/tooltip:scale-100">
                  <div className="bg-gray-900/95 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl border border-white/10">
                    💰 Prix ↘
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantité */}
              <div className="relative group/tooltip">
                <button
                  onClick={() => handleFilterChange({ sortBy: 'quantity_desc' })}
                  aria-pressed={filters.sortBy === 'quantity_desc'}
                  className={`relative w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 focus:outline-none ring-2 ring-transparent focus:ring-purple-400 overflow-hidden
                    ${
                      filters.sortBy === 'quantity_desc'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-200/50 border-purple-600 hover:shadow-2xl scale-110'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:border-purple-200 hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {/* Effet de brillance */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/tooltip:translate-x-full transition-transform duration-700 ${filters.sortBy === 'quantity_desc' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <Package className={`relative w-5 h-5 transition-all duration-300 ${
                    filters.sortBy === 'quantity_desc' ? 'text-white' : 'text-purple-600 group-hover/tooltip:text-purple-700'
                  }`} />
                </button>
                {/* Tooltip amélioré */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none z-20 scale-90 group-hover/tooltip:scale-100">
                  <div className="bg-gray-900/95 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl border border-white/10">
                    📦 Quantité
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Informations moderne */}
        <div className="flex-shrink-0 bg-gradient-to-r from-primary-50/30 via-white to-secondary-50/30 border-t border-gray-200/80 p-3 shadow-inner">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-primary-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
                <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <p className="text-xs text-gray-700 font-bold">
                  Filtres automatiques
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

