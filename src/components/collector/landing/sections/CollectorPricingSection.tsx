import { motion } from 'framer-motion';
import { CheckCircle, Euro, Clock } from 'lucide-react';

export const CollectorPricingSection = () => {
  const pricingFeatures = [
    '7€ par livraison effectuée',
    'Paiement hebdomadaire automatique',
    'Pas de frais d\'inscription',
    'Pas d\'abonnement mensuel',
    'Assurance incluse',
    'Support technique 7j/7'
  ];

  const earnings = [
    { period: 'Par jour', amount: '21€', description: '3 x 7 € (3 livraisons)' },
    { period: 'Par semaine', amount: '147€', description: '21 x 7 € (21 livraisons)' },
    { period: 'Par mois', amount: '630€', description: '90 x 7 € (90 livraisons)' }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-success-50 text-success-700 px-4 py-2 rounded-full font-medium mb-6">
            <Euro className="w-5 h-5" />
            <span>Tarification transparente</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Des revenus clairs
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              et prévisibles
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Une rémunération fixe par livraison, sans surprise ni frais cachés
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Tarification */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-success-50 to-white rounded-3xl p-10 border-2 border-success-200">
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-success-600 mb-2">7€</div>
                <div className="text-xl text-gray-600 font-light">par livraison</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {pricingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-gray-700 font-light">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-success-100 rounded-xl p-6 text-center">
                <div className="text-lg font-semibold text-success-800 mb-2">
                  💡 Exemple de gains
                </div>
                <div className="text-sm text-success-700">
                  2-3 livraisons par jour = 300-450€ par mois
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projections de gains */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-black mb-8 text-center">
              Projections de gains
            </h3>
            
            {earnings.map((earning, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-success-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-black">{earning.amount}</div>
                    <div className="text-sm text-gray-600">{earning.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{earning.description}</div>
                    <div className="text-xs text-success-600 font-medium">Gains estimés</div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <div className="text-lg font-semibold text-primary-800 mb-2">
                Horaires flexibles
              </div>
              <div className="text-sm text-primary-700">
                Travaillez quand vous voulez, adaptez vos livraisons à votre emploi du temps
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
