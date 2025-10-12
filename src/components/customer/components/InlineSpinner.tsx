/**
 * Spinner inline pour les composants
 * Version compacte du LoadingSpinner pour les chargements dans les composants
 */
export function InlineSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

