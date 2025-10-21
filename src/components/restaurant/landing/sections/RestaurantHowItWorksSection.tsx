import { motion } from 'framer-motion';
import { Camera, Clock, Truck, BarChart, Sparkles } from 'lucide-react';

export const RestaurantHowItWorksSection = () => {
  const steps = [
    { 
      icon: Camera, 
      title: 'Photographiez vos invendus', 
      description: 'L\'IA remplit automatiquement les informations',
      gradient: 'from-blue-500 to-cyan-500',
      emoji: '📸'
    },
    { 
      icon: Clock, 
      title: 'Définissez l\'heure de récupération', 
      description: 'Choisissez quand les collecteurs passent',
      gradient: 'from-orange-500 to-amber-500',
      emoji: '⏰'
    },
    { 
      icon: Truck, 
      title: 'On récupère et distribue', 
      description: 'Nos collecteurs s\'occupent de la logistique',
      gradient: 'from-purple-500 to-pink-500',
      emoji: '🚚'
    },
    { 
      icon: BarChart, 
      title: 'Suivez votre impact', 
      description: 'Dashboard avec statistiques en temps réel',
      gradient: 'from-green-500 to-emerald-500',
      emoji: '📊'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Grid pattern en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="restaurant-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#restaurant-grid)" className="text-orange-500" />
        </svg>
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Comment ça marche</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              Simple et rapide
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            4 étapes pour transformer vos invendus en impact solidaire
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
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
                className="group text-center"
              >
                <div className="h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 overflow-hidden relative">
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
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
                    {step.emoji}
                  </motion.div>

                  {/* Badge numéro */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} text-white text-3xl font-black mb-6 shadow-2xl`}
                  >
                    {index + 1}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <Icon className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 text-orange-600" strokeWidth={1.5} />
                  </motion.div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 relative z-10 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed relative z-10">
                    {step.description}
                  </p>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.4 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} origin-left`}
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

