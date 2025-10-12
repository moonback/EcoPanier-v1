import { Leaf } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { whyReasons } from '../../../data/landingData';

export const WhySection = () => {
  return (
    <AnimatedSection className="py-20 section-gradient">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-success inline-flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-success-600" />
            <span>Pourquoi ?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Un triple impact positif
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Chaque action sur notre plateforme crée un cercle vertueux pour la planète, les personnes et l'économie locale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {whyReasons.map((reason, index) => {
            const Icon = reason.icon;
            const colorMap: Record<string, { bg: string; text: string; border: string }> = {
              success: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-200' },
              accent: { bg: 'bg-accent-50', text: 'text-accent-600', border: 'border-accent-200' },
              warning: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-200' },
              primary: { bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-200' }
            };
            return (
              <div
                key={index}
                className={`card hover-lift border-2 ${colorMap[reason.color].border}`}
              >
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 ${colorMap[reason.color].bg} rounded-large flex items-center justify-center flex-shrink-0`}>
                      <Icon size={32} className={colorMap[reason.color].text} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                        {reason.title}
                      </h3>
                      <p className={`text-sm font-bold ${colorMap[reason.color].text}`}>
                        {reason.stats}
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 font-medium leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistiques détaillées */}
        <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-black mb-4">Le gaspillage alimentaire en chiffres</h3>
            <p className="text-primary-100 text-lg font-medium">Comprendre l'urgence d'agir</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-large p-6 text-center">
              <div className="text-5xl font-black mb-2">10M</div>
              <div className="text-primary-100 font-semibold">Tonnes de nourriture gaspillées en France par an</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-large p-6 text-center">
              <div className="text-5xl font-black mb-2">29Kg</div>
              <div className="text-primary-100 font-semibold">De déchets alimentaires par personne et par an</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-large p-6 text-center">
              <div className="text-5xl font-black mb-2">16Mds€</div>
              <div className="text-primary-100 font-semibold">Valeur du gaspillage alimentaire annuel</div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xl font-bold text-primary-100">
              🌍 Ensemble, nous pouvons inverser cette tendance !
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

