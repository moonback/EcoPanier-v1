import { motion } from 'framer-motion';
import { Users, Utensils, PartyPopper, Coffee, Building, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const useCases = [
  {
    icon: PartyPopper,
    title: 'Traiteur - Mariage',
    scenario: 'Resto du mariage de 150 personnes',
    solution: 'Les restes du buffet (entrées, plats, desserts) sont récupérés et redistribués en portions individuelles aux bénéficiaires le lendemain.',
    impact: '50-80 portions sauvées',
    emoji: '💍',
  },
  {
    icon: Building,
    title: "Séminaire d'entreprise",
    scenario: 'Buffet petit-déjeuner et déjeuner',
    solution: 'Les viennoiseries, sandwichs et salades non consommés sont transformés en lots gratuits pour les associations partenaires.',
    impact: '30-50 repas sauvés',
    emoji: '🏢',
  },
  {
    icon: Utensils,
    title: 'Restaurant - Service du midi',
    scenario: 'Plats préparés non vendus',
    solution: 'Les plats du jour invendus sont proposés à prix réduits en fin de service ou donnés aux bénéficiaires.',
    impact: '10-15 repas/jour',
    emoji: '🍽️',
  },
  {
    icon: Coffee,
    title: 'Brunch & Buffets',
    scenario: 'Buffet à volonté du dimanche',
    solution: 'Les produits frais non consommés (pâtisseries, viennoiseries, fruits) sont collectés et distribués.',
    impact: '20-30 portions sauvées',
    emoji: '🥐',
  },
  {
    icon: Users,
    title: 'Cocktails & Réceptions',
    scenario: 'Réception avec apéritifs et canapés',
    solution: 'Les verrines, canapés et petits fours sont portionnés et donnés à des associations pour leurs bénéficiaires.',
    impact: '40-60 portions redistribuées',
    emoji: '🥂',
  },
];

export const RestaurantUseCasesSection = () => {
  const navigate = useNavigate();

  return (
    <PageSection id="use-cases" background="default" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Cas d'usage concrets"
          title={
            <>
              Vos situations,
              <br />
              <span className="text-primary-600">nos solutions</span>
            </>
          }
          description="Que vous soyez restaurateur ou traiteur, EcoPanier s'adapte à vos événements et vos invendus quotidiens"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface group relative h-full space-y-4 p-6"
              >
                <div className="absolute right-4 top-4 text-4xl opacity-10">{useCase.emoji}</div>

                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-6 w-6" />
                </span>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">{useCase.title}</h3>

                  <div className="surface-muted border-primary-200 space-y-2 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary-900">💡 {useCase.scenario}</p>
                  </div>

                  <p className="text-sm text-neutral-600 leading-relaxed">{useCase.solution}</p>

                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">{useCase.impact}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="surface-muted border-primary-200 p-8 text-center"
        >
          <h3 className="mb-3 text-xl font-semibold text-neutral-900">Votre situation n'est pas listée ?</h3>
          <p className="mb-6 text-sm text-neutral-600">
            Contactez-nous, nous adaptons notre solution à tous les types d'événements et de restauration
          </p>
          <button onClick={() => navigate('/help')} className="btn-primary">
            Nous contacter
          </button>
        </motion.div>
      </div>
    </PageSection>
  );
};

