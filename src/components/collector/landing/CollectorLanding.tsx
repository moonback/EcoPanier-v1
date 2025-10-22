import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Header } from '../../shared/Header';
import { Footer } from '../../shared/Footer';
import { SEOHead } from '../../shared/SEOHead';
import { CollectorStickyCTA } from './CollectorStickyCTA';
import {
  CollectorHeroSection,
  CollectorWhySection,
  CollectorBenefitsSection,
  CollectorHowItWorksSection,
  CollectorFeaturesSection,
  CollectorTestimonialsSection,
  CollectorPricingSection,
  CollectorFAQSection,
  CollectorFinalCTASection
} from './sections';

export const CollectorLanding = () => {
  const navigate = useNavigate();
  const { user, profile, initialized } = useAuthStore();

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté en tant que collecteur
  useEffect(() => {
    if (initialized && user && profile?.role === 'collector') {
      navigate('/dashboard');
    }
  }, [initialized, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <SEOHead
        title="Collecteurs - Livraisons solidaires rémunérées | ÉcoPanier"
        description="Rejoignez notre réseau de collecteurs et transformez vos trajets en revenus complémentaires. Livrez des repas solidaires et participez à la lutte contre le gaspillage alimentaire."
        keywords="collecteur livraison, coursier solidaire, livraison rémunérée, anti-gaspillage alimentaire, emploi flexible, économie sociale et solidaire"
        url="https://ecopanier.fr/collecteurs"
      />
      <Header />
      
      {/* Sticky CTA flottant */}
      <CollectorStickyCTA />
      
      {/* Hero Section avec animations */}
      <CollectorHeroSection />
      
      {/* Section Pourquoi ÉcoPanier ? */}
      <CollectorWhySection />
      
      {/* Section Les bénéfices pour les collecteurs */}
      <CollectorBenefitsSection />
      
      {/* Section Comment ça marche ? */}
      <CollectorHowItWorksSection />
      
      {/* Section Fonctionnalités */}
      <CollectorFeaturesSection />
      
      {/* Section Témoignages */}
      <CollectorTestimonialsSection />
      
      {/* Section Tarifs */}
      <CollectorPricingSection />
      
      {/* Section FAQ */}
      <CollectorFAQSection />
      
      {/* Section CTA Final */}
      <CollectorFinalCTASection />
      
      <Footer />
    </div>
  );
};
