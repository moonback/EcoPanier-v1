import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LotManagement } from './LotManagement';
import { SalesStats } from './SalesStats';
import { Package, TrendingUp, LogOut } from 'lucide-react';

export const MerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState<'lots' | 'stats'>('lots');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'lots', label: 'Mes Lots', icon: Package },
    { id: 'stats', label: 'Statistiques', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Espace Commerçant</h1>
            <p className="text-sm text-gray-600">{profile?.business_name}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'lots' && <LotManagement />}
        {activeTab === 'stats' && <SalesStats />}
      </main>
    </div>
  );
};
