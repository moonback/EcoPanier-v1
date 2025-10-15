import { useState } from 'react';
import { Plus, List } from 'lucide-react';
import { MissionCreation } from './MissionCreation';
import { MerchantMissionsList } from './MerchantMissionsList';

export const MissionsManagement = () => {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');

  return (
    <div className="space-y-6">
      {/* Toggle entre Liste et Création */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveView('list')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeView === 'list'
              ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-secondary-300'
          }`}
        >
          <List size={18} />
          <span>Mes Missions</span>
        </button>
        <button
          onClick={() => setActiveView('create')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeView === 'create'
              ? 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-success-300'
          }`}
        >
          <Plus size={18} />
          <span>Nouvelle Mission</span>
        </button>
      </div>

      {/* Contenu */}
      {activeView === 'list' ? <MerchantMissionsList /> : <MissionCreation />}
    </div>
  );
};

