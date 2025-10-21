import { motion } from 'framer-motion';
import { Leaf, Heart, TrendingUp, Shield, Award, Zap, Star } from 'lucide-react';

export const RestaurantBenefitsSection = () => {
  const benefits = [
    { 
      icon: Leaf, 
      title: 'Zéro gaspillage', 
      description: '100% de vos invendus valorisés',
      gradient: 'from-green-500 to-emerald-500',
      emoji: '♻️'
    },
    { 
      icon: Heart, 
      title: 'Impact solidaire', 
      description: 'Aidez les plus précaires de votre quartier',
      gradient: 'from-pink-500 to-rose-500',
      emoji: '❤️'
    },
    { 
      icon: TrendingUp, 
      title: 'Image renforcée', 
      description: 'Montrez votre engagement RSE',
      gradient: 'from-blue-500 to-cyan-500',
      emoji: '📈'
    },
    { 
      icon: Shield, 
      title: 'Conformité légale', 
      description: 'Respectez la loi anti-gaspillage',
      gradient: 'from-purple-500 to-indigo-500',
      emoji: '🛡️'
    },
    { 
      icon: Award, 
      title: 'Visibilité locale', 
      description: 'Soyez mis en avant sur notre plateforme',
      gradient: 'from-yellow-500 to-orange-500',
      emoji: '🏆'
    },
    { 
      icon: Zap, 
      title: 'Simple et gratuit', 
      description: 'Aucun coût, aucun engagement',
      gradient: 'from-orange-500 to-red-500',
      emoji: '⚡'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
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
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Star className="w-4 h-4 fill-orange-600" />
            <span>Vos avantages</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              6 bonnes raisons
            </span>
            <br />
            de nous rejoindre
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Au-delà de l'impact solidaire, découvrez tous les bénéfices pour votre établissement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
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
                <div className="h-full bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
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
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className="absolute -top-4 -right-4 text-7xl opacity-10 pointer-events-none"
                  >
                    {benefit.emoji}
                  </motion.div>

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} mb-6 shadow-xl relative z-10`}
                  >
                    <Icon className="w-9 h-9 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 relative z-10 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {benefit.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

