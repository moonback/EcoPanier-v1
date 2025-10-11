import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AuthForm } from './components/auth/AuthForm';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { BeneficiaryDashboard } from './components/beneficiary/BeneficiaryDashboard';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PickupStation } from './components/pickup/PickupStation';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuration du profil</h1>
          <p className="text-gray-600 mb-4">
            Votre profil est en cours de création. Si ce message persiste, veuillez contacter l'administrateur.
          </p>
          <button
            onClick={() => useAuthStore.getState().signOut()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Rôle non reconnu</h1>
              <p className="text-gray-600">Veuillez contacter l'administrateur</p>
            </div>
          </div>
        );
    }
  };

  return <ErrorBoundary>{renderDashboard()}</ErrorBoundary>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique pour la station de retrait */}
        <Route path="/pickup" element={<PickupStation />} />
        
        {/* Route principale avec authentification */}
        <Route path="/" element={<DashboardRouter />} />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
