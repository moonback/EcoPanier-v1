import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, MessageCircle } from 'lucide-react';
import { faqItems } from '../../../data/landingData';

export const FAQSection = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dégradé subtil de fond */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50/30" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 animate-gradient">
              Questions fréquentes
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Tout ce que vous devez savoir sur EcoPanier
          </p>
        </motion.div>

        <div className="space-y-4 mb-16 md:mb-20">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 md:p-8 flex items-center justify-between text-left"
                  type="button"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-8 group-hover:text-primary-600 transition-colors leading-tight">
                    {item.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <Plus className={`w-7 h-7 ${openFaqIndex === index ? 'text-primary-600' : 'text-gray-400'} transition-colors`} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Barre de progression décorative */}
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 origin-left"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carte d'aide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden">
            {/* Orbs décoratifs */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block text-6xl mb-6"
              >
                💬
              </motion.div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                Besoin d'aide supplémentaire ?
              </h3>
              <p className="text-lg sm:text-xl text-white/90 font-light mb-8 leading-relaxed">
                Notre équipe est là pour vous accompagner à chaque étape
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  onClick={() => navigate('/help')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-white text-primary-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-colors shadow-xl"
                  type="button"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Centre d'aide</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-colors border-2 border-white/30"
                  type="button"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Nous contacter</span>
                </motion.button>
              </div>

              {/* Petits badges informatifs */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                  <span>⚡</span>
                  <span>Réponse rapide</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                  <span>🕐</span>
                  <span>Disponible 7j/7</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                  <span>💯</span>
                  <span>Support gratuit</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

