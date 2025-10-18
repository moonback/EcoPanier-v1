/**
 * Composant skeleton loader pour ReservationCard
 * Affiche un placeholder animé pendant le chargement des réservations
 */
export function SkeletonReservationCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-6 bg-gray-50">
        {/* En-tête avec titre et statut */}
        <div className="flex justify-between items-start mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>

        {/* Informations de la réservation */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Prix */}
        <div className="pt-4 border-t border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

