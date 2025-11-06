import { motion } from 'framer-motion';
import { BarChart3, Bell, Brain, Camera, Download, MapPin, QrCode, Shield } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const features = [
  {
    icon: Brain,
    title: 'IA EcoPanier',
    description: 'Analyse automatique des photos et suggestions intelligentes pour gagner un temps précieux sur chaque lot.',
  },
  {
    icon: Camera,
    title: 'Création guidée',
    description: 'Workflow en cinq étapes, accessible sur mobile, avec sauvegarde des brouillons et duplication des lots.',
  },
  {
    icon: QrCode,
    title: 'Station de retrait',
    description: 'Validation QR + PIN, historique des retraits et gestion simple des incidents depuis votre tablette.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques en temps réel',
    description: 'Suivez votre chiffre d’affaires, vos économies anti-gaspi et l’impact CO₂ évité, jour après jour.',
  },
  {
    icon: Bell,
    title: 'Notifications temps réel',
    description: 'Alertes email et SMS pour chaque réservation, annulation ou retrait à préparer.',
  },
  {
    icon: Shield,
    title: 'Paiements sécurisés',
    description: 'Transactions gérées par un PSP certifié, virements automatiques hebdomadaires et factures disponibles.',
  },
  {
    icon: MapPin,
    title: 'Visibilité locale',
    description: 'Votre commerce mis en avant sur la carte ÉcoPanier et dans les recherches par quartier.',
  },
  {
    icon: Download,
    title: 'Exports & conformité',
    description: 'Exports CSV/JSON, justificatifs comptables, journal des actions et conformité RGPD intégrée.',
  },
];

export const MerchantFeaturesSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Plateforme complète"
          title="Les outils qui simplifient votre quotidien"
          description="Chaque module est co-construit avec des commerçants pour répondre à leurs enjeux terrain."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

