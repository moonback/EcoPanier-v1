import { motion } from 'framer-motion';
import { DollarSign, Heart, Leaf, TrendingUp } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const reasons = [
  {
    icon: DollarSign,
    title: 'Récupérez vos pertes',
    description: "Valorisez jusqu'à 30 % du prix initial de vos invendus au lieu de les jeter. Chaque lot sauvé devient un revenu complémentaire.",
    stats: 'Jusqu’à 500 € par mois récupérés',
  },
  {
    icon: TrendingUp,
    title: 'Attirez de nouveaux clients',
    description: '70 % des utilisateurs découvrant un commerce via ÉcoPanier y reviennent ensuite. Générez du trafic qualifié sans budget marketing.',
    stats: '+30 % de nouveaux clients au bout de 3 mois',
  },
  {
    icon: Leaf,
    title: 'Réduisez votre impact CO₂',
    description: 'Chaque panier sauvé évite 0,9 kg de CO₂. Votre tableau de bord met en avant vos indicateurs environnementaux en temps réel.',
    stats: '15 tonnes de CO₂ évitées sur nos pilotes 2025',
  },
  {
    icon: Heart,
    title: 'Renforcez la solidarité locale',
    description: 'Activez les paniers solidaires pour soutenir les bénéficiaires de votre quartier et renforcer votre ancrage local.',
    stats: '5 000+ personnes aidées grâce aux commerçants partenaires',
  },
];

export const MerchantWhySection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Vos bénéfices"
          title="Pourquoi rejoindre ÉcoPanier ?"
          description="Une solution unique qui combine performance économique, impact environnemental et solidarité."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="surface flex h-full flex-col gap-4 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{reason.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{reason.description}</p>
                </div>
                <div className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">
                  {reason.stats}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

