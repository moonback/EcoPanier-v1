import { motion, Variants } from 'framer-motion';
import { Check, Heart, QrCode, Shield, Users } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const solidarityFeatures = [
  {
    icon: Heart,
    title: 'Un geste simple',
    description: 'Ajoutez un panier suspendu lors de votre achat. En quelques clics, vous aidez directement une personne dans le besoin.',
  },
  {
    icon: Users,
    title: 'Impact mesurable',
    description: 'Suivez dans votre tableau de bord le nombre de paniers offerts et l\'impact de vos gestes.',
  },
  {
    icon: Shield,
    title: 'Dignité garantie',
    description: 'Les bénéficiaires retirent les paniers exactement comme vous : même QR code, aucune distinction.',
  },
  {
    icon: QrCode,
    title: 'Traçabilité complète',
    description: 'Chaque panier est tracé de l\'offre à la distribution. Vous savez où va votre don.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export const SolidarityModelSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-14">
        <SectionHeader
          eyebrow="Solidarité intégrée"
          title="Offrez un panier suspendu"
          description="Inspiré du « caffè sospeso » italien, offrez un panier en plus du vôtre à une personne dans le besoin."
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="surface space-y-6 p-8"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-neutral-900">
                Comment ça marche ?
              </h3>
              <p className="text-base leading-relaxed text-neutral-600">
                Lors de votre achat, ajoutez un panier suspendu. Ce panier sera offert à une personne dans le besoin, référencée par une association partenaire. Le bénéficiaire le retire comme n'importe quel client, en toute dignité.
              </p>
              <p className="text-base leading-relaxed text-neutral-600">
                Suivez l'impact de vos dons dans votre tableau de bord : paniers offerts, repas partagés, et impact solidaire.
              </p>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-semibold text-success-700"
            >
              <Check className="h-4 w-4" />
              Programme déployé dans nos pilotes 2025
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {solidarityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="surface h-full space-y-3 p-6 transition-shadow hover:shadow-md"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring' }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <h4 className="text-base font-semibold text-neutral-900">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-neutral-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageSection>
  );
};

