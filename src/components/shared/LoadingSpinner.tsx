export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen section-gradient">
      <div className="relative">
        {/* Cercle externe statique */}
        <div className="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
        {/* Cercle animé avec dégradé */}
        <div className="absolute top-0 left-0 w-20 h-20 border-4 rounded-full animate-spin border-t-primary-600 border-r-secondary-600 border-b-primary-300 border-l-transparent"></div>
        {/* Point central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-primary rounded-full animate-pulse"></div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-lg font-bold text-neutral-700 mb-2 animate-pulse-soft">Chargement...</p>
        <p className="text-sm text-neutral-500 font-medium">Veuillez patienter un instant</p>
      </div>
    </div>
  );
};
