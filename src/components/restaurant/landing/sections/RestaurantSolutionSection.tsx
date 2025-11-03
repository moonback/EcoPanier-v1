import { motion } from 'framer-motion';
import { CheckCircle, Truck, Users, Package } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const solutions = [
  {
    icon: Package,
    title: 'Vous créez vos lots',
    description: 'En 2 minutes, ajoutez vos invendus sur la plateforme (avec IA pour vous aider)',
  },
  {
    icon: Truck,
    title: "On s'occupe de la logistique",
    description: 'Nos collecteurs récupèrent et livrent aux associations partenaires',
  },
  {
    icon: Users,
    title: 'Distribution aux bénéficiaires',
    description: 'Vos repas sont distribués en toute dignité aux personnes dans le besoin',
  },
  {
    icon: CheckCircle,
    title: 'Impact mesuré',
    description: "Suivez en temps réel l'impact de vos dons (repas sauvés, CO₂ évité)",
  },
];

export const RestaurantSolutionSection = () => {
  return (
    <PageSection background="default" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="EcoPanier s'occupe de tout"
          description="De la création du lot à la distribution : une solution clé en main pour valoriser vos invendus"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="surface h-full space-y-4 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-neutral-900">{solution.title}</h3>
                  <p className="text-sm text-neutral-600">{solution.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

