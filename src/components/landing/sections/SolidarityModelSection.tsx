import { motion } from 'framer-motion';
import { Check, Heart, QrCode, Shield, Users } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const solidarityFeatures = [
  {
    icon: Users,
    title: 'Deux paniers solidaires par jour',
    description: 'Un plafond clair pour garantir un partage équitable entre bénéficiaires accompagnés par nos associations partenaires.',
  },
  {
    icon: QrCode,
    title: 'Même parcours de retrait',
    description: 'QR code + code PIN identiques aux clients payants. Aucune file dédiée, pas de signe distinctif au comptoir.',
  },
  {
    icon: Shield,
    title: 'Dignité et confidentialité',
    description: 'Les commerçants ne voient que le statut de retrait. Les associations gèrent l’éligibilité côté back-office.',
  },
  {
    icon: Heart,
    title: 'Traçabilité transparente',
    description: 'Tableaux de bord temps réel pour suivre les paniers offerts, consommés et l’impact social local.',
  },
];

export const SolidarityModelSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-14">
        <SectionHeader
          eyebrow="Solidarité intégrée"
          title="Un programme d’aide alimentaire digne et simple à opérer"
          description="Le dispositif des paniers solidaires est directement intégré dans la plateforme. Commerçants, collecteurs, associations et bénéficiaires partagent les mêmes outils, sans stigmatisation."
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
                Comment fonctionne un panier solidaire ?
              </h3>
              <p className="text-base leading-relaxed text-neutral-600">
                Les commerçants créent des paniers dédiés, financés soit par la communauté (paniers suspendus), soit par leurs propres dons. Les bénéficiaires référencés par les associations voisines réservent via leur espace sécurisé et retirent le panier comme n’importe quel client.
              </p>
              <p className="text-base leading-relaxed text-neutral-600">
                Chaque étape est tracée dans la plateforme afin de mesurer l’usage réel, éviter les abus et simplifier la coordination entre acteurs locaux.
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

