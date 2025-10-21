import { motion } from 'framer-motion';
import { Wallet, Leaf, Heart, TrendingUp } from 'lucide-react';

export const SuspendedBasketsSection = () => {
  const features = [
    {
      title: 'Pour Vous',
      description: 'Économisez jusqu\'à 70% sur des produits de qualité de tous types de commerces près de chez vous',
      stats: 'Jusqu\'à -70% d\'économies',
      icon: Wallet,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      emoji: '💰'
    },
    {
      title: 'Pour la Planète',
      description: 'Chaque panier sauvé évite 0.9kg de CO₂ et combat le gaspillage alimentaire',
      stats: '0.9kg de CO₂ évité / panier',
      icon: Leaf,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      emoji: '🌍'
    },
    {
      title: 'Pour les Autres',
      description: 'Accès gratuit à 2 paniers alimentaires par jour pour les personnes en situation de précarité',
      stats: '2 paniers solidaires / jour',
      icon: Heart,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      emoji: '❤️'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Image de fond avec overlay moderne */}
      <div className="absolute inset-0">
        <img 
          src="/slide-1.png" 
          alt="Mission sociale" 
          loading="lazy"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 via-white/80 to-gray-50/90" />
      </div>

      {/* Orbs décoratifs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-32">
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-success-50 to-primary-50 text-success-700 px-5 py-2.5 rounded-full font-bold border border-success-200 mb-6 shadow-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Triple impact</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Un geste simple.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-success-600 animate-gradient">
              Un triple impact.
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            En récupérant un panier, vous agissez pour votre porte-monnaie, pour la planète et pour votre quartier
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.2,
                  ease: [0.22, 1, 0.36, 1] as const
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="h-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl hover:shadow-accent-500/20 transition-all duration-300 border-2 border-gray-100 hover:border-primary-200 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
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
                    {feature.emoji}
                  </motion.div>

                  {/* Icône avec animation */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-2xl relative z-10`}
                  >
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight relative z-10">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base sm:text-lg text-gray-700 mb-6 font-light leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`inline-flex px-6 py-3 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white font-black text-lg shadow-xl relative z-10`}
                  >
                    {feature.stats}
                  </motion.div>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message final ultra-moderne */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
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

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block text-7xl mb-8"
              >
                🎯
              </motion.div>

              <h3 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-tight">
                Votre impact,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-400 to-success-400">
                  multiplié par trois
                </span>
              </h3>
              
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-light max-w-4xl mx-auto leading-relaxed">
                Chaque panier que vous récupérez crée un effet domino positif : vous économisez, la planète respire, et votre quartier se solidarise
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

