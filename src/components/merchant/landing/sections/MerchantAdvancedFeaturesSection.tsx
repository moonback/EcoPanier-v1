import { motion } from 'framer-motion';
import { BarChart3, Brain, Download, Shield, Trash2 } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const advancedModules = [
  {
    icon: Brain,
    title: 'IA EcoPanier Pro',
    description: 'Reconnaissance produit, pricing dynamique et suggestions de packs sur la base de vos ventes.',
    details: [
      'Titres, descriptions et visuels optimisés',
      'Suggestions automatiques de réassort',
      'Score de confiance IA suivi dans le temps',
    ],
  },
  {
    icon: Trash2,
    title: 'Nettoyage intelligent',
    description: 'Archivage automatique des lots épuisés, alertes stocks bas et rappels de retrait.',
    details: [
      'Rappels avant fin de créneau',
      'Suppression sécurisée des visuels obsolètes',
      'Synthèse hebdo envoyée par email',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics avancés',
    description: 'Indicateurs consolidés pour piloter vos ventes, vos marges et votre impact.',
    details: [
      'Tendances 6 mois multi-catégories',
      'Histogrammes des créneaux performants',
      'Rapports CO₂, repas sauvés et dons',
    ],
  },
  {
    icon: Shield,
    title: 'Sécurité & conformité',
    description: 'Gestion RGPD, audit des actions et contrôle des accès par collaborateur.',
    details: [
      'Chiffrement bout à bout',
      'Journal d’audit exportable',
      'Gestion simplifiée du droit à l’oubli',
    ],
  },
  {
    icon: Download,
    title: 'Exports premium',
    description: 'Exports CSV/JSON planifiables pour votre comptabilité et vos outils BI.',
    details: [
      'Programmation mensuelle ou hebdo',
      'Historique complet des transactions',
      'Connecteurs Excel & Google Sheets',
    ],
  },
];

export const MerchantAdvancedFeaturesSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Fonctionnalités premium"
          title="Des outils professionnels pour accélérer"
          description="Inclus dans le plan Premium illimité, pour les commerces qui veulent aller plus vite et piloter précis."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {advancedModules.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="surface h-full space-y-4 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
                <ul className="space-y-2 text-sm text-neutral-600">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-primary-200 bg-primary-50/60 px-6 py-5 text-center text-sm text-primary-800">
          Inclus dans le plan Premium illimité (29,90&nbsp;€/mois) — activation en un clic depuis votre portefeuille marchand.
        </div>
      </div>
    </PageSection>
  );
};
