import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const benefits = [
  {
    title: 'Inscription rapide',
    items: [
      "Enregistrement d'un bénéficiaire en 5 minutes",
      "Génération automatique d'un ID unique",
      'QR code instantané pour le retrait',
      'Validation immédiate',
    ],
  },
  {
    title: 'Suivi complet',
    items: [
      'Historique de tous les retraits',
      'Statistiques détaillées par bénéficiaire',
      'Alertes automatiques (limite atteinte)',
      "Vue d'ensemble de l'activité",
    ],
  },
  {
    title: 'Conformité RGPD',
    items: [
      'Données sécurisées et cryptées',
      'Gestion des consentements',
      "Droit à l'oubli intégré",
      'Conformité totale aux régulations',
    ],
  },
  {
    title: 'Support dédié',
    items: [
      "Accompagnement à l'inscription",
      'Formation à la plateforme',
      'Équipe disponible 7j/7',
      'Documentation complète',
    ],
  },
];

export const AssociationBenefitsSection = () => {
  return (
    <PageSection background="default" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Des avantages concrets pour votre association"
          description="Tout ce dont vous avez besoin pour gérer efficacement votre programme d'aide"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface-muted h-full space-y-4 p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900">{benefit.title}</h3>
              <ul className="space-y-3">
                {benefit.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-100">
                      <Check className="h-3 w-3 text-success-600" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-neutral-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </PageSection>
  );
};

