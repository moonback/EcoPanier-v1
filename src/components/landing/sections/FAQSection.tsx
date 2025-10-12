import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { faqItems } from '../../../data/landingData';

export const FAQSection = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-secondary inline-flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-secondary-600" />
            <span>Questions fréquentes</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Vous avez des questions ?
          </h2>
          <p className="text-xl text-neutral-600 font-medium">
            Nous avons les réponses !
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="card overflow-hidden hover-lift cursor-pointer"
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-neutral-900 flex-1">
                    {item.question}
                  </h3>
                  <ChevronDown 
                    size={24} 
                    className={`text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96 mt-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-neutral-700 font-medium leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-neutral-700 font-medium mb-6">
              Notre équipe est là pour vous aider ! Consultez notre centre d'aide complet ou contactez-nous directement.
            </p>
            <button
              onClick={() => navigate('/help')}
              className="btn-secondary rounded-full px-6 py-3"
            >
              Accéder au centre d'aide
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

