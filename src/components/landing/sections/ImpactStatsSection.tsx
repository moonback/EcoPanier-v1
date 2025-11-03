import { motion } from 'framer-motion';
import { DollarSign, Leaf, Package, Users } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const stats = [
  { icon: Package, value: '10 247', label: 'repas sauvés' },
  { icon: Users, value: '5 423', label: 'personnes aidées' },
  { icon: Leaf, value: '15,2 T', label: 'de CO₂ évitées' },
  { icon: DollarSign, value: '52 800 €', label: 'de dons solidaires' },
];

export const ImpactStatsSection = () => {
  return (
    <PageSection background="muted">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          eyebrow="Impact mesuré"
          title="Ensemble, changeons la donne durablement"
          description="Les premiers indicateurs confirment que la lutte contre le gaspillage peut financer une véritable solidarité locale."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="surface h-full space-y-4 p-6 text-center">
                <Icon className="mx-auto h-8 w-8 text-primary-500" />
                <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </PageSection>
  );
};

