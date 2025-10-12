import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { SalesStats } from './SalesStats';
import { ProfilePage } from '../shared/ProfilePage';
import { Package, TrendingUp, LogOut, Scan, User } from 'lucide-react';

export const MerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState<'lots' | 'stats' | 'profile'>('lots');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'lots', label: 'Mes Lots', icon: Package },
    { id: 'stats', label: 'Statistiques', icon: TrendingUp },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-12xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Espace Commerçant</h1>
            <p className="text-sm text-neutral-600 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-primary-600">{profile?.business_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/pickup"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary rounded-xl flex items-center gap-2"
            >
              <Scan size={20} />
              <span>Station de retrait</span>
            </a>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-5 py-2.5 text-neutral-600 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all hover-lift font-medium"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-neutral-100 shadow-soft">
        <div className="max-w-12xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'lots' | 'stats' | 'profile')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-3 transition-all group ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                      : 'border-transparent text-neutral-600 hover:text-primary-500 hover:bg-neutral-50'
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

      <main className="max-w-12xl mx-auto px-4 py-8">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'stats' && <SalesStats />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
