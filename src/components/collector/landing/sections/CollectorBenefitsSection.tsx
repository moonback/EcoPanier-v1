import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  {
    title: 'Inscription gratuite',
    items: [
      'Aucun frais d\'inscription',
      'Pas d\'abonnement mensuel',
      'Validation rapide du profil',
      'Accès immédiat aux missions'
    ]
  },
  {
    title: 'Paiements sécurisés',
    items: [
      'Virement automatique hebdomadaire',
      'Suivi des gains en temps réel',
      'Factures automatiques',
      'Pas de frais cachés'
    ]
  },
  {
    title: 'Support dédié',
    items: [
      'Équipe disponible 7j/7',
      'Formation à la plateforme',
      'Assistance technique',
      'Conseils pour optimiser vos gains'
    ]
  },
  {
    title: 'Flexibilité totale',
    items: [
      'Horaires libres',
      'Zones géographiques choisies',
      'Acceptation libre des missions',
      'Arrêt possible à tout moment'
    ]
  }
];

export const CollectorBenefitsSection = () => {
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
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-medium mb-6">
            <span className="text-lg">✅</span>
            <span>Avantages collecteurs</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            Des avantages concrets
            <br />
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              pour vous
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Tout ce dont vous avez besoin pour réussir en tant que collecteur
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gray-50 rounded-2xl p-8 hover:bg-success-50 transition-all">
                <h3 className="text-xl font-bold text-black mb-6 group-hover:text-success-600 transition-colors">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-success-600" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 font-light text-sm leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
