import { motion } from 'framer-motion';
import { Camera, QrCode, Smartphone, UserPlus } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const steps = [
  {
    step: 'Étape 1',
    title: 'Inscrivez-vous gratuitement',
    description:
      'Complétez votre profil, définissez vos créneaux de retrait et publiez votre première offre en moins de 24 h.',
    icon: UserPlus,
    details: [
      'Inscription 100 % en ligne, multi-points de vente',
      'Créneaux et équipes paramétrables en autonomie',
    ],
  },
  {
    step: 'Étape 2',
    title: 'Créez vos lots avec l’IA',
    description:
      'Photographiez vos invendus : l’IA génère le titre, la description et le prix optimisé. Vous validez et publiez.',
    icon: Camera,
    details: [
      'Analyse IA et proposition en 30 secondes',
      'Bibliothèque de lots récurrents et duplication',
    ],
  },
  {
    step: 'Étape 3',
    title: 'Les clients réservent et paient en ligne',
    description:
      'Vos paniers sont visibles sur l’app ÉcoPanier, les paiements sont sécurisés et vous recevez chaque notification en temps réel.',
    icon: Smartphone,
    details: [
      'Paiements sécurisés, commission automatique',
      'Suivi des ventes sur un tableau de bord unique',
    ],
  },
  {
    step: 'Étape 4',
    title: 'Validez les retraits en 30 secondes',
    description:
      'Scannez le QR code, confirmez le PIN : la commande est servie et le virement hebdomadaire se déclenche automatiquement.',
    icon: QrCode,
    details: [
      'Station de retrait accessible sur tablette ou PC',
      'Historique des retraits et exports comptables inclus',
    ],
  },
];

export const MerchantHowItWorksSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Parcours commerçant"
          title="4 étapes pour valoriser vos invendus"
          description="Une expérience fluide du paramétrage au retrait, sans friction pour vos équipes."
        />

        <div className="grid gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="surface grid gap-6 rounded-2xl p-6 sm:grid-cols-[auto,1fr] sm:items-start"
              >
                <div className="flex items-start gap-3 sm:flex-col sm:items-start">
                  <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                    {step.step}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                    <p className="text-sm text-neutral-600">{step.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

