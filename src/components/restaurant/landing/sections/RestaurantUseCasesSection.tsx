import { motion } from 'framer-motion';
import { Users, Utensils, PartyPopper, Coffee, Building, Check, MessageCircle, ArrowRight } from 'lucide-react';

export const RestaurantUseCasesSection = () => {
  const useCases = [
    {
      icon: PartyPopper,
      title: 'Traiteur - Mariage',
      scenario: 'Resto du mariage de 150 personnes',
      solution: 'Les restes du buffet (entrées, plats, desserts) sont récupérés et redistribués en portions individuelles aux bénéficiaires le lendemain.',
      impact: '50-80 portions sauvées',
      emoji: '💍',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Building,
      title: 'Séminaire d\'entreprise',
      scenario: 'Buffet petit-déjeuner et déjeuner',
      solution: 'Les viennoiseries, sandwichs et salades non consommés sont transformés en lots gratuits pour les associations partenaires.',
      impact: '30-50 repas sauvés',
      emoji: '🏢',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Utensils,
      title: 'Restaurant - Service du midi',
      scenario: 'Plats préparés non vendus',
      solution: 'Les plats du jour invendus sont proposés à prix réduits en fin de service ou donnés aux bénéficiaires.',
      impact: '10-15 repas/jour',
      emoji: '🍽️',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Coffee,
      title: 'Brunch & Buffets',
      scenario: 'Buffet à volonté du dimanche',
      solution: 'Les produits frais non consommés (pâtisseries, viennoiseries, fruits) sont collectés et distribués.',
      impact: '20-30 portions sauvées',
      emoji: '🥐',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: 'Cocktails & Réceptions',
      scenario: 'Réception avec apéritifs et canapés',
      solution: 'Les verrines, canapés et petits fours sont portionnés et donnés à des associations pour leurs bénéficiaires.',
      impact: '40-60 portions redistribuées',
      emoji: '🥂',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section id="use-cases" className="relative py-24 md:py-32 bg-white overflow-hidden">
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
            <span className="text-2xl">📋</span>
            <span>Cas d'usage concrets</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Vos situations,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient">
              nos solutions
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Que vous soyez restaurateur ou traiteur, EcoPanier s'adapte à vos événements et vos invendus quotidiens
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
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
                    className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Emoji décoratif animé */}
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
                    {useCase.emoji}
                  </motion.div>

                  {/* Icône */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${useCase.gradient} mb-6 shadow-2xl relative z-10`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                  </motion.div>

                  {/* Titre */}
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 relative z-10 leading-tight">
                    {useCase.title}
                  </h3>

                  {/* Scénario */}
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-50 rounded-2xl px-5 py-3 mb-5 relative z-10">
                    <p className="text-sm sm:text-base font-bold text-orange-900">
                      💡 {useCase.scenario}
                    </p>
                  </div>

                  {/* Solution */}
                  <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed mb-5 relative z-10">
                    {useCase.solution}
                  </p>

                  {/* Impact avec badge */}
                  <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-2xl font-bold text-sm relative z-10 border-2 border-green-200">
                    <Check className="w-5 h-5" strokeWidth={3} />
                    <span>{useCase.impact}</span>
                  </div>

                  {/* Ligne décorative */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.gradient} origin-left`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA en bas ultra-moderne */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl">
            {/* Orbs décoratifs */}
            <motion.div
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block text-7xl mb-6"
              >
                🤔
              </motion.div>

              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                Votre situation n'est pas listée ?
              </h3>
              
              <p className="text-lg sm:text-xl text-white/90 font-light mb-8 leading-relaxed">
                Contactez-nous, nous adaptons notre solution à tous les types d'événements et de restauration
              </p>

              <motion.button
                onClick={() => window.location.href = '/help'}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-gray-50 transition-all shadow-2xl"
                type="button"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Nous contacter</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

