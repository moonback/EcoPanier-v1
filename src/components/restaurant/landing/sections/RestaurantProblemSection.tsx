import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Euro } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const problems = [
  {
    icon: TrendingDown,
    stat: '30%',
    label: 'De gaspillage alimentaire',
    description: 'En restauration, 30% de la nourriture préparée finit à la poubelle',
  },
  {
    icon: Euro,
    stat: '10k€',
    label: 'Perdus par an',
    description: 'Un restaurant perd en moyenne 10 000€ par an en invendus',
  },
  {
    icon: AlertTriangle,
    stat: '1.6M',
    label: 'Tonnes gaspillées',
    description: 'La restauration française jette 1.6 million de tonnes par an',
  },
];

export const RestaurantProblemSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          title={
            <>
              Le gaspillage coûte cher,
              <br />
              <span className="text-accent-600">à vous et à la planète</span>
            </>
          }
          description="Chaque jour, des tonnes de nourriture parfaitement consommable finissent à la poubelle"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface flex flex-col items-center gap-4 p-6 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="text-4xl font-bold text-accent-600">{problem.stat}</div>
                <div className="text-lg font-semibold text-neutral-900">{problem.label}</div>
                <p className="text-sm text-neutral-600">{problem.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="surface-muted border-accent-200 p-8 text-center"
        >
          <p className="text-lg text-neutral-700">
            <strong className="font-semibold text-accent-600">La bonne nouvelle ?</strong> Ce gaspillage peut devenir
            un <strong className="font-semibold text-success-600">impact positif</strong> pour votre quartier
          </p>
        </motion.div>
      </div>
    </PageSection>
  );
};

