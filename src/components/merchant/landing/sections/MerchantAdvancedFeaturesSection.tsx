import { motion } from 'framer-motion';
import { BarChart3, Brain, Download, Shield, Trash2 } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const advancedModules = [
  {
    icon: Brain,
    title: 'IA EcoPanier ',
    description: 'Reconnaissance automatique des produits, génération de fiches complètes et estimation de prix basée sur l’historique.',
    details: [
      'Propositions éditables en un clic',
      'Suggestion de lots récurrents',
      'Suivi du taux de conformité IA',
    ],
  },
  {
    icon: Trash2,
    title: 'Nettoyage automatique',
    description: 'Archivage des lots expirés, alertes sur les stocks restants et suppression automatique des contenus obsolètes.',
    details: [
      'Rappels avant expiration des créneaux',
      'Archivage sécurisé des statistiques',
      'Notifications hebdomadaires de synthèse',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics avancés',
    description: 'Tableaux de bord multi-indicateurs pour comprendre vos performances et optimiser vos horaires de retrait.',
    details: [
      'Tendances sur 6 mois',
      'Comparaison par catégorie',
      'Impact CO₂ et repas sauvés',
    ],
  },
  {
    icon: Shield,
    title: 'Sécurité & conformité',
    description: 'Gestion des consentements bénéficiaires, audit des actions et conformité RGPD vérifiée par un tiers.',
    details: [
      'Chiffrement des données sensibles',
      'Journal d’audit exportable',
      'Droit à l’oubli simplifié',
    ],
  },
  {
    icon: Download,
    title: 'Exports complets',
    description: 'Accédez à toutes vos données au format CSV/JSON pour votre comptabilité et vos reporting internes.',
    details: [
      'Exports planifiables par email',
      'Historique des réservations détaillé',
      'Intégration facile avec Excel ou BI',
    ],
  },
];

export const MerchantAdvancedFeaturesSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Fonctionnalités avancées"
          title="Des outils professionnels pour aller plus loin"
          description="Pensés pour les enseignes multi-sites comme pour les artisans indépendants."
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
      </div>
    </PageSection>
  );
};
