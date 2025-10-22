import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Clock, MapPin, Euro, Shield } from 'lucide-react';
import { useState } from 'react';

export const CollectorFAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment fonctionne la rémunération ?',
      answer: 'Vous recevez 7€ par livraison effectuée. Les paiements sont effectués automatiquement chaque semaine par virement bancaire. Vous pouvez suivre vos gains en temps réel dans votre espace collecteur.',
      icon: Euro,
    },
    {
      question: 'Quels sont les horaires de travail ?',
      answer: 'Vous travaillez quand vous voulez ! Les livraisons sont disponibles du lundi au dimanche, de 8h à 20h. Vous choisissez les créneaux qui vous conviennent.',
      icon: Clock,
    },
    {
      question: 'Dans quelles zones puis-je livrer ?',
      answer: 'Vous pouvez définir votre zone géographique lors de l\'inscription. Nous recommandons un rayon de 5km autour de votre domicile pour optimiser vos trajets.',
      icon: MapPin,
    },
    {
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Aucun frais caché ! L\'inscription est gratuite, il n\'y a pas d\'abonnement mensuel. Vous gardez 100% de vos gains de 7€ par livraison.',
      icon: Shield,
    },
    {
      question: 'Comment se déroule une livraison ?',
      answer: 'Vous recevez une notification avec les détails de la mission. Vous récupérez les repas chez le commerçant, puis vous les livrez aux bénéficiaires selon les instructions fournies.',
      icon: HelpCircle,
    },
    {
      question: 'Suis-je assuré pendant mes livraisons ?',
      answer: 'Oui, vous êtes couvert par notre assurance responsabilité civile pendant toutes vos livraisons EcoPanier, sans frais supplémentaires.',
      icon: Shield,
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <HelpCircle className="w-5 h-5" />
            <span>Questions fréquentes</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Vos questions,
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              nos réponses
            </span>
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Tout ce que vous devez savoir pour devenir collecteur EcoPanier
          </p>
        </motion.div>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            const Icon = faq.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-2xl border-2 transition-all ${
                  isExpanded 
                    ? 'border-primary-300 shadow-lg' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <div className="flex items-start gap-4 flex-1 pr-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 transition-all ${
                      isExpanded 
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                        : 'bg-gray-100 group-hover:bg-primary-50'
                    }`}>
                      <Icon 
                        size={20} 
                        className={isExpanded ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'} 
                        strokeWidth={2} 
                      />
                    </div>
                    <h3 className={`text-lg font-semibold transition-colors ${
                      isExpanded ? 'text-primary-700' : 'text-black group-hover:text-primary-600'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                    isExpanded ? 'bg-primary-100' : 'bg-gray-50 group-hover:bg-gray-100'
                  }`}>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-primary-600" strokeWidth={2} />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600 group-hover:text-primary-600" strokeWidth={2} />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="pl-16 pr-4">
                      <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-primary-500">
                        <p className="text-gray-700 leading-relaxed font-light text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
