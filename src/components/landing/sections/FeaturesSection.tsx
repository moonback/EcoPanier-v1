import { AnimatedSection } from './AnimatedSection';
import { features } from '../../../data/landingData';

export const FeaturesSection = () => {
  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Une plateforme complète
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Toutes les fonctionnalités pour agir efficacement contre le gaspillage
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorMap: Record<string, { bg: string; text: string }> = {
              blue: { bg: 'bg-primary-100', text: 'text-primary-600' },
              pink: { bg: 'bg-secondary-100', text: 'text-secondary-600' },
              green: { bg: 'bg-success-100', text: 'text-success-600' },
              purple: { bg: 'bg-secondary-100', text: 'text-secondary-600' }
            };
            return (
              <div
                key={index}
                className="group card-gradient p-8 hover-lift"
              >
                <div className={`w-16 h-16 ${colorMap[feature.color].bg} rounded-large flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon size={32} className={colorMap[feature.color].text} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
};

