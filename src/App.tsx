import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { SettingsProvider } from './contexts/SettingsContext';
import { LandingPage } from './components/landing/LandingPage';
import { MerchantLanding } from './components/merchant/landing/MerchantLanding';
import { AssociationLanding } from './components/association/landing/AssociationLanding';
import { RestaurantLanding } from './components/restaurant/landing';
import { HowItWorks } from './components/pages/HowItWorks';
import { HelpCenter } from './components/pages/HelpCenter';
import { AuthForm } from './components/auth/AuthForm';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { BeneficiaryDashboard } from './components/beneficiary/BeneficiaryDashboard';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AssociationDashboard } from './components/association/AssociationDashboard';
import { PickupStation } from './components/pickup/PickupStation';
import { KioskMode } from './components/kiosk/KioskMode';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { useAutoCleanup } from './hooks/useAutoCleanup';

function DashboardRouter() {
  const { user, profile, loading, initialized, initialize, fetchProfile } = useAuthStore();

  // Nettoyer automatiquement les lots non récupérés toutes les heures
  useAutoCleanup({
    enabled: true,
    interval: 60 * 60 * 1000, // 1 heure
    onCleanup: (result) => {
      if (result.deletedLots > 0 || result.cancelledReservations > 0) {
        console.log(`🧹 Nettoyage automatique: ${result.deletedLots} lot(s) supprimé(s), ${result.cancelledReservations} réservation(s) annulée(s)`);
      }
    }
  });

  useEffect(() => {
    // Initialiser l'authentification au montage
    initialize();

    // Gérer la visibilité de la page pour rafraîchir la session
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          // Rafraîchir la session Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Recharger le profil pour s'assurer d'avoir les données à jour
            await fetchProfile();
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      case 'association':
        return <AssociationDashboard />;
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
        <ScrollToTop />
        <Routes>
          {/* Page d'accueil publique */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Pages landing par rôle */}
          <Route path="/commercants" element={<MerchantLanding />} />
          <Route path="/associations" element={<AssociationLanding />} />
          <Route path="/restaurateurs" element={<RestaurantLanding />} />
          
          {/* Pages informatives publiques */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Route publique pour la station de retrait */}
          <Route path="/pickup" element={<PickupStation />} />
          
          {/* Route publique pour le mode kiosque (foyers d'accueil) */}
          <Route path="/kiosk" element={<KioskMode />} />
          
          {/* Route pour le dashboard avec authentification */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          
          {/* Route de connexion explicite */}
          <Route path="/login" element={<DashboardRouter />} />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
