import { motion } from 'framer-motion';
import { whyReasons } from '../../../data/landingData';
import { TrendingUp, AlertCircle } from 'lucide-react';

export const WhySection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dégradé de fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

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
            className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-5 py-2.5 rounded-full font-bold border border-accent-200 mb-6 shadow-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Pourquoi EcoPanier
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight max-w-5xl leading-tight">
            Notre mission est simple :
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-success-600 animate-gradient">
              créer un cercle vertueux
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl font-light leading-relaxed">
            Où chaque repas sauvé est une victoire pour la planète, un soutien pour nos commerçants et un coup de pouce pour nos voisins.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24">
          {whyReasons.map((reason, index) => {
            const Icon = reason.icon;
            const colorClasses = {
              success: { 
                gradient: 'from-success-500 to-success-600', 
                text: 'text-success-600', 
                border: 'border-success-200',
                bg: 'bg-success-50',
                glow: 'shadow-success-500/20'
              },
              accent: { 
                gradient: 'from-accent-500 to-accent-600', 
                text: 'text-accent-600', 
                border: 'border-accent-200',
                bg: 'bg-accent-50',
                glow: 'shadow-accent-500/20'
              },
              warning: { 
                gradient: 'from-warning-500 to-warning-600', 
                text: 'text-warning-600', 
                border: 'border-warning-200',
                bg: 'bg-warning-50',
                glow: 'shadow-warning-500/20'
              },
              primary: { 
                gradient: 'from-primary-500 to-primary-600', 
                text: 'text-primary-600', 
                border: 'border-primary-200',
                bg: 'bg-primary-50',
                glow: 'shadow-primary-500/20'
              }
            };
            const colors = colorClasses[reason.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className={`relative p-8 md:p-10 h-full bg-white rounded-3xl border-2 ${colors.border} hover:border-opacity-100 hover:shadow-2xl ${colors.glow} transition-all duration-300 overflow-hidden`}>
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
                  />

                  {/* Icône avec badge animée */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 shadow-2xl relative z-10`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <h3 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-4 ${colors.text} relative z-10 leading-tight`}>
                    {reason.title}
                  </h3>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${colors.gradient} text-white font-bold text-base mb-5 shadow-lg relative z-10`}
                  >
                    {reason.stats}
                  </motion.div>
                  
                  <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed relative z-10">
                    {reason.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats en chiffres - Version ultra moderne */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-white overflow-hidden shadow-2xl"
        >
          {/* Image de fond illustrant l'urgence */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl md:rounded-[2.5rem]">
            <img
              src="/slide-3.png"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-30 pointer-events-none select-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
          </div>

          {/* Orbs lumineux */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />

          <div className="relative z-10">
            {/* En-tête */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12 md:mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-red-500/20 backdrop-blur-xl text-red-300 px-6 py-3 rounded-full font-bold border border-red-500/30 mb-6 shadow-xl">
                <AlertCircle className="w-5 h-5" />
                <span>Alerte</span>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                Le gaspillage en France
              </h3>
              <p className="text-lg sm:text-xl text-white/70 font-light">L'urgence d'agir maintenant</p>
            </motion.div>

            {/* Stats avec animations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
              {[
                { value: '10M', label: 'Tonnes gaspillées par an', icon: '🗑️' },
                { value: '29kg', label: 'Par personne et par an', icon: '⚖️' },
                { value: '16Mds€', label: 'Valeur du gaspillage annuel', icon: '💸' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center"
                >
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 shadow-xl">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="text-5xl mb-4"
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-red-300 to-orange-300">
                      {stat.value}
                    </div>
                    <div className="text-base sm:text-lg text-white/80 font-medium leading-snug">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message d'action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 md:mt-16 text-center"
            >
              <p className="text-xl sm:text-2xl font-bold text-white/90 mb-6">
                Il est temps d'agir. Ensemble.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl"
              >
                <span>Rejoindre le mouvement</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

