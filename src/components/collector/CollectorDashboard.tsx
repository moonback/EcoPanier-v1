import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { MissionsList } from './MissionsList';
import { MyMissions } from './MyMissions';
import { CollectorStats } from './CollectorStats';
import { ProfilePage } from '../shared/ProfilePage';
import { Truck, History, LogOut, User, TrendingUp } from 'lucide-react';

export const CollectorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'my-missions' | 'stats' | 'profile'>('available');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'available', label: 'Missions Dispo', icon: Truck, emoji: '🚚' },
    { id: 'my-missions', label: 'Mes Missions', icon: History, emoji: '📦' },
    { id: 'stats', label: 'Mes Revenus', icon: TrendingUp, emoji: '💰' },
    { id: 'profile', label: 'Profil', icon: User, emoji: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-black">
                🚴 Bonjour {profile?.full_name?.split(' ')[0] || 'Collecteur'} !
              </h1>
              <p className="text-sm text-gray-600 font-light mt-0.5">
                Des missions solidaires vous attendent ! 💰
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
        {activeTab === 'stats' && <CollectorStats />}
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
                  onClick={() => setActiveTab(tab.id as 'available' | 'my-missions' | 'stats' | 'profile')}
                  className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-success-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-success-500 to-success-600 rounded-b-full" />
                  )}
                  <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={`text-[10px] transition-all ${
                      isActive ? 'font-bold' : 'font-light'
                    }`}
                  >
                    {tab.label}
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
