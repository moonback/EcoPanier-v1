import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { SettingsProvider } from './contexts/SettingsContext';
import { LandingPage } from './components/landing/LandingPage';
import { HowItWorks } from './components/pages/HowItWorks';
import { HelpCenter } from './components/pages/HelpCenter';
import { AuthForm } from './components/auth/AuthForm';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { BeneficiaryDashboard } from './components/beneficiary/BeneficiaryDashboard';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PickupStation } from './components/pickup/PickupStation';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt';
import { OnlineStatus } from './components/shared/OnlineStatus';

function DashboardRouter() {
  const { user, profile, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  // If user is authenticated but profile doesn't exist yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center section-gradient">
        <div className="max-w-md w-full card p-8 text-center animate-fade-in-up">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Configuration du profil</h1>
          <p className="text-neutral-600 mb-6 font-medium">
            Votre profil est en cours de création. Si ce message persiste, veuillez contacter l'administrateur.
          </p>
          <button
            onClick={() => useAuthStore.getState().signOut()}
            className="btn-primary rounded-xl"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'merchant':
        return <MerchantDashboard />;
      case 'beneficiary':
        return <BeneficiaryDashboard />;
      case 'collector':
        return <CollectorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center section-gradient">
            <div className="card p-8 text-center animate-fade-in-up">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Rôle non reconnu</h1>
              <p className="text-neutral-600 font-medium">Veuillez contacter l'administrateur</p>
            </div>
          </div>
        );
    }
  };

  return <ErrorBoundary>{renderDashboard()}</ErrorBoundary>;
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          {/* Page d'accueil publique */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Pages informatives publiques */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Route publique pour la station de retrait */}
          <Route path="/pickup" element={<PickupStation />} />
          
          {/* Route pour le dashboard avec authentification */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          
          {/* Route de connexion explicite */}
          <Route path="/login" element={<DashboardRouter />} />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Prompt d'installation et de mise à jour PWA */}
        <PWAInstallPrompt />
        
        {/* Indicateur d'état de connexion */}
        <OnlineStatus />
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
