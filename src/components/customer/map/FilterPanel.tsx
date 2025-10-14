import { X } from 'lucide-react';
import type { MapFilters } from './types';
import { CATEGORIES } from './constants';

interface FilterPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterPanel({ filters, onFiltersChange, onClose, isMobile = false }: FilterPanelProps) {
  const { selectedCategory, maxDistance, onlyUrgent } = filters;

  // Fonction pour gérer les changements de filtres (avec fermeture auto en mobile)
  const handleFilterChange = (newFilters: Partial<MapFilters>) => {
    onFiltersChange(newFilters);
    // Fermer automatiquement les filtres en mobile après sélection
    if (isMobile && onClose) {
      // Petit délai pour que l'utilisateur voie le changement
      setTimeout(() => onClose(), 150);
    }
  };

  const content = (
    <div className="p-4 space-y-6">
      {/* Catégorie */}
      <div>
        <label className="block text-sm font-semibold text-black mb-3 flex items-center gap-2">
          <span>🏷️</span>
          <span>Catégorie de produits</span>
        </label>
        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterChange({ selectedCategory: cat })}
                className={`p-3 text-xs rounded-xl border-2 transition font-medium ${
                  selectedCategory === cat
                    ? 'border-primary-600 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'border-gray-200 text-gray-700 hover:border-primary-300 bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange({ selectedCategory: e.target.value })}
            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none bg-white font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Distance max */}
      <div>
        <label className="block text-sm font-semibold text-black mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>📍</span>
            <span>Distance maximale</span>
          </span>
          <span className="text-primary-600 font-bold">{maxDistance} km</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={maxDistance}
          onChange={(e) => handleFilterChange({ maxDistance: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(maxDistance / 50) * 100}%, #e5e7eb ${(maxDistance / 50) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Lots urgents */}
      <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
        <input
          type="checkbox"
          checked={onlyUrgent}
          onChange={(e) => handleFilterChange({ onlyUrgent: e.target.checked })}
          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span>🔥</span>
          <span>Paniers urgents uniquement</span>
        </span>
      </label>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" onClick={onClose}>
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
            <h3 className="font-bold text-xl text-black flex items-center gap-2">
              <span>🔍</span>
              <span>Filtres de recherche</span>
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      {content}
    </div>
  );
}

