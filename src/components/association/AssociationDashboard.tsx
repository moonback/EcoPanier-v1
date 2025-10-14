import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Users, UserPlus, FileText, LogOut, BarChart3, Building2, Download, Clock, TrendingUp } from 'lucide-react';
import { BeneficiaryRegistration } from './BeneficiaryRegistration';
import { RegisteredBeneficiaries } from './RegisteredBeneficiaries';
import { AssociationStats } from './AssociationStats';
import { AssociationInfo } from './AssociationInfo';
import { ExportData } from './ExportData';
import { BeneficiaryActivityHistory } from './BeneficiaryActivityHistory';
import { AdvancedStats } from './AdvancedStats';

type TabType = 'stats' | 'register' | 'list' | 'info' | 'export' | 'activity' | 'advanced';

export function AssociationDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const tabs = [
    { id: 'stats' as TabType, label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'advanced' as TabType, label: 'Statistiques avancées', icon: TrendingUp },
    { id: 'info' as TabType, label: 'Informations', icon: Building2 },
    { id: 'register' as TabType, label: 'Enregistrer', icon: UserPlus },
    { id: 'list' as TabType, label: 'Bénéficiaires', icon: Users },
    { id: 'activity' as TabType, label: 'Activité', icon: Clock },
    { id: 'export' as TabType, label: 'Export', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="EcoPanier" 
                  className="h-10 w-10 rounded-lg object-contain"
                  draggable={false}
                />
                <span className="text-xl font-bold text-neutral-900">EcoPanier</span>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Espace Association</p>
                  <p className="text-xs text-neutral-600">{profile?.business_name || profile?.full_name}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stats' && <AssociationStats />}
        {activeTab === 'advanced' && <AdvancedStats />}
        {activeTab === 'info' && <AssociationInfo />}
        {activeTab === 'register' && <BeneficiaryRegistration />}
        {activeTab === 'list' && <RegisteredBeneficiaries />}
        {activeTab === 'activity' && <BeneficiaryActivityHistory />}
        {activeTab === 'export' && <ExportData />}
      </main>
    </div>
  );
}

