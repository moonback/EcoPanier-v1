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
        <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-white to-primary-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <Store className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-black">Commerçants proches</h2>
                <p className="text-xs text-gray-600">Cliquez sur un commerce</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-xl transition-all"
              title="Fermer la liste"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-white rounded-xl border-2 border-primary-100 shadow-sm">
              <div className="text-xl font-bold text-primary-600">{merchants.length}</div>
              <div className="text-[10px] text-gray-600 font-semibold">🏪 Commerces</div>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border-2 border-success-100 shadow-sm">
              <div className="text-xl font-bold text-success-600">{totalLots}</div>
              <div className="text-[10px] text-gray-600 font-semibold">🎁 Paniers</div>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border-2 border-warning-100 shadow-sm">
              <div className="text-xl font-bold text-warning-600">{urgentLots}</div>
              <div className="text-[10px] text-gray-600 font-semibold">🔥 Urgents</div>
            </div>
          </div>

          {/* Bouton filtres */}
          <button
            onClick={onToggleFilters}
            className={`mt-3 w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all border-2 font-semibold shadow-sm ${
              showFilters 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white border-primary-600 shadow-lg' 
                : 'bg-white text-black border-gray-200 hover:border-primary-300 hover:shadow-md'
            }`}
          >
            <Filter className="w-4 h-4" strokeWidth={2} />
            <span>Filtrer</span>
            {activeFiltersCount > 0 && (
              <span className={`text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold ${
                showFilters ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'
              }`}>
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
              <div className="inline-flex p-4 bg-primary-50 rounded-full mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
              </div>
              <p className="text-gray-600 font-medium text-sm">🔍 Recherche des paniers près de vous...</p>
            </div>
          ) : merchants.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
                <MapPin className="w-12 h-12 text-gray-300" strokeWidth={1} />
              </div>
              <h3 className="font-bold text-black mb-2 text-lg">Aucun panier trouvé 🔍</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed mb-4">
                Élargissez votre distance de recherche ou modifiez vos filtres pour trouver plus de paniers.
              </p>
              <button
                onClick={onToggleFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all text-sm"
              >
                Ajuster les filtres
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="mb-3 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  📍 Triés par distance • Cliquez 2× pour voir les paniers
                </p>
              </div>
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

