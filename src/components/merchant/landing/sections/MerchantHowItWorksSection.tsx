import { motion } from 'framer-motion';
import { Camera, QrCode, Smartphone, UserPlus } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const steps = [
  {
    step: 'Étape 1',
    title: 'Inscrivez-vous gratuitement',
    description:
      'Renseignez vos informations professionnelles et paramétrez vos horaires de retrait. Votre profil est validé en moins de 24 heures.',
    icon: UserPlus,
    details: [
      "Inscription en ligne, sans matériel dédié",
      'Ajout de plusieurs points de vente possible',
      'Paramètres de retrait personnalisables',
    ],
  },
  {
    step: 'Étape 2',
    title: 'Créez vos lots avec l’IA',
    description:
      'Prenez une photo de vos invendus : l’IA propose un titre, une description et un prix suggéré que vous ajustez en un clic.',
    icon: Camera,
    details: [
      'Analyse IA en 30 secondes',
      'Bibliothèque d’images et de descriptions enregistrée',
      'Gestion des stocks et lots récurrents',
    ],
  },
  {
    step: 'Étape 3',
    title: 'Les clients réservent et paient en ligne',
    description:
      'Vous recevez des notifications instantanées, les paiements sont sécurisés et vos lots apparaissent automatiquement sur la carte publique.',
    icon: Smartphone,
    details: [
      'Paiement sécurisé et commission prélevée automatiquement',
      'Notifications email et SMS en temps réel',
      'Tableau de bord unifié pour suivre vos ventes',
    ],
  },
  {
    step: 'Étape 4',
    title: 'Validez les retraits en 30 secondes',
    description:
      'Scan du QR code, confirmation du PIN et remise du panier. Votre virement hebdomadaire est ensuite automatisé.',
    icon: QrCode,
    details: [
      'Station de retrait web ou tablette',
      'Historique des retraits et incidents',
      'Exports comptables et rapports automatiques',
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

