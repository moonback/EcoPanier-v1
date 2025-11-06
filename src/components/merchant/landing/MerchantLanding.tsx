import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Header } from '../../shared/Header';
import { Footer } from '../../shared/Footer';
import { SEOHead } from '../../shared/SEOHead';
import { MerchantStickyCTA } from '../../merchant/landing/MerchantStickyCTA';
import {
  MerchantHeroSection,
  MerchantWhySection,
  MerchantBenefitsSection,
  MerchantHowItWorksSection,
  MerchantFeaturesSection,
  MerchantAdvancedFeaturesSection,
  MerchantTestimonialsSection,
  MerchantPricingSection,
  MerchantWalletSection,
  MerchantFAQSection,
  MerchantFinalCTASection
} from './sections';

export const MerchantLanding = () => {
  const navigate = useNavigate();
  const { user, profile, initialized } = useAuthStore();

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté en tant que commerçant
  useEffect(() => {
    if (initialized && user && profile?.role === 'merchant') {
      navigate('/dashboard');
    }
  }, [initialized, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEOHead
        title="Commerçants - Valorisez vos invendus | ÉcoPanier"
        description="Transformez vos invendus en revenus. Rejoignez ÉcoPanier et valorisez vos produits tout en participant à la lutte contre le gaspillage alimentaire et la solidarité locale."
        keywords="commerçants anti-gaspillage, valorisation invendus, commerce local, gestion invendus, économie circulaire, boulangerie, primeur, restauration"
        url="https://ecopanier.fr/commercants"
      />
      <Header />
      
      {/* Sticky CTA flottant */}
      <MerchantStickyCTA />
      
      {/* Hero Section avec animations */}
      <MerchantHeroSection />
      
      {/* Section Pourquoi ÉcoPanier ? */}
      <MerchantWhySection />
      
      {/* Section Les bénéfices pour votre commerce */}
      <MerchantBenefitsSection />
      
      {/* Section Comment ça marche ? */}
      <MerchantHowItWorksSection />
      
      {/* Section Fonctionnalités */}
      <MerchantFeaturesSection />
      
      {/* Section Fonctionnalités Avancées */}
      <MerchantAdvancedFeaturesSection />
      
      {/* Section Témoignages */}
      <MerchantTestimonialsSection />
      
      {/* Section Tarifs (gratuit) */}
      <MerchantPricingSection />
      
      {/* Section Portefeuille commerçant */}
      <MerchantWalletSection />
      
      {/* Section FAQ */}
      <MerchantFAQSection />
      
      {/* Section CTA Final */}
      <MerchantFinalCTASection />
      
      <Footer />
    </div>
  );
};

