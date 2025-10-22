import { motion } from 'framer-motion';
import { Users, Utensils, PartyPopper, Coffee, Building } from 'lucide-react';

export const RestaurantUseCasesSection = () => {
  const useCases = [
    {
      icon: PartyPopper,
      title: 'Traiteur - Mariage',
      scenario: 'Resto du mariage de 150 personnes',
      solution: 'Les restes du buffet (entrées, plats, desserts) sont récupérés et redistribués en portions individuelles aux bénéficiaires le lendemain.',
      impact: '50-80 portions sauvées',
      emoji: '💍'
    },
    {
      icon: Building,
      title: 'Séminaire d\'entreprise',
      scenario: 'Buffet petit-déjeuner et déjeuner',
      solution: 'Les viennoiseries, sandwichs et salades non consommés sont transformés en lots gratuits pour les associations partenaires.',
      impact: '30-50 repas sauvés',
      emoji: '🏢'
    },
    {
      icon: Utensils,
      title: 'Restaurant - Service du midi',
      scenario: 'Plats préparés non vendus',
      solution: 'Les plats du jour invendus sont proposés à prix réduits en fin de service ou donnés aux bénéficiaires.',
      impact: '10-15 repas/jour',
      emoji: '🍽️'
    },
    {
      icon: Coffee,
      title: 'Brunch & Buffets',
      scenario: 'Buffet à volonté du dimanche',
      solution: 'Les produits frais non consommés (pâtisseries, viennoiseries, fruits) sont collectés et distribués.',
      impact: '20-30 portions sauvées',
      emoji: '🥐'
    },
    {
      icon: Users,
      title: 'Cocktails & Réceptions',
      scenario: 'Réception avec apéritifs et canapés',
      solution: 'Les verrines, canapés et petits fours sont portionnés et donnés à des associations pour leurs bénéficiaires.',
      impact: '40-60 portions redistribuées',
      emoji: '🥂'
    }
  ];

  return (
    <section id="use-cases" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">📋</span>
            <span>Cas d'usage concrets</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Vos situations,
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">nos solutions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Que vous soyez restaurateur ou traiteur, EcoPanier s'adapte à vos événements et vos invendus quotidiens
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all">
                  {/* Emoji décoratif */}
                  <div className="absolute top-6 right-6 text-5xl opacity-20">
                    {useCase.emoji}
                  </div>

                  {/* Icône */}
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-bold text-black mb-3">
                    {useCase.title}
                  </h3>

                  {/* Scénario */}
                  <div className="bg-orange-100 rounded-lg px-4 py-2 mb-4">
                    <p className="text-sm font-semibold text-orange-900">
                      💡 {useCase.scenario}
                    </p>
                  </div>

                  {/* Solution */}
                  <p className="text-gray-600 font-light leading-relaxed mb-4">
                    {useCase.solution}
                  </p>

                  {/* Impact */}
                  <div className="flex items-center gap-2 text-success-600 font-semibold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{useCase.impact}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA en bas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200">
            <h3 className="text-2xl font-bold text-black mb-3">
              Votre situation n'est pas listée ?
            </h3>
            <p className="text-gray-600 mb-6 font-light">
              Contactez-nous, nous adaptons notre solution à tous les types d'événements et de restauration
            </p>
            <button
              onClick={() => window.location.href = '/help'}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-8 py-4 text-white font-semibold shadow-2xl transition-all"
            >
              <span>Nous contacter</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

