import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const benefits = [
  {
    title: 'Création ultra-rapide',
    items: [
      'IA EcoPanier : fiches complètes générées en 30 secondes',
      'Formulaire express adapté mobile & desktop',
      'Prévisualisation et validation avant publication',
    ],
  },
  {
    title: 'Gestion simplifiée',
    items: [
      'Station de retrait intégrée (QR + PIN)',
      'Notifications temps réel pour chaque commande',
      'Vue agenda des retraits et stocks restants',
    ],
  },
  {
    title: 'Modèle transparent',
    items: [
      'Inscription gratuite & commission unique de 8 %',
      'Plan Premium illimité à 29,90 €/mois, activable à la demande',
      'Virements automatiques et exports comptables inclus',
    ],
  },
  {
    title: 'Impact & visibilité',
    items: [
      'Profil vérifié mis en avant sur la carte ÉcoPanier',
      'Statistiques d’impact environnemental en direct',
      'Kit de communication clé en main pour votre boutique',
    ],
  },
];

export const MerchantBenefitsSection = () => {
  return (
    <PageSection background="default">
      <div className="flex flex-col gap-10">
        <SectionHeader
          align="center"
          eyebrow="Fonctionnalités clés"
          title="Tout ce dont vous avez besoin pour réussir"
          description="Des outils simples pour gagner du temps, sécuriser vos ventes et piloter votre impact."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="surface h-full space-y-5 p-6"
            >
              <h3 className="text-base font-semibold text-neutral-900">{benefit.title}</h3>
              <ul className="space-y-3">
                {benefit.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-neutral-600">
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success-100 text-success-600">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </PageSection>
  );
};

