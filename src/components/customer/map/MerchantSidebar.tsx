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
      <div className={`h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-neutral-200 transition-opacity duration-300 flex flex-col ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Header sidebar */}
        <div className="p-4 border-b border-neutral-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-lg text-neutral-900">Commerçants proches</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Fermer la liste"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-primary-50 rounded-lg">
              <div className="text-lg font-bold text-primary-600">{merchants.length}</div>
              <div className="text-xs text-neutral-600">Commerces</div>
            </div>
            <div className="text-center p-2 bg-success-50 rounded-lg">
              <div className="text-lg font-bold text-success-600">{totalLots}</div>
              <div className="text-xs text-neutral-600">Invendus</div>
            </div>
            <div className="text-center p-2 bg-accent-50 rounded-lg">
              <div className="text-lg font-bold text-accent-600">{urgentLots}</div>
              <div className="text-xs text-neutral-600">Urgents</div>
            </div>
          </div>

          {/* Bouton filtres */}
          <button
            onClick={onToggleFilters}
            className={`mt-3 w-full btn-secondary rounded-lg flex items-center justify-center gap-2 transition-all ${
              showFilters ? 'bg-primary-100 border-primary-300' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="text-neutral-600 mt-4 text-sm">Chargement...</p>
            </div>
          ) : merchants.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="font-semibold text-neutral-900 mb-2">Aucun résultat</h3>
              <p className="text-sm text-neutral-600">Élargissez votre zone de recherche</p>
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

