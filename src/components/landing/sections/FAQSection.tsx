import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { faqItems } from '../../../data/landingData';

export const FAQSection = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Tout ce que vous devez savoir
          </p>
        </motion.div>

        <div className="space-y-4 mb-16">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="border-b border-gray-200"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <h3 className="text-xl font-semibold text-black pr-8 group-hover:text-gray-700 transition-colors">
                  {item.question}
                </h3>
                <Plus 
                  className={`w-6 h-6 text-black flex-shrink-0 transition-transform duration-300 ${
                    openFaqIndex === index ? 'rotate-45' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-700 font-light leading-relaxed text-lg">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-2xl p-10 text-center"
        >
          <h3 className="text-2xl font-bold text-black mb-4">
            Besoin d'aide supplémentaire ?
          </h3>
          <p className="text-gray-700 font-light mb-6 text-lg">
            Notre équipe est là pour vous accompagner
          </p>
          <button
            onClick={() => navigate('/help')}
            className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-900 transition-all"
          >
            Centre d'aide
          </button>
        </motion.div>
      </div>
    </section>
  );
};

