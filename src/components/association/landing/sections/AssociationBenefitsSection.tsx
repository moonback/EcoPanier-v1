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
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dégradé de fond */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-5 py-2.5 rounded-full font-bold border border-purple-200 mb-6 shadow-sm"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            <span>Avantages</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Des{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 animate-gradient">
              avantages concrets
            </span>
            <br />
            pour votre association
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            Tout ce dont vous avez besoin pour gérer efficacement votre programme d'aide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] as const
              }}
              whileHover={{ y: -8 }}
              className="group h-full"
            >
              <div className="h-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-purple-200 overflow-hidden relative">
                {/* Effet de fond au hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 group-hover:text-purple-600 transition-colors relative z-10 leading-tight">
                  {benefit.title}
                </h3>
                <ul className="space-y-4 relative z-10">
                  {benefit.items.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-0.5 shadow-lg">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-base text-gray-700 font-medium leading-relaxed">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Ligne décorative */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 origin-left"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

