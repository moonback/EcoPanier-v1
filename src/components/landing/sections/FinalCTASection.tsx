import { useNavigate } from 'react-router-dom';
import { Users, Globe } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <AnimatedSection className="py-20 section-gradient">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-primary rounded-3xl p-12 shadow-soft-xl text-white hover-lift border-2 border-primary-200">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Prêt à faire la différence ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 font-medium">
            Rejoignez notre communauté et participez à la révolution alimentaire solidaire
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-soft-xl hover:shadow-glow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Users size={24} />
              <span>Créer mon compte</span>
            </button>
            <button
              onClick={() => navigate('/pickup')}
              className="px-8 py-4 bg-secondary-700 hover:bg-secondary-800 text-white rounded-full font-bold text-lg shadow-soft-xl hover:shadow-glow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Globe size={24} />
              <span>Découvrir la station de retrait</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

