import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Euro } from 'lucide-react';

export const RestaurantProblemSection = () => {
  const problems = [
    {
      icon: TrendingDown,
      stat: '30%',
      label: 'De gaspillage alimentaire',
      description: 'En restauration, 30% de la nourriture préparée finit à la poubelle',
      gradient: 'from-red-500 to-rose-500',
      emoji: '📉'
    },
    {
      icon: Euro,
      stat: '10k€',
      label: 'Perdus par an',
      description: 'Un restaurant perd en moyenne 10 000€ par an en invendus',
      gradient: 'from-orange-500 to-red-500',
      emoji: '💸'
    },
    {
      icon: AlertTriangle,
      stat: '1.6M',
      label: 'Tonnes gaspillées',
      description: 'La restauration française jette 1.6 million de tonnes par an',
      gradient: 'from-red-600 to-pink-600',
      emoji: '⚠️'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Particules de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-400 rounded-full"
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
            className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-5 py-2.5 rounded-full font-bold border border-red-200 mb-6 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Le problème</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Le gaspillage{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 animate-gradient">
              coûte cher
            </span>
            ,<br />
            à vous et à la planète
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Chaque jour, des tonnes de nourriture parfaitement consommable finissent à la poubelle
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
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
                <div className="h-full bg-white rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-red-100 hover:border-red-200 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Emoji décoratif */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 -right-4 text-8xl opacity-10 pointer-events-none"
                  >
                    {problem.emoji}
                  </motion.div>

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${problem.gradient} mb-6 shadow-2xl relative z-10`}
                  >
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2} />
                  </motion.div>

                  <div className={`text-5xl sm:text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-br ${problem.gradient} relative z-10`}>
                    {problem.stat}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 relative z-10">
                    {problem.label}
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {problem.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${problem.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message fort ultra-moderne */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden shadow-2xl">
            {/* Orbs décoratifs */}
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
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block text-7xl mb-6"
              >
                💡
              </motion.div>

              <p className="text-2xl sm:text-3xl md:text-4xl font-light text-white/95 leading-relaxed max-w-4xl mx-auto">
                <strong className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  La bonne nouvelle ?
                </strong>
                {' '}Ce gaspillage peut devenir un{' '}
                <strong className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  impact positif
                </strong>
                {' '}pour votre quartier
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

