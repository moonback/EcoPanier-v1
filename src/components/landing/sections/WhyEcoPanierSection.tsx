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
          title="Trois raisons de nous choisir"
          description="Économisez sur vos courses tout en agissant pour l'environnement et la solidarité."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            staggerChildren: 0.15,
            delayChildren: 0.1,
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          {whyPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const accents = pillarColors[pillar.color] ?? pillarColors.primary;

            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="surface h-full space-y-5 p-7 transition-shadow hover:shadow-md"
              >
                <div className="inline-flex items-center gap-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accents.badge}`}>
                    Pilier clé
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-neutral-900">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="surface flex flex-col gap-10 border-dashed border-neutral-200 bg-white p-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              Notre impact collectif
            </p>
            <h3 className="text-2xl font-semibold text-neutral-900">
              L'impact de notre communauté
            </h3>
            <p className="text-sm text-neutral-600">
              Chiffres issus de l'activité réelle de nos clients.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              staggerChildren: 0.1,
              delayChildren: 0.2,
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {globalStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md"
                >
                  <Icon className={`mx-auto mb-4 h-8 w-8 ${stat.tone}`} />
                  <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-neutral-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageSection>
  );
};

