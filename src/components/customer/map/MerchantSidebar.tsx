import { Store, ChevronRight, Filter, MapPin } from 'lucide-react';
import { MerchantCard } from './MerchantCard';
import { FilterPanel } from './FilterPanel';
import type { MerchantWithLots, MapFilters } from './types';

interface MerchantSidebarProps {
  merchants: MerchantWithLots[];
  selectedMerchant: MerchantWithLots | null;
  onMerchantClick: (merchant: MerchantWithLots) => void;
  loading: boolean;
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function MerchantSidebar({
  merchants,
  selectedMerchant,
  onMerchantClick,
  loading,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  onClose,
  isOpen
}: MerchantSidebarProps) {
  // Calculer les stats
  const totalLots = merchants.reduce((sum, m) => sum + m.lots.length, 0);
  const urgentLots = merchants.reduce(
    (sum, m) => sum + m.lots.filter(l => l.is_urgent).length,
    0
  );

  const activeFiltersCount = 
    (filters.selectedCategory !== 'Tous' ? 1 : 0) + 
    (filters.onlyUrgent ? 1 : 0);

  return (
    <div className={`absolute top-0 bottom-0 right-0 transition-all duration-300 ${
      isOpen ? 'w-full max-w-md lg:w-[420px]' : 'w-0'
    } z-10`}>
      <div className={`h-full bg-white shadow-xl border-l border-gray-200 transition-opacity duration-300 flex flex-col ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-black" strokeWidth={1.5} />
              <h2 className="font-bold text-lg text-black">Commerçants proches</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Fermer la liste"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
            </button>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-black">{merchants.length}</div>
              <div className="text-xs text-gray-600 font-light">Commerces</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-black">{totalLots}</div>
              <div className="text-xs text-gray-600 font-light">Invendus</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-black">{urgentLots}</div>
              <div className="text-xs text-gray-600 font-light">Urgents</div>
            </div>
          </div>

          {/* Bouton filtres */}
          <button
            onClick={onToggleFilters}
            className={`mt-3 w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition border font-medium ${
              showFilters ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" strokeWidth={1.5} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        )}

        {/* Liste des commerçants */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto" />
              <p className="text-gray-600 font-light mt-4 text-sm">Chargement...</p>
            </div>
          ) : merchants.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1} />
              <h3 className="font-bold text-black mb-2">Aucun résultat</h3>
              <p className="text-sm text-gray-600 font-light">Élargissez votre zone de recherche</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {merchants.map((merchant) => (
                <MerchantCard
                  key={merchant.id}
                  merchant={merchant}
                  isSelected={selectedMerchant?.id === merchant.id}
                  onClick={() => onMerchantClick(merchant)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

