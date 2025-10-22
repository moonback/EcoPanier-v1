import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export const MerchantPricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Tarification simple et transparente
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Aucun frais d'inscription, aucun abonnement
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Badge "Populaire" */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            <div className="inline-flex items-center gap-2 bg-secondary-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              <span>⭐</span>
              <span>Offre de lancement</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary-50 to-white rounded-3xl p-12 border-2 border-secondary-200 shadow-xl">
            <div className="text-center mb-12">
              <div className="text-6xl font-bold text-black mb-2">
                0€
              </div>
              <div className="text-xl text-gray-600 font-light">
                d'inscription et d'abonnement
              </div>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Commission par vente</span>
                  <span className="text-3xl font-bold text-secondary-600">15%</span>
                </div>
                <p className="text-sm text-gray-500">
                  Prélevée uniquement sur les ventes réalisées. Pas de vente = pas de frais.
                </p>
              </div>

              <div className="bg-success-50 rounded-xl p-6 border border-success-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-gray-900 font-semibold">Exemple concret</span>
                </div>
                <p className="text-gray-700 text-sm">
                  Vous vendez un lot à <strong>10€</strong> → Vous recevez <strong>8,50€</strong> dans votre compte.
                </p>
              </div>
            </div>

            {/* Inclus dans l'offre */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-black mb-6 text-center">
                Tout est inclus, sans limite
              </h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  'Création de lots illimitée',
                  'Interface complète et intuitive',
                  'IA d\'analyse d\'image',
                  'Statistiques en temps réel',
                  'QR code pour validation',
                  'Notifications instantanées',
                  'Support client dédié',
                  'Visibilité sur la carte',
                  'Export de données',
                  'Virement automatique hebdomadaire'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-success-600" strokeWidth={3} />
                    </div>
                    <span className="text-gray-700 font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/auth?role=merchant')}
                className="group inline-flex items-center justify-center gap-3 bg-secondary-600 text-white px-10 py-5 rounded-xl text-lg font-medium hover:bg-secondary-700 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Sans engagement • Gratuit à vie • Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

