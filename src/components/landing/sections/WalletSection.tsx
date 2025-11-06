import { motion } from 'framer-motion';
import { Wallet, CreditCard, Shield, TrendingUp, Zap, Lock } from 'lucide-react';

import { PageSection } from '../../shared/layout/PageSection';
import { SectionHeader } from '../../shared/layout/SectionHeader';

const walletFeatures = [
  {
    icon: Zap,
    title: 'Recharge instantanée',
    description: 'Rechargez votre portefeuille en quelques clics. Paiement sécurisé par carte bancaire ou virement.',
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    icon: Shield,
    title: 'Sécurité garantie',
    description: 'Vos transactions sont cryptées et sécurisées. Vos données bancaires ne sont jamais stockées.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'Suivi en temps réel',
    description: 'Consultez votre solde et l\'historique de vos transactions à tout moment depuis votre profil.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: CreditCard,
    title: 'Paiements simplifiés',
    description: 'Payez vos paniers directement depuis votre portefeuille. Plus besoin de ressaisir vos informations.',
    color: 'text-purple-600 bg-purple-50',
  },
];

const benefits = [
  'Recharge rapide et sécurisée en quelques clics',
  'Suivi détaillé de toutes vos transactions',
  'Paiement simplifié pour vos réservations',
  'Remboursements automatiques en cas d\'annulation',
  'Alerte de solde faible pour ne jamais manquer',
];

export const WalletSection = () => {
  return (
    <PageSection background="subtle">
      <div className="flex flex-col gap-12">
        <SectionHeader
          align="center"
          eyebrow="Portefeuille intégré"
          title="Payez facilement avec votre portefeuille ÉcoPanier"
          description="Rechargez votre portefeuille en un clic et payez vos paniers en toute simplicité. Sécurisé, transparent et toujours à portée de main."
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
          className="surface relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-primary-100 p-8 md:p-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/20 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
                <Wallet className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-semibold text-neutral-900">
                  Pourquoi utiliser le portefeuille ÉcoPanier ?
                </h3>
                <p className="text-sm text-neutral-600">
                  Un portefeuille intégré pour simplifier vos paiements et gérer vos transactions en toute transparence.
                </p>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-3 text-sm text-neutral-700"
                >
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                    <Lock className="h-3 w-3" />
                  </div>
                  <span className="leading-relaxed">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </PageSection>
  );
};

