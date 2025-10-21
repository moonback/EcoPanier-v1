import { motion } from 'framer-motion';
import { keyFeatures } from '../../../data/landingData';
import { Zap, ArrowRight } from 'lucide-react';

export const KeyFeaturesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dégradé de fond */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Technologie</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Une{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-purple-600 animate-gradient">
              technologie simple
            </span>
            <br />
            au service du bien
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Des outils puissants et intuitifs pour faciliter la vie de tous les acteurs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {keyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              primary: { 
                gradient: 'from-primary-500 to-primary-600', 
                text: 'text-primary-600', 
                bgLight: 'bg-primary-50',
                border: 'border-primary-200',
                glow: 'shadow-primary-500/20'
              },
              secondary: { 
                gradient: 'from-secondary-500 to-secondary-600', 
                text: 'text-secondary-600', 
                bgLight: 'bg-secondary-50',
                border: 'border-secondary-200',
                glow: 'shadow-secondary-500/20'
              },
              accent: { 
                gradient: 'from-accent-500 to-accent-600', 
                text: 'text-accent-600', 
                bgLight: 'bg-accent-50',
                border: 'border-accent-200',
                glow: 'shadow-accent-500/20'
              },
              success: { 
                gradient: 'from-success-500 to-success-600', 
                text: 'text-success-600', 
                bgLight: 'bg-success-50',
                border: 'border-success-200',
                glow: 'shadow-success-500/20'
              },
              warning: { 
                gradient: 'from-warning-500 to-warning-600', 
                text: 'text-warning-600', 
                bgLight: 'bg-warning-50',
                border: 'border-warning-200',
                glow: 'shadow-warning-500/20'
              },
              purple: { 
                gradient: 'from-purple-500 to-purple-600', 
                text: 'text-purple-600', 
                bgLight: 'bg-purple-50',
                border: 'border-purple-200',
                glow: 'shadow-purple-500/20'
              }
            };
            const colors = colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -8 }}
                className="group h-full"
              >
                <div className={`h-full ${colors.bgLight} rounded-3xl p-8 border-2 ${colors.border} hover:border-opacity-100 hover:shadow-2xl ${colors.glow} transition-all duration-300 overflow-hidden relative`}>
                  {/* Effet de gradient au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icône avec animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Titre */}
                  <h3 className={`text-xl sm:text-2xl font-black mb-4 ${colors.text} relative z-10 leading-tight`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA modernisé */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-20 text-center"
        >
          <motion.button
            onClick={() => window.location.href = '/dashboard'}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl transition-all shadow-xl"
            type="button"
          >
            <span>Explorer les fonctionnalités</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

