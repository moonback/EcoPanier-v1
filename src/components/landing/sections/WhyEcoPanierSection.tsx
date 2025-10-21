import { motion } from 'framer-motion';
import { whyPillars } from '../../../data/landingData';
import { Package, Users, Leaf, DollarSign, Sparkles } from 'lucide-react';

export const WhyEcoPanierSection = () => {
  const globalStats = [
    { icon: Package, value: '12,540', label: 'repas sauvés', gradient: 'from-green-400 to-emerald-400' },
    { icon: Leaf, value: '4.2T', label: 'de CO₂ évitées', gradient: 'from-blue-400 to-cyan-400' },
    { icon: Users, value: '1,980', label: 'bénéficiaires aidés', gradient: 'from-purple-400 to-pink-400' },
    { icon: DollarSign, value: '52,800€', label: 'de dons solidaires', gradient: 'from-yellow-400 to-orange-400' }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Particules de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
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
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 px-5 py-2.5 rounded-full font-bold border border-primary-200 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Notre solution</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Une solution{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-success-600 animate-gradient">
              concrète
            </span>
            ,<br />
            locale et solidaire
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Tech et humanité réunies pour un impact mesurable
          </p>
        </motion.div>

        {/* Les 3 piliers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {whyPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const colorClasses = {
              success: { 
                gradient: 'from-success-500 to-success-600', 
                border: 'border-success-200', 
                iconBg: 'bg-success-50', 
                iconText: 'text-success-600',
                glow: 'shadow-success-500/20'
              },
              accent: { 
                gradient: 'from-accent-500 to-accent-600', 
                border: 'border-accent-200', 
                iconBg: 'bg-accent-50', 
                iconText: 'text-accent-600',
                glow: 'shadow-accent-500/20'
              },
              primary: { 
                gradient: 'from-primary-500 to-primary-600', 
                border: 'border-primary-200', 
                iconBg: 'bg-primary-50', 
                iconText: 'text-primary-600',
                glow: 'shadow-primary-500/20'
              }
            };
            const colors = colorClasses[pillar.color as keyof typeof colorClasses];

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
                className="group h-full"
              >
                <div className={`h-full bg-white rounded-3xl border-2 ${colors.border} p-8 md:p-10 hover:shadow-2xl ${colors.glow} transition-all duration-300 overflow-hidden relative`}>
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 ${colors.iconBg} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                  />

                  {/* Icône */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Titre */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight relative z-10">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed relative z-10">
                    {pillar.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Statistiques dynamiques globales ultra-modernes */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-white overflow-hidden shadow-2xl">
            {/* Orbs décoratifs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-success-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-5 py-2.5 rounded-full font-bold border border-white/20 mb-6 shadow-xl"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  En temps réel
                </motion.div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                  Notre{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-success-400 to-emerald-400">
                    impact collectif
                  </span>
                </h3>
                <p className="text-lg sm:text-xl text-white/70 font-light">
                  L'impact de notre communauté en direct
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {globalStats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center"
                    >
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/10 transition-all duration-300">
                        <StatIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-white/60" strokeWidth={1.5} />
                        <div className={`text-4xl sm:text-5xl md:text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`}>
                          {stat.value}
                        </div>
                        <div className="text-sm sm:text-base text-white/70 font-medium leading-tight">
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

