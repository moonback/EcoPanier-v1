import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, Package, Heart } from 'lucide-react';

import { howItWorks } from '../../../data/landingData';
import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const stepIcons = [MapPin, ShoppingBag, Package, Heart];

export const HowItWorksRolesSection = () => {
  return (
    <PageSection>
      <div className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Comment ça marche"
          title="Quatre étapes simples pour économiser et agir"
          description="Découvrez des paniers à prix réduits en quelques clics. Simple, rapide et efficace."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {howItWorks.map((step, index) => {
            const Icon = stepIcons[index] || step.icon;

            return (
              <div key={step.step} className="surface h-full p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                    Étape {step.step}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </PageSection>
  );
};

