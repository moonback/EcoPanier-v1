import { motion } from 'framer-motion';
import { features } from '../../../data/landingData';
import { Sparkles } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center lg:text-left"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Fonctionnalités
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight max-w-4xl leading-tight">
            Une plateforme,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 animate-gradient">
              un impact collectif
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl font-light leading-relaxed">
            Tout ce qu'il faut pour transformer vos habitudes alimentaires et agir concrètement pour la planète
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: { gradient: 'from-primary-500 to-primary-600', glow: 'group-hover:shadow-primary-500/50', bg: 'bg-primary-50', border: 'border-primary-200' },
              pink: { gradient: 'from-accent-500 to-pink-600', glow: 'group-hover:shadow-accent-500/50', bg: 'bg-accent-50', border: 'border-accent-200' },
              green: { gradient: 'from-success-500 to-success-600', glow: 'group-hover:shadow-success-500/50', bg: 'bg-success-50', border: 'border-success-200' },
              purple: { gradient: 'from-secondary-500 to-purple-600', glow: 'group-hover:shadow-secondary-500/50', bg: 'bg-secondary-50', border: 'border-secondary-200' }
            };
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
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
                <div className={`relative p-8 h-full bg-white rounded-3xl border-2 ${colors.border} hover:border-opacity-100 transition-all duration-300 shadow-lg ${colors.glow} hover:shadow-2xl overflow-hidden`}>
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                  />

                  {/* Icône avec dégradé et animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors relative z-10 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {feature.description}
                  </p>

                  {/* Indicateur visuel en bas */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} origin-left`}
                  />

                  {/* Sparkle au hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 text-yellow-400"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA supplémentaire */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-8 py-6 rounded-2xl shadow-2xl">
            <p className="text-lg sm:text-xl font-bold">
              Plus de 50 fonctionnalités pour maximiser votre impact
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg"
            >
              En savoir plus
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

