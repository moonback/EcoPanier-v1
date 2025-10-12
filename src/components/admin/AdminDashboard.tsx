import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AdminStats } from './AdminStats';
import { UserManagement } from './UserManagement';
import { ProfilePage } from '../shared/ProfilePage';
import { BarChart3, Users, LogOut, User, Shield } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'profile'>('stats');
  const { profile, signOut } = useAuthStore();

  const tabs = [
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'users', label: 'Gestion des utilisateurs', icon: Users },
    { id: 'profile', label: 'Mon profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="glass sticky top-0 z-40 shadow-soft-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-soft-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Panneau Administrateur</h1>
                <p className="text-sm text-neutral-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-accent-600">{profile?.full_name}</span>
                </p>
              </div>
            </div>
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
                      ? 'border-accent-600 text-accent-600 bg-accent-50/50'
                      : 'border-transparent text-neutral-600 hover:text-accent-500 hover:bg-neutral-50'
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
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
};
