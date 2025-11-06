import { X, RotateCcw, Filter, Calendar, Package, Heart, Euro, ArrowUpDown, Sparkles } from 'lucide-react';

export type ReservationStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ReservationType = 'all' | 'purchases' | 'donations';
export type SortBy = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';
export type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface ReservationFilters {
  status: ReservationStatus;
  type: ReservationType;
  sortBy: SortBy;
  dateFilter: DateFilter;
}

interface ReservationFilterSidebarProps {
  filters: ReservationFilters;
  onApplyFilters: (filters: ReservationFilters) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_FILTERS: ReservationFilters = {
  status: 'all',
  type: 'all',
  sortBy: 'date_desc',
  dateFilter: 'all',
};

/**
 * Sidebar de filtres pour les réservations client
 * Permet de filtrer par statut, type, date et trier
 */
export function ReservationFilterSidebar({
  filters,
  onApplyFilters,
  onReset,
  isOpen,
  onClose,
}: ReservationFilterSidebarProps) {
  const handleFilterChange = (newFilters: Partial<ReservationFilters>) => {
    onApplyFilters({ ...filters, ...newFilters });
  };

  const activeFiltersCount = 
    (filters.status !== 'all' ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.dateFilter !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'date_desc' ? 1 : 0);

  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);

  return (
    <>
      {/* Overlay mobile avec animation */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-[60] lg:hidden backdrop-blur-sm animate-fade-in"
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
          z-[70] lg:z-10
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
              {/* Bouton Réinitialiser */}
              {!isDefault && (
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
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600" />
              Statut
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Toutes' },
                { value: 'pending', label: 'En attente' },
                { value: 'confirmed', label: 'Confirmées' },
                { value: 'completed', label: 'Récupérées' },
                { value: 'cancelled', label: 'Annulées' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    filters.status === option.value
                      ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={filters.status === option.value}
                    onChange={() => handleFilterChange({ status: option.value as ReservationStatus })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-200 cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${
                    filters.status === option.value ? 'text-primary-900' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Tous', icon: Package },
                { value: 'purchases', label: 'Achats uniquement', icon: Euro },
                { value: 'donations', label: 'Dons uniquement', icon: Heart },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      filters.type === option.value
                        ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={() => handleFilterChange({ type: option.value as ReservationType })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-200 cursor-pointer"
                    />
                    <Icon className={`w-4 h-4 ${
                      filters.type === option.value ? 'text-primary-600' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      filters.type === option.value ? 'text-primary-900' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              Période
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Toutes les dates' },
                { value: 'today', label: "Aujourd'hui" },
                { value: 'week', label: 'Cette semaine' },
                { value: 'month', label: 'Ce mois' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    filters.dateFilter === option.value
                      ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="dateFilter"
                    value={option.value}
                    checked={filters.dateFilter === option.value}
                    onChange={() => handleFilterChange({ dateFilter: option.value as DateFilter })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-200 cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${
                    filters.dateFilter === option.value ? 'text-primary-900' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-primary-600" />
              Trier par
            </label>
            <div className="space-y-2">
              {[
                { value: 'date_desc', label: 'Date (récentes)' },
                { value: 'date_asc', label: 'Date (anciennes)' },
                { value: 'price_desc', label: 'Prix (décroissant)' },
                { value: 'price_asc', label: 'Prix (croissant)' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    filters.sortBy === option.value
                      ? 'bg-primary-50 border-2 border-primary-300 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={() => handleFilterChange({ sortBy: option.value as SortBy })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-200 cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${
                    filters.sortBy === option.value ? 'text-primary-900' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export { DEFAULT_FILTERS };

