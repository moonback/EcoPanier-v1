import { Clock } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { howItWorks } from '../../../data/landingData';

export const HowItWorksSection = () => {
  return (
    <AnimatedSection id="how-it-works" className="relative py-20 overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0">
        <img 
          src="/slide-2.png" 
          alt="Background - Comment ça marche" 
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay blanc semi-transparent */}
        <div className="absolute inset-0 bg-white/55 backdrop-blur-sm" />
        
        {/* Overlay dégradé subtil */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 via-transparent to-secondary-50/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-primary inline-flex items-center gap-2 mb-4">
            <Clock size={20} className="text-primary-600" />
            <span>Simple et rapide</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Comment ça marche ?
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary opacity-20 transform -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="card p-8 hover-lift">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-soft-lg">
                        {item.step}
                      </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-large flex items-center justify-center mx-auto mb-4">
                        <Icon size={32} className="text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-neutral-600 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

