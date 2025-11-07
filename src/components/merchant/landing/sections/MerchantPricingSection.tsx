import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Crown, Infinity } from 'lucide-react';

const ESSENTIAL_FEATURES = [
  'Jusqu’à 20 lots publiés par jour',
  'Analyse IA standard (titres, prix, catégories)',
  'Station de retrait QR code',
  'Paiements sécurisés via portefeuille',
  'Support client dédié',
  'Visibilité sur la carte ÉcoPanier'
];

const PREMIUM_FEATURES = [
  'Lots illimités et quotas levés',
  'Insights IA avancés : DLC, fraîcheur, titres optimisés',
  'Créneaux de retrait suggérés automatiquement',
  'Priorité sur la mise en avant locale',
  'Statistiques enrichies & exports détaillés',
  'Support prioritaire par chat & téléphone'
];

export const MerchantPricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Deux offres complémentaires
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Lancez-vous gratuitement, puis activez l’abonnement illimité quand votre activité accélère.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          {/* Plan Essentiel */}
          <div className="relative">
            <div className="bg-gradient-to-br from-neutral-50 via-white to-neutral-100 rounded-3xl p-10 border border-neutral-200 shadow-lg h-full flex flex-col">
              <div>
                <p className="uppercase text-xs tracking-[0.35em] text-neutral-500 mb-4">Plan Essentiel</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-black">0€</span>
                  <span className="text-neutral-500 text-base font-medium">/ mois</span>
                </div>
                <p className="text-neutral-600 mt-2">
                  Aucun frais fixe. Une commission transparente de <strong>8%</strong> sur les ventes réalisées.
                </p>
              </div>

              <div className="mt-10 space-y-4 flex-1">
                {ESSENTIAL_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-success-600" strokeWidth={3} />
                    </div>
                    <span className="text-neutral-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <button
                  onClick={() => navigate('/auth?role=merchant')}
                  className="group inline-flex w-full items-center justify-center gap-3 bg-secondary-600 text-white px-10 py-4 rounded-xl text-lg font-medium hover:bg-secondary-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-neutral-500 mt-4 text-center">
                  Sans engagement • Aucune carte bancaire requise
                </p>
              </div>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                <span>🚀</span>
                <span>Illimité & IA avancée</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 text-white shadow-2xl border border-primary-500 h-full flex flex-col">
              <div>
                <p className="uppercase text-xs tracking-[0.35em] text-primary-100 mb-4">Plan Premium</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold">29,90€</span>
                  <span className="text-primary-100 text-base font-medium">/ mois</span>
                </div>
                <p className="text-primary-50 mt-2">
                  Activez-le via votre portefeuille marchand. Résiliable à tout moment, sans engagement.
                </p>
              </div>

              <div className="mt-10 space-y-4 flex-1">
                {PREMIUM_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-base leading-relaxed text-white/90">{feature}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-4">
                  <div className="flex-shrink-0">
                    <Infinity className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Lots illimités</p>
                    <p className="text-sm text-white/80">
                      Publiez autant de paniers que nécessaire, sans plafond quotidien. Idéal pour les commerces avec de gros volumes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={() => navigate('/auth?role=merchant')}
                  className="group inline-flex w-full items-center justify-center gap-3 bg-white text-primary-700 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Rejoindre ÉcoPanier</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-white/80 mt-4 text-center">
                  Souscription et paiement gérés depuis le Portefeuille commerçant.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

