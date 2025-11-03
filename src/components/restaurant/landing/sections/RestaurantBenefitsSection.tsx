import { motion } from 'framer-motion';
import { Leaf, Heart, TrendingUp, Shield, Award, Zap, Box } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const benefits = [
  { icon: Leaf, title: 'Zéro gaspillage', description: '100% de vos invendus valorisés' },
  { icon: Box, title: 'Lockers EcoPanier', description: 'Pas de stockage ? Déposez vos invendus dans le locker le plus proche, disponible 24/7' },
  { icon: Heart, title: 'Impact solidaire', description: 'Aidez les plus précaires de votre quartier' },
  { icon: TrendingUp, title: 'Image renforcée', description: 'Montrez votre engagement RSE' },
  { icon: Shield, title: 'Conformité légale', description: 'Respectez la loi anti-gaspillage' },
  { icon: Award, title: 'Visibilité locale', description: 'Soyez mis en avant sur notre plateforme' },
  { icon: Zap, title: 'Simple et gratuit', description: 'Aucun coût, aucun engagement' },
];

export const RestaurantBenefitsSection = () => {
  return (
    <PageSection background="default" padding="lg">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          title="Vos avantages"
          description="Au-delà de l'impact solidaire, rejoignez EcoPanier pour"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
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
                  <h3 className="text-base font-semibold text-neutral-900">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageSection>
  );
};

