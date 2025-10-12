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
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Espace Collecteur</h1>
            <p className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              Bienvenue, <span className="font-semibold text-primary-600">{profile?.full_name}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-5 py-2.5 text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all hover-lift font-medium"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-3 transition-all group ${
                    activeTab === tab.id
                      ? 'border-success-600 text-success-600 bg-success-50/50'
                      : 'border-transparent text-neutral-600 hover:text-success-500 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={20} className={`transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'available' && <MissionsList />}
        {activeTab === 'my-missions' && <MyMissions />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
