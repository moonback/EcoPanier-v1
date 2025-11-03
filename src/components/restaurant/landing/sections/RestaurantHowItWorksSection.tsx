import { motion } from 'framer-motion';
import { Camera, Clock, Truck, BarChart } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const steps = [
  { icon: Camera, title: 'Photographiez vos invendus', description: "L'IA remplit automatiquement les informations" },
  { icon: Clock, title: "Définissez l'heure de récupération", description: 'Choisissez quand la récupération doit avoir lieu' },
  { icon: Truck, title: 'On récupère et distribue', description: "EcoPanier s'occupe de la logistique de récupération" },
  { icon: BarChart, title: 'Suivez votre impact', description: 'Dashboard avec statistiques en temps réel' },
];

export const RestaurantHowItWorksSection = () => {
  return (
    <PageSection background="subtle" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Simple et rapide"
          description="4 étapes pour transformer vos invendus en impact solidaire"
        />

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface flex flex-col items-center gap-4 p-6 text-center"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white shadow-md">
                  {index + 1}
                </div>
                <Icon className="h-8 w-8 text-primary-600" strokeWidth={1.5} />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-sm text-neutral-600">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

