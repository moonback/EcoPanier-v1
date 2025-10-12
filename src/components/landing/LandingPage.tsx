import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { StickyCTA } from './StickyCTA';
import { HeroSection } from './sections/HeroSection';
import { SuspendedBasketsSection } from './sections/SuspendedBasketsSection';
import { UserProfilesSection } from './sections/UserProfilesSection';
import { WhySection } from './sections/WhySection';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { ImpactStatsSection } from './sections/ImpactStatsSection';
import { FAQSection } from './sections/FAQSection';
import { FinalCTASection } from './sections/FinalCTASection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header transparent />
      
      {/* Sticky CTA flottant */}
      <StickyCTA />
      
      {/* Hero Section avec animations */}
      <HeroSection />
      
      {/* Section Mission Sociale - Paniers Suspendus */}
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
