/**
 * Composant skeleton loader pour LotCard
 * Affiche un placeholder animé pendant le chargement des lots
 */
export function SkeletonLotCard() {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* En-tête avec image skeleton */}
      <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300">
        {/* Badges skeleton */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Barre de progression skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300"></div>
      </div>

      {/* Contenu skeleton */}
      <div className="p-3 space-y-3">
        {/* Titre et commerçant */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Infos supplémentaires */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Bouton d'action */}
        <div className="h-9 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

