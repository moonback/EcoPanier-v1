import { motion, Variants } from 'framer-motion';
import { DollarSign, Leaf, Package, Users } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const stats = [
  { icon: Package, value: '10 247', label: 'repas sauvés' },
  { icon: Users, value: '5 423', label: 'personnes aidées' },
  { icon: Leaf, value: '15,2 T', label: 'de CO₂ évitées' },
  { icon: DollarSign, value: '52 800 €', label: 'de dons solidaires' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const ImpactStatsSection = () => {
  return (
    <PageSection background="muted">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          eyebrow="Impact mesuré"
          title="Ensemble, changeons la donne"
          description="Les premiers indicateurs confirment que la lutte contre le gaspillage peut financer une solidarité locale."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                className="surface h-full space-y-4 p-6 text-center transition-shadow hover:shadow-md"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring' }}
                >
                  <Icon className="mx-auto h-8 w-8 text-primary-500" />
                </motion.div>
                <p className="text-3xl font-semibold text-neutral-900">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageSection>
  );
};

