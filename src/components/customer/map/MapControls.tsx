import { ChevronLeft, Target } from 'lucide-react';
import type { UserLocation } from './types';

interface MapControlsProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  userLocation: UserLocation | null;
  onCenterUser: () => void;
}

export function MapControls({
  sidebarOpen,
  onToggleSidebar,
  userLocation,
  onCenterUser
}: MapControlsProps) {
  return (
    <>
      {/* Bouton toggle sidebar (quand fermée) */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="fixed top-24 right-4 z-20 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary-200"
          title="Afficher la liste des commerçants"
        >
          <ChevronLeft className="w-6 h-6 text-primary-600" />
        </button>
      )}

      {/* Bouton position utilisateur flotant */}
      {userLocation && !sidebarOpen && (
        <button
          onClick={onCenterUser}
          className="fixed bottom-24 right-4 z-20 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary-200"
          title="Centrer sur ma position"
        >
          <Target className="w-6 h-6 text-primary-600" />
        </button>
      )}
    </>
  );
}

