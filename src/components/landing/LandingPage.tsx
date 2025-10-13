import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
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
