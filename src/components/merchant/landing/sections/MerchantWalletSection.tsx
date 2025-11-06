import { motion } from 'framer-motion';
import { Wallet, ArrowDownCircle, TrendingUp, CreditCard, Shield, Clock } from 'lucide-react';

import { PageSection } from '../../../shared/layout/PageSection';
import { SectionHeader } from '../../../shared/layout/SectionHeader';

const walletFeatures = [
  {
    icon: TrendingUp,
    title: 'Paiements automatiques',
    description: 'Recevez vos paiements directement sur votre portefeuille dès la confirmation de réception par le client.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: ArrowDownCircle,
    title: 'Virements simplifiés',
    description: 'Demandez un virement vers votre compte bancaire quand vous le souhaitez. Minimum 100€, traité sous 48h.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Sécurité bancaire',
    description: 'Gérez vos comptes bancaires en toute sécurité. IBAN crypté et conforme aux normes bancaires.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: Clock,
    title: 'Suivi en temps réel',
    description: 'Consultez vos revenus, vos transactions et vos demandes de virement depuis votre dashboard.',
    color: 'text-orange-600 bg-orange-50',
  },
];

const benefits = [
  'Paiements automatiques dès confirmation de réception',
  'Virements hebdomadaires ou à la demande',
  'Gestion sécurisée de vos comptes bancaires',
  'Historique détaillé de tous vos revenus',
  'Commission claire et transparente (8%)',
  'Export comptable pour votre gestion',
];

export const MerchantWalletSection = () => {
  return (
    <PageSection background="subtle">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          eyebrow="Portefeuille commerçant"
          title="Recevez vos revenus en toute simplicité"
          description="Un portefeuille intégré pour recevoir vos paiements automatiquement et gérer vos revenus. Transparent, sécurisé et flexible."
        />

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            staggerChildren: 0.15,
            delayChildren: 0.1,
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {walletFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="surface h-full space-y-4 p-6 transition-shadow hover:shadow-md"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Benefits Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="surface relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-success-50 to-success-100 p-8 md:p-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-success-200/20 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-success-300/20 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-success-600 text-white shadow-lg">
                <Wallet className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-semibold text-neutral-900">
                  Comment fonctionne le portefeuille commerçant ?
                </h3>
                <p className="text-sm text-neutral-600">
                  Recevez vos revenus automatiquement, gérez vos comptes bancaires et effectuez des virements quand vous le souhaitez.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-4 text-lg font-semibold text-neutral-900">Fonctionnalités</h4>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-start gap-3 text-sm text-neutral-700"
                    >
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-600 text-white">
                        <CreditCard className="h-3 w-3" />
                      </div>
                      <span className="leading-relaxed">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-success-200 bg-white p-6">
                <h4 className="mb-4 text-lg font-semibold text-neutral-900">Exemple de paiement</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Vente d'un lot</span>
                    <span className="font-medium text-neutral-900">20,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Commission (8%)</span>
                    <span className="font-medium text-red-600">-1,60 €</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-900">Montant reçu</span>
                      <span className="text-lg font-bold text-success-600">18,40 €</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-neutral-500">
                    Le paiement arrive sur votre portefeuille dès que le client confirme la réception du lot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageSection>
  );
};

