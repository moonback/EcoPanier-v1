import { motion, Variants } from 'framer-motion';
import { MapPin, ShoppingBag, Package, Heart } from 'lucide-react';

import { howItWorks } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const stepIcons = [MapPin, ShoppingBag, Package, Heart];

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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const HowItWorksRolesSection = () => {
  return (
    <PageSection>
      <div className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Comment ça marche"
          title="Quatre étapes simples"
          description="Des paniers à prix réduits en quelques clics."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {howItWorks.map((step, index) => {
            const Icon = stepIcons[index] || step.icon;

            return (
              <motion.div
                key={step.step}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="surface h-full p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                    Étape {step.step}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageSection>
  );
};

