import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Header } from '../../shared/Header';
import { Footer } from '../../shared/Footer';
import { SEOHead } from '../../shared/SEOHead';
import { RestaurantStickyCTA } from './RestaurantStickyCTA';
import {
  RestaurantHeroSection,
  RestaurantProblemSection,
  RestaurantSolutionSection,
  RestaurantHowItWorksSection,
  RestaurantUseCasesSection,
  RestaurantBenefitsSection,
  RestaurantTestimonialsSection,
  RestaurantFinalCTASection
} from './sections';

export const RestaurantLanding = () => {
  const navigate = useNavigate();
  const { user, profile, initialized } = useAuthStore();

  // Rediriger vers le dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (initialized && user && profile) {
      navigate('/dashboard');
    }
  }, [initialized, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEOHead
        title="EcoPanier Restaurateurs - Transformez vos invendus en impact solidaire"
        description="Restaurateurs, traiteurs : valorisez vos restes de repas, buffets, mariages. EcoPanier s'occupe de tout pour distribuer vos invendus aux bénéficiaires. Zéro gaspillage, impact positif."
        keywords="restaurateur anti-gaspillage, traiteur solidaire, reste mariage, buffet invendu, gaspillage restaurant, cuisine solidaire, don alimentaire restaurant"
        url="https://ecopanier.fr/restaurateurs"
      />
      <Header />
      
      {/* Sticky CTA flottant */}
      <RestaurantStickyCTA />
      
      {/* 1. Hero Section - Accroche restaurateurs */}
      <RestaurantHeroSection />
      
      {/* 2. Le problème du gaspillage en restauration */}
      <RestaurantProblemSection />
      
      {/* 3. La solution EcoPanier */}
      <RestaurantSolutionSection />
      
      {/* 4. Comment ça marche */}
      <RestaurantHowItWorksSection />
      
      {/* 5. Cas d'usage concrets */}
      <RestaurantUseCasesSection />
      
      {/* 6. Bénéfices pour les restaurateurs */}
      <RestaurantBenefitsSection />
      
      {/* 7. Témoignages de restaurateurs */}
      <RestaurantTestimonialsSection />
      
      {/* 8. CTA Final */}
      <RestaurantFinalCTASection />
      
      <Footer />
    </div>
  );
};

