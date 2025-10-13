import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { StickyCTA } from './StickyCTA';
import {
  HeroSection,
  SuspendedBasketsSection,
  UserProfilesSection,
  WhySection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  ImpactStatsSection,
  FAQSection,
  FinalCTASection
} from './sections';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <SEOHead
        title="EcoPanier - Plateforme Solidaire Anti-gaspillage Alimentaire | Sauvez la Planète"
        description="EcoPanier connecte commerçants et consommateurs pour lutter contre le gaspillage alimentaire. Achetez des lots d'invendus à prix réduits, offrez des paniers suspendus et participez à la solidarité alimentaire."
        keywords="anti-gaspillage, alimentaire, solidarité, panier suspendu, invendus, écologie, développement durable, commerce local, économie circulaire, France"
        url="https://ecopanier.fr"
      />
      <Header transparent />
      
      {/* Sticky CTA flottant */}
      <StickyCTA />
      
      {/* Hero Section avec animations */}
      <HeroSection />
      
      {/* Section Mission Sociale - Pour Tous */}
      <SuspendedBasketsSection />
      
      {/* Section Pour qui ? */}
      <UserProfilesSection />
      
      {/* Section Pourquoi ? - Triple impact */}
      <WhySection />
      
      {/* Section Features */}
      <FeaturesSection />
      
      {/* Section Comment ça marche ? */}
      <HowItWorksSection />
      
      {/* Section Témoignages */}
      <TestimonialsSection />
      
      {/* Section Impact en chiffres */}
      <ImpactStatsSection />
      
      {/* Section FAQ */}
      <FAQSection />
      
      {/* Section CTA Final */}
      <FinalCTASection />
      
      <Footer />
    </div>
  );
};
