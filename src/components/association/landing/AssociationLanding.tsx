import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Header } from '../../shared/Header';
import { Footer } from '../../shared/Footer';
import { SEOHead } from '../../shared/SEOHead';
import { AssociationStickyCTA } from './AssociationStickyCTA';
import {
  AssociationHeroSection,
  AssociationWhySection,
  AssociationBenefitsSection,
  AssociationHowItWorksSection,
  AssociationFeaturesSection,
  AssociationTestimonialsSection,
  AssociationFAQSection,
  AssociationFinalCTASection
} from './sections';

export const AssociationLanding = () => {
  const navigate = useNavigate();
  const { user, profile, initialized } = useAuthStore();

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté en tant qu'association
  useEffect(() => {
    if (initialized && user && profile?.role === 'association') {
      navigate('/dashboard');
    }
  }, [initialized, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-neutral-100">
      <SEOHead
        title="Associations - Gestion de l'aide alimentaire | ÉcoPanier"
        description="Facilitez l'accès à l'aide alimentaire pour vos bénéficiaires. Plateforme complète de gestion, suivi et export de données pour les associations solidaires."
        keywords="aide alimentaire, association solidaire, gestion bénéficiaires, solidarité locale, précarité alimentaire, banque alimentaire"
        url="https://ecopanier.fr/associations"
      />
      <Header />
      
      {/* Sticky CTA flottant */}
      <AssociationStickyCTA />
      
      {/* Hero Section avec animations */}
      <AssociationHeroSection />
      
      {/* Section Pourquoi ÉcoPanier ? */}
      <AssociationWhySection />
      
      {/* Section Les bénéfices pour votre association */}
      <AssociationBenefitsSection />
      
      {/* Section Comment ça marche ? */}
      <AssociationHowItWorksSection />
      
      {/* Section Fonctionnalités */}
      <AssociationFeaturesSection />
      
      {/* Section Témoignages */}
      <AssociationTestimonialsSection />
      
      {/* Section FAQ */}
      <AssociationFAQSection />
      
      {/* Section CTA Final */}
      <AssociationFinalCTASection />
      
      <Footer />
    </div>
  );
};

