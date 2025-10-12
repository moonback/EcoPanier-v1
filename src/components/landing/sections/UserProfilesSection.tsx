import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { userProfiles } from '../../../data/landingData';

export const UserProfilesSection = () => {
  const navigate = useNavigate();

  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-primary inline-flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary-600" />
            <span>Pour qui ?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Une solution simple, solidaire et locale
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Pour chacun d'entre nous — consommateur, commerçant, bénéficiaire ou collecteur
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {userProfiles.map((profile, index) => {
            const Icon = profile.icon;
            const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
              primary: { bg: 'bg-primary-100', text: 'text-primary-600', gradient: 'from-primary-500 to-primary-600' },
              secondary: { bg: 'bg-secondary-100', text: 'text-secondary-600', gradient: 'from-secondary-500 to-secondary-600' },
              accent: { bg: 'bg-accent-100', text: 'text-accent-600', gradient: 'from-accent-500 to-accent-600' },
              success: { bg: 'bg-success-100', text: 'text-success-600', gradient: 'from-success-500 to-success-600' }
            };
            return (
              <div
                key={index}
                className="group card p-8 hover-lift"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 ${colorMap[profile.color].bg} rounded-large flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className={colorMap[profile.color].text} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-neutral-900">
                        {profile.title}
                      </h3>
                      <span className="text-3xl">{profile.emoji}</span>
                    </div>
                    <p className={`text-sm font-semibold ${colorMap[profile.color].text}`}>
                      {profile.subtitle}
                    </p>
                  </div>
                </div>
                
                <p className="text-neutral-700 font-medium mb-6">
                  {profile.description}
                </p>
                
                <div className={`bg-gradient-to-br ${colorMap[profile.color].gradient} bg-opacity-10 rounded-large p-6 space-y-3`}>
                  <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className={colorMap[profile.color].text} />
                    Vos avantages :
                  </h4>
                  {profile.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle size={18} className={`${colorMap[profile.color].text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-neutral-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary rounded-full px-8 py-4 text-lg group"
          >
            <span>Créer mon compte gratuitement</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </AnimatedSection>
  );
};

