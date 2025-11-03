import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { StickyCTA } from './StickyCTA';
import {
  HeroSection,
  HowItWorksRolesSection,
  WhyEcoPanierSection,
  SolidarityModelSection,
  ImpactStatsSection,
  TestimonialsSection,
  FinalCTASection
} from './sections';

export const LandingPage = () => {
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
        title="ÉcoPanier - Combattez le gaspillage alimentaire, nourrissez l'espoir | Plateforme solidaire"
        description="Plateforme qui connecte commerçants, clients, bénéficiaires et associations pour sauver des invendus et renforcer la solidarité locale. Économisez jusqu'à -70% et agissez concrètement."
        keywords="anti-gaspillage alimentaire, solidarité alimentaire, commerce local, invendus, paniers suspendus, aide alimentaire, commerçants engagés, économie circulaire, impact social, plateforme solidaire France"
        url="https://ecopanier.fr"
      />
      <Header />
      
      {/* Sticky CTA flottant */}
      <StickyCTA />
      
      {/* ========================================
          NOUVELLE STRUCTURE SIMPLIFIÉE (7 sections)
          ======================================== */}
      
      {/* 1. Hero Section - Accroche forte */}
      <HeroSection />
      
      {/* 2. Comment ça marche - 5 acteurs expliqués */}
      <HowItWorksRolesSection />
      
      {/* 3. Pourquoi EcoPanier - 3 piliers + stats globales */}
      <WhyEcoPanierSection />
      
      {/* 4. Modèle de solidarité - Lots gratuits */}
      <SolidarityModelSection />
      
      {/* 5. Impact chiffré - Graphiques dynamiques */}
      <ImpactStatsSection />
      
      {/* 6. Témoignages - Voix humaines */}
      <TestimonialsSection />
      
      {/* 7. CTA Final - Appel à l'action */}
      <FinalCTASection />
      
      <Footer />
    </div>
  );
};
