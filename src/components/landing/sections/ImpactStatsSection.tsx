import { motion } from 'framer-motion';
import { Package, Users, Leaf, DollarSign } from 'lucide-react';

export const ImpactStatsSection = () => {
  const stats = [
    { icon: Package, value: '10,247', label: 'Repas sauvés', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' },
    { icon: Users, value: '5,423', label: 'Personnes aidées', gradient: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/50' },
    { icon: Leaf, value: '15.2T', label: 'CO₂ évitées', gradient: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/50' },
    { icon: DollarSign, value: '52,800€', label: 'De dons', gradient: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/50' },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Orbs lumineux de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

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
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-6 py-3 rounded-full font-bold border border-white/20 mb-8 shadow-xl"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Notre impact en temps réel
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Ensemble, on change
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 animate-gradient">
              la donne
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
            Rejoignez des milliers de personnes qui agissent concrètement pour un monde meilleur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl overflow-hidden">
                  {/* Effet de glow animé */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />

                  {/* Icône avec gradient */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 shadow-xl ${stat.glow}`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Valeur avec animation de compteur visuel */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tight"
                  >
                    {stat.value}
                  </motion.div>

                  {/* Label */}
                  <div className="text-base sm:text-lg text-white/70 font-medium">
                    {stat.label}
                  </div>

                  {/* Barre de progression décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.15 + 0.5 }}
                    className={`mt-4 h-1 rounded-full bg-gradient-to-r ${stat.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message motivant */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-5 shadow-2xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🌍</span>
            </motion.div>
            <p className="text-lg md:text-xl text-white font-semibold">
              Et vous ? Prêt à rejoindre le mouvement ?
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

