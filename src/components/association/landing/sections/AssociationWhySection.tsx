import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, Heart } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const reasons = [
  {
    icon: Users,
    title: 'Gestion simplifiée',
    description: 'Enregistrez et gérez vos bénéficiaires en quelques clics. Fini les fichiers Excel et les papiers perdus. Tout est centralisé et sécurisé.',
    stats: 'Gain de temps : 70%',
  },
  {
    icon: BarChart3,
    title: 'Suivi en temps réel',
    description: "Suivez l'activité de chaque bénéficiaire, les lots récupérés, et générez des rapports détaillés pour vos financeurs en un clic.",
    stats: '+500 données suivies',
  },
  {
    icon: FileText,
    title: 'Rapports automatiques',
    description: 'Exportez vos données au format CSV ou JSON pour vos rapports d\'activité. Conformité RGPD garantie.',
    stats: 'Export en 1 clic',
  },
  {
    icon: Heart,
    title: 'Dignité préservée',
    description: "Les bénéficiaires utilisent un QR code comme tous les clients. Pas de stigmatisation, juste de l'aide alimentaire moderne et digne.",
    stats: '100% dignité',
  },
];

export const AssociationWhySection = () => {
  return (
    <PageSection background="muted" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Pourquoi rejoindre ÉcoPanier ?"
          description="Une plateforme moderne pour une aide alimentaire plus efficace et digne"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface h-full space-y-4 p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-neutral-900">{reason.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{reason.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
                  <span>📊</span>
                  <span>{reason.stats}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

