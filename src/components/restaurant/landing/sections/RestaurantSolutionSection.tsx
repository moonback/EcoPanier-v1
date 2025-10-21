import { motion } from 'framer-motion';
import { CheckCircle, Truck, Users, Package, Sparkles } from 'lucide-react';

export const RestaurantSolutionSection = () => {
  const solutions = [
    {
      icon: Package,
      title: 'Vous créez vos lots',
      description: 'En 2 minutes, ajoutez vos invendus sur la plateforme (avec IA pour vous aider)',
      gradient: 'from-blue-500 to-cyan-500',
      emoji: '📦',
      number: '1'
    },
    {
      icon: Truck,
      title: 'On s\'occupe de la logistique',
      description: 'Nos collecteurs récupèrent et livrent aux associations partenaires',
      gradient: 'from-orange-500 to-red-500',
      emoji: '🚚',
      number: '2'
    },
    {
      icon: Users,
      title: 'Distribution aux bénéficiaires',
      description: 'Vos repas sont distribués en toute dignité aux personnes dans le besoin',
      gradient: 'from-purple-500 to-pink-500',
      emoji: '👥',
      number: '3'
    },
    {
      icon: CheckCircle,
      title: 'Impact mesuré',
      description: 'Suivez en temps réel l\'impact de vos dons (repas sauvés, CO₂ évité)',
      gradient: 'from-green-500 to-emerald-500',
      emoji: '📊',
      number: '4'
    }
  ];

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
            className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>La solution</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              EcoPanier
            </span>
            {' '}s'occupe de tout
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            De la création du lot à la distribution : une solution clé en main pour valoriser vos invendus
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
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
                <div className="h-full bg-orange-50 rounded-3xl p-8 border-2 border-orange-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
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
                    className="absolute -top-4 -right-4 text-7xl opacity-10 pointer-events-none"
                  >
                    {solution.emoji}
                  </motion.div>

                  {/* Badge numéro */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${solution.gradient} text-white font-black text-xl shadow-xl mb-4 relative z-10`}
                  >
                    {solution.number}
                  </motion.div>

                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${solution.gradient} mb-5 shadow-xl relative z-10`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 relative z-10 leading-tight">
                    {solution.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {solution.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${solution.gradient} origin-left`}
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

