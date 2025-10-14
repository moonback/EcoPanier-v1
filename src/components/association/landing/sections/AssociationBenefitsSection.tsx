import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  {
    title: 'Inscription rapide',
    items: [
      'Enregistrement d\'un bénéficiaire en 5 minutes',
      'Génération automatique d\'un ID unique',
      'QR code instantané pour le retrait',
      'Validation immédiate'
    ]
  },
  {
    title: 'Suivi complet',
    items: [
      'Historique de tous les retraits',
      'Statistiques détaillées par bénéficiaire',
      'Alertes automatiques (limite atteinte)',
      'Vue d\'ensemble de l\'activité'
    ]
  },
  {
    title: 'Conformité RGPD',
    items: [
      'Données sécurisées et cryptées',
      'Gestion des consentements',
      'Droit à l\'oubli intégré',
      'Conformité totale aux régulations'
    ]
  },
  {
    title: 'Support dédié',
    items: [
      'Accompagnement à l\'inscription',
      'Formation à la plateforme',
      'Équipe disponible 7j/7',
      'Documentation complète'
    ]
  }
];

export const AssociationBenefitsSection = () => {
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
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Des avantages concrets pour votre association
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Tout ce dont vous avez besoin pour gérer efficacement votre programme d'aide
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
              <div className="h-full bg-gray-50 rounded-2xl p-8 hover:bg-purple-50 transition-all">
                <h3 className="text-xl font-bold text-black mb-6 group-hover:text-purple-600 transition-colors">
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

