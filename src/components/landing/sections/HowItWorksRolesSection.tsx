import { motion } from 'framer-motion';
import { actorRoles } from '../../../data/landingData';
import { Users, ArrowRight } from 'lucide-react';

export const HowItWorksRolesSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dégradé de fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />

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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>5 acteurs, 1 mission</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Ensemble,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 animate-gradient">
              chaque geste compte
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            5 acteurs, 1 mission commune : combattre le gaspillage alimentaire et renforcer la solidarité locale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {actorRoles.map((actor, index) => {
            const Icon = actor.icon;
            const colorClasses = {
              primary: { 
                gradient: 'from-primary-500 to-primary-600', 
                border: 'border-primary-200', 
                text: 'text-primary-600',
                bg: 'bg-primary-50',
                glow: 'shadow-primary-500/20'
              },
              secondary: { 
                gradient: 'from-secondary-500 to-secondary-600', 
                border: 'border-secondary-200', 
                text: 'text-secondary-600',
                bg: 'bg-secondary-50',
                glow: 'shadow-secondary-500/20'
              },
              accent: { 
                gradient: 'from-accent-500 to-accent-600', 
                border: 'border-accent-200', 
                text: 'text-accent-600',
                bg: 'bg-accent-50',
                glow: 'shadow-accent-500/20'
              },
              success: { 
                gradient: 'from-success-500 to-success-600', 
                border: 'border-success-200', 
                text: 'text-success-600',
                bg: 'bg-success-50',
                glow: 'shadow-success-500/20'
              },
              purple: { 
                gradient: 'from-purple-500 to-purple-600', 
                border: 'border-purple-200', 
                text: 'text-purple-600',
                bg: 'bg-purple-50',
                glow: 'shadow-purple-500/20'
              }
            };
            const colors = colorClasses[actor.color as keyof typeof colorClasses];

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
                <div className={`h-full ${colors.bg} rounded-3xl border-2 ${colors.border} p-6 md:p-8 hover:shadow-2xl ${colors.glow} transition-all duration-300 overflow-hidden relative`}>
                  {/* Emoji en arrière-plan animé */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-4 right-4 text-6xl opacity-10 pointer-events-none"
                  >
                    {actor.emoji}
                  </motion.div>

                  {/* Icône avec animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 shadow-xl z-10`}
                  >
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Contenu */}
                  <h3 className={`text-xl sm:text-2xl font-black mb-2 ${colors.text} relative z-10 leading-tight`}>
                    {actor.title}
                  </h3>
                  <div className="text-sm font-bold text-gray-500 mb-4 relative z-10 uppercase tracking-wide">
                    {actor.role}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed relative z-10">
                    {actor.description}
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
            onClick={() => window.location.href = '/how-it-works'}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-black text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl transition-all shadow-xl"
            type="button"
          >
            <span>Découvrir les rôles en détail</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

