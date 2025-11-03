import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Users, UserPlus, FileText, BarChart3, Building2, Download, Clock, TrendingUp } from 'lucide-react';
import { BeneficiaryRegistration } from './BeneficiaryRegistration';
import { RegisteredBeneficiaries } from './RegisteredBeneficiaries';
import { AssociationStats } from './AssociationStats';
import { AssociationInfo } from './AssociationInfo';
import { ExportData } from './ExportData';
import { BeneficiaryActivityHistory } from './BeneficiaryActivityHistory';
import { AdvancedStats } from './AdvancedStats';
import { AssociationHeader } from './AssociationHeader';

type TabType = 'stats' | 'register' | 'list' | 'info' | 'export' | 'activity' | 'advanced';

export function AssociationDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const { profile } = useAuthStore();

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
    <div className="min-h-screen bg-gray-50">
      {/* En-tête amélioré */}
      <AssociationHeader
        logo={<img src="/logo.png" alt="EcoPanier Logo" className="h-14 w-auto rounded-2xl shadow-lg" />}
        title={profile?.business_name || profile?.full_name || 'Association'}
        subtitle="Gérez vos bénéficiaires et leur accès à la solidarité"
        defaultIcon="🏛️"
        showStats={true}
      />

      {/* Contenu principal */}
      <main className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
        {activeTab === 'stats' && <AssociationStats />}
        {activeTab === 'advanced' && <AdvancedStats />}
        {activeTab === 'info' && <AssociationInfo />}
        {activeTab === 'register' && <BeneficiaryRegistration />}
        {activeTab === 'list' && <RegisteredBeneficiaries />}
        {activeTab === 'activity' && <BeneficiaryActivityHistory />}
        {activeTab === 'export' && <ExportData />}
      </main>

      {/* Barre de navigation fixe en bas */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="max-w-12xl mx-auto">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 px-2 sm:px-4 py-3 flex-1 transition-all ${
                    isActive
                      ? 'text-secondary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-b-full" />
                  )}
                  <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs transition-all ${
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
}

