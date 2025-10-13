import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { MissionsList } from './MissionsList';
import { MyMissions } from './MyMissions';
import { ProfilePage } from '../shared/ProfilePage';
import { Truck, History, LogOut, User } from 'lucide-react';

export const CollectorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'my-missions' | 'profile'>('available');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'available', label: 'Missions Disponibles', icon: Truck },
    { id: 'my-missions', label: 'Mes Missions', icon: History },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black">
                Espace Collecteur
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                {profile?.full_name}
              </p>
            </div>
            
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
            >
              <LogOut size={18} className="inline mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'available' && <MissionsList />}
        {activeTab === 'my-missions' && <MyMissions />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'available' | 'my-missions' | 'profile')}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span
                    className={`text-[10px] transition-all ${
                      isActive ? 'font-semibold' : 'font-light'
                    }`}
                  >
                    {tab.label.replace('Mes ', '').replace('Mon ', '').replace('Missions ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
