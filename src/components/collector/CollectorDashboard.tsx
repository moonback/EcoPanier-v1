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
    <div className="min-h-screen bg-neutral-50">
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">
                Espace Collecteur
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-600">
                <span className="inline-block w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                <span className="truncate">
                  <span className="font-medium text-success-600">{profile?.full_name}</span>
                </span>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all font-medium whitespace-nowrap flex-shrink-0"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-100 shadow-soft sticky top-[70px] sm:top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'available' | 'my-missions' | 'profile')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 font-semibold border-b-3 transition-all group whitespace-nowrap text-xs sm:text-base ${
                    activeTab === tab.id
                      ? 'border-success-600 text-success-600 bg-success-50/50'
                      : 'border-transparent text-neutral-600 hover:text-success-500 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={16} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'available' && <MissionsList />}
        {activeTab === 'my-missions' && <MyMissions />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
