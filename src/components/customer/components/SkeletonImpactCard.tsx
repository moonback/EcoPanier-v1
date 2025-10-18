/**
 * Composant skeleton loader pour ImpactCard
 * Affiche un placeholder animé pendant le chargement des statistiques d'impact
 */
export function SkeletonImpactCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

