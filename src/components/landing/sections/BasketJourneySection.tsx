import { motion } from 'framer-motion';
import { Clock, ShoppingCart, Smartphone, Coffee, ArrowDown } from 'lucide-react';

export const BasketJourneySection = () => {
  const journeySteps = [
    {
      time: '18h00',
      icon: Clock,
      title: 'Le boulanger ferme sa boutique',
      description: 'Il lui reste 8 croissants et 3 pains aux chocolats invendus. Plutôt que de les jeter, il crée un panier surprise sur ÉcoPanier.',
      image: '🥐',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-amber-50'
    },
    {
      time: '18h15',
      icon: Smartphone,
      title: 'Léa reçoit une notification',
      description: 'Étudiante dans le quartier, elle cherchait justement son petit-déjeuner de demain. Un panier à 3€ au lieu de 10€, elle réserve immédiatement !',
      image: '📱',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      time: '18h30',
      icon: ShoppingCart,
      title: 'Retrait en 30 secondes',
      description: 'Léa présente son QR code à la boulangerie. Le boulanger scanne, valide, et elle repart avec son panier. Simple et rapide.',
      image: '✅',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      time: 'Lendemain',
      icon: Coffee,
      title: 'Un petit-déjeuner sauvé !',
      description: 'Léa déguste ses viennoiseries fraîches. Elle a économisé 7€, évité 720g de CO₂, et aidé son boulanger local. Tout le monde y gagne.',
      image: '☕',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgGradient: 'from-purple-50 to-pink-50'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Particules de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 px-5 py-2.5 rounded-full font-bold border border-orange-200 mb-6 shadow-sm"
          >
            <Coffee className="w-4 h-4" />
            <span>Histoire d'un panier</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 animate-gradient">
              L'histoire
            </span>
            {' '}d'un panier sauvé
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Découvrez comment un simple panier devient une victoire pour la planète, 
            votre portefeuille et votre quartier.
          </p>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion verticale animée (desktop) */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 via-cyan-400 via-green-400 to-purple-400 -translate-x-1/2 origin-top rounded-full opacity-30"
          />

          <div className="space-y-12 md:space-y-20">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.15,
                      ease: [0.22, 1, 0.36, 1] as const
                    }}
                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Contenu */}
                    <div className={`flex-1 ${isEven ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16'}`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${step.gradient} text-white font-bold mb-6 shadow-xl`}
                      >
                        <Clock className="w-5 h-5" />
                        <span className="text-lg">{step.time}</span>
                      </motion.div>

                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                        {step.title}
                      </h3>
                      
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                        {step.description}
                      </p>
                    </div>

                    {/* Icône centrale avec animation */}
                    <div className="relative z-10 flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className="relative"
                      >
                        {/* Cercle avec gradient animé */}
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${step.gradient} opacity-30 blur-xl`}
                        />
                        
                        <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-6xl sm:text-7xl shadow-2xl`}>
                          <motion.span
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            {step.image}
                          </motion.span>
                        </div>

                        {/* Badge d'étape */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
                          className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-100"
                        >
                          <span className={`text-xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                            {index + 1}
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Espace vide pour équilibrer (desktop) */}
                    <div className="flex-1 hidden lg:block" />
                  </motion.div>

                  {/* Flèche de connexion entre les étapes */}
                  {index < journeySteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}
                      className="flex justify-center lg:hidden my-6"
                    >
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`text-gray-400`}
                      >
                        <ArrowDown className="w-8 h-8" />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact final ultra-moderne */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 md:mt-32"
        >
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden shadow-2xl">
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

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                  L'impact d'un{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                    seul panier
                  </span>
                </h3>
                <p className="text-lg text-white/70 font-light">
                  Et si c'était le vôtre demain ?
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
                {[
                  { value: '7€', label: 'Économisés par Léa', icon: '💰', gradient: 'from-yellow-400 to-orange-400' },
                  { value: '720g', label: 'de CO₂ évité', icon: '🌱', gradient: 'from-green-400 to-emerald-400' },
                  { value: '8 repas', label: 'Sauvés du gaspillage', icon: '🍽️', gradient: 'from-purple-400 to-pink-400' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center"
                  >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                      <div className="text-5xl mb-4">{stat.icon}</div>
                      <div className={`text-5xl sm:text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`}>
                        {stat.value}
                      </div>
                      <div className="text-base sm:text-lg text-white/80 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

