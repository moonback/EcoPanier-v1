import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { SEOHead } from '../shared/SEOHead';
import { StickyCTA } from './StickyCTA';
import {
  HeroSection,
  SuspendedBasketsSection,
  UserProfilesSection,
  WhySection,
  BasketJourneySection,
  MerchantHeroesSection,
  FeaturesSection,
  HowItWorksSection,
  ImpactCalculatorSection,
  TestimonialsSection,
  ImpactStatsSection,
  FAQSection,
  FinalCTASection
} from './sections';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <SEOHead
        title="ÉcoPanier - Mangez Mieux, Dépensez Moins, Sauvez la Planète | Anti-Gaspillage Alimentaire"
        description="Découvrez des paniers surprises de vos commerçants locaux jusqu'à -70%. Économisez sur vos courses, réduisez le gaspillage et aidez les personnes en difficulté. Rejoignez le mouvement anti-gaspi !"
        keywords="anti-gaspillage alimentaire, économies courses, invendus pas cher, commerce local, solidarité alimentaire, paniers suspendus, réduction gaspillage, produits frais, développement durable, économie circulaire France"
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
      
      {/* Section Histoire d'un panier sauvé - Storytelling */}
      <BasketJourneySection />
      
      {/* Section Nos Commerçants Héros */}
      <MerchantHeroesSection />
      
      {/* Section Features */}
      <FeaturesSection />
      
      {/* Section Comment ça marche ? */}
      <HowItWorksSection />
      
      {/* Section Calculateur d'impact */}
      <ImpactCalculatorSection />
      
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
