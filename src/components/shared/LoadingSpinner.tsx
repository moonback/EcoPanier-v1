export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-black">Chargement...</p>
        <p className="text-sm text-gray-600 font-light mt-1">Veuillez patienter</p>
      </div>
    </div>
  );
};
