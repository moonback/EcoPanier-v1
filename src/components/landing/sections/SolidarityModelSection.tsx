import { motion } from 'framer-motion';
import { Check, Heart, QrCode, Shield, Users } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const solidarityFeatures = [
  {
    icon: Heart,
    title: 'Un geste simple et direct',
    description: 'Ajoutez un panier suspendu lors de votre achat. En quelques clics, vous soutenez directement une personne dans le besoin.',
  },
  {
    icon: Users,
    title: 'Impact visible et mesurable',
    description: 'Suivez dans votre tableau de bord le nombre de paniers offerts, de repas partagés et l\'impact solidaire de vos gestes.',
  },
  {
    icon: Shield,
    title: 'Dignité garantie',
    description: 'Les bénéficiaires retirent les paniers suspendus exactement comme vous : même QR code, même parcours, aucune distinction.',
  },
  {
    icon: QrCode,
    title: 'Traçabilité complète',
    description: 'Chaque panier suspendu est tracé de l\'offre à la distribution. Vous savez où va votre don et son impact réel.',
  },
];

export const SolidarityModelSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-14">
        <SectionHeader
          eyebrow="Solidarité intégrée"
          title="Offrez un panier suspendu, créez du lien dans votre quartier"
          description="Inspiré du « caffè sospeso » italien, offrez un panier en plus du vôtre à une personne dans le besoin. Un geste simple qui fait la différence."
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="surface space-y-6 p-8"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-neutral-900">
                Comment offrir un panier suspendu ?
              </h3>
              <p className="text-base leading-relaxed text-neutral-600">
                Lors de votre achat, vous pouvez choisir d'ajouter un panier suspendu. Ce panier sera offert à une personne dans le besoin, référencée par une association partenaire. Le bénéficiaire pourra le réserver et le retirer comme n'importe quel client, en toute dignité.
              </p>
              <p className="text-base leading-relaxed text-neutral-600">
                Vous suivez l'impact de vos dons dans votre tableau de bord personnel : nombre de paniers offerts, repas partagés, et impact solidaire de vos gestes.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-semibold text-success-700">
              <Check className="h-4 w-4" />
              Programme déployé dans nos pilotes 2025
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {solidarityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="surface h-full space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900">{feature.title}</h4>
                  <p className="text-sm leading-relaxed text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageSection>
  );
};

