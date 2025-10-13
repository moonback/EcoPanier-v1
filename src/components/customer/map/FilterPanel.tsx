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
    <div className="p-4 space-y-4">
      {/* Catégorie */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Catégorie
        </label>
        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterChange({ selectedCategory: cat })}
                className={`p-2 text-xs rounded-lg border transition ${
                  selectedCategory === cat
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Distance max */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Distance max: <span className="font-bold">{maxDistance} km</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={maxDistance}
          onChange={(e) => handleFilterChange({ maxDistance: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Lots urgents */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyUrgent}
          onChange={(e) => handleFilterChange({ onlyUrgent: e.target.checked })}
          className="w-4 h-4 text-black rounded focus:ring-black"
        />
        <span className="text-sm font-light text-gray-700">Lots urgents uniquement</span>
      </label>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose}>
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg text-black">Filtres</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" strokeWidth={1.5} />
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

