import { motion } from 'framer-motion';
import { DollarSign, Leaf, Package, Users } from 'lucide-react';

import { whyPillars } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const globalStats = [
  { icon: Package, value: '12 540', label: 'repas sauvés', tone: 'text-success-600' },
  { icon: Leaf, value: '4,2 T', label: 'de CO₂ évitées', tone: 'text-primary-600' },
  { icon: Users, value: '1 980', label: 'bénéficiaires accompagnés', tone: 'text-accent-600' },
  { icon: DollarSign, value: '52 800 €', label: 'de dons solidaires', tone: 'text-warning-600' },
];

const pillarColors: Record<string, { icon: string; badge: string }> = {
  success: { icon: 'text-success-600 bg-success-50', badge: 'text-success-600 bg-success-100' },
  accent: { icon: 'text-accent-600 bg-accent-50', badge: 'text-accent-600 bg-accent-100' },
  primary: { icon: 'text-primary-600 bg-primary-50', badge: 'text-primary-600 bg-primary-100' },
};

export const WhyEcoPanierSection = () => {
  return (
    <PageSection background="subtle">
      <div className="flex flex-col gap-16">
        <SectionHeader
          align="center"
          eyebrow="Pourquoi ÉcoPanier ?"
          title="Une solution concrète, locale et solidaire"
          description="Nous combinons outils numériques, logistique solidaire et accompagnement des commerces pour transformer les invendus en repas accessibles."
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {whyPillars.map((pillar) => {
            const Icon = pillar.icon;
            const accents = pillarColors[pillar.color] ?? pillarColors.primary;

            return (
              <div key={pillar.title} className="surface h-full space-y-5 p-7">
                <div className="inline-flex items-center gap-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents.icon}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accents.badge}`}>
                    Pilier clé
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-neutral-900">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="surface flex flex-col gap-10 border-dashed border-neutral-200 bg-white p-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              Notre impact collectif (tests 2025)
            </p>
            <h3 className="text-2xl font-semibold text-neutral-900">
              Chaque panier compte pour l’écologie, l’économie et la solidarité.
            </h3>
            <p className="text-sm text-neutral-600">
              Chiffres issus de nos évaluations pilotes avec des commerces franciliens et nantais.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {globalStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
                  <Icon className={`mx-auto mb-4 h-8 w-8 ${stat.tone}`} />
                  <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-neutral-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageSection>
  );
};

